import { LitElement, html, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, JkBmsReactorCardConfig, PackState } from './types';
import { computePackState, formatNumber, getNumericValue } from './ha_state';
import { styles } from './styles';

export class JkBmsReactorCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: JkBmsReactorCardConfig;

  @state() private _cellFlowDotRx = 4;
  @state() private _cellFlowDotRy = 4;

  @state() private _flowLineY = 90;

  private _resizeObserver?: ResizeObserver;

  @state() private _copyHint: string | null = null;
  private _copyHintTimer?: number;

  private _lastCellFlow:
    | {
      d: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      c1: string;
      c2: string;
    }
    | null = null;
  private _pendingCellFlow:
    | {
      d: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      c1: string;
      c2: string;
    }
    | null = null;

  private _uid = Math.random().toString(36).slice(2, 9);

  private _history = {
    voltage: [] as number[],
    current: [] as number[],
    power: [] as number[],
    delta: [] as number[],
  };

  private _historyByEntity: Record<string, number[]> = {};

  private _lastSampleTs = 0;
  private _sampleIntervalMs = 2000;
  private _historyMax = 60;
  private _historySeeded = false;
  private _analyticsLoaded = false;
  private _analyticsLastTs = 0;
  private _analyticsChargeKwh = 0;
  private _analyticsDischargeKwh = 0;
  private _dodSessions: number[] = [];
  private _dischargeSession:
    | {
      startTs: number;
      startSoc: number;
      lastSoc: number;
    }
    | null = null;
  private _dischargeActiveMs = 0;

  static get styles() {
    return styles;
  }

  protected firstUpdated() {
    this._resizeObserver = new ResizeObserver(() => {
      this._updateCellFlowDotRadii();
      this._updateFlowLineY();
    });
    this._resizeObserver.observe(this);
    this._updateCellFlowDotRadii();
    this._updateFlowLineY();
    this._loadAnalytics();
  }

  private _analyticsStorageKey(): string {
    const c = this._config;
    const base = [c.pack_voltage, c.current, c.soc, c.cells_prefix ?? '', String(c.cells_count ?? ''), (c.cells ?? []).join('|')].join('::');
    return `jk_bms_reactor_analytics::${base}`;
  }

  private _loadAnalytics() {
    if (this._analyticsLoaded) return;
    this._analyticsLoaded = true;
    try {
      const raw = window.localStorage.getItem(this._analyticsStorageKey());
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (Number.isFinite(parsed.chargeKwh)) this._analyticsChargeKwh = parsed.chargeKwh;
        if (Number.isFinite(parsed.dischargeKwh)) this._analyticsDischargeKwh = parsed.dischargeKwh;
        if (Array.isArray(parsed.dodSessions)) {
          this._dodSessions = parsed.dodSessions.filter((x: any) => Number.isFinite(x) && x >= 0 && x <= 100).slice(-200);
        }
      }
    } catch {
      // ignore
    }
  }

  private _persistAnalytics() {
    try {
      const payload = {
        chargeKwh: this._analyticsChargeKwh,
        dischargeKwh: this._analyticsDischargeKwh,
        dodSessions: this._dodSessions,
        ts: Date.now(),
      };
      window.localStorage.setItem(this._analyticsStorageKey(), JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  private _firstExistingEntityId(ids: Array<string | undefined | null>): string | null {
    for (const id of ids) {
      const entityId = (id ?? '').trim();
      if (!entityId) continue;
      if (this.hass?.states && this.hass.states[entityId]) return entityId;
    }
    return null;
  }

  private _getAnalyticsSoc(): number | null {
    const entityId = this._firstExistingEntityId([
      this._config.analytics_soc,
      this._config.soc,
      'sensor.main_mainbms_soc',
    ]);
    return entityId ? getNumericValue(this.hass, entityId) : null;
  }

  private _updateAnalytics(packState: PackState) {
    if (!this.hass || !this._config) return;
    this._loadAnalytics();

    const now = Date.now();
    const last = this._analyticsLastTs;
    this._analyticsLastTs = now;
    if (!last) return;

    const dt = now - last;
    // Avoid integrating across long gaps (reloads/sleep).
    if (dt <= 0 || dt > 10 * 60 * 1000) return;

    const v = packState.voltage;
    const a = packState.current;
    if (v === null || a === null) return;

    const powerW = (v as number) * (a as number);
    const dischargeW = Math.max(-powerW, 0); // current<0 => discharge => powerW negative
    const chargeW = Math.max(powerW, 0);

    // Only integrate if no direct HA totals are configured/present.
    const directChargeId = this._firstExistingEntityId([
      this._config.analytics_charge_energy_total_kwh,
      'sensor.main_mainbms_charge_energy_total_kwh',
    ]);
    const directDischargeId = this._firstExistingEntityId([
      this._config.analytics_discharge_energy_total_kwh,
      'sensor.main_mainbms_discharge_energy_total_kwh',
    ]);
    const hasDirectCharge = !!directChargeId;
    const hasDirectDischarge = !!directDischargeId;

    const kwh = (w: number) => (w * dt) / 3_600_000 / 1000;
    if (!hasDirectDischarge) this._analyticsDischargeKwh += kwh(dischargeW);
    if (!hasDirectCharge) this._analyticsChargeKwh += kwh(chargeW);

    // Discharge session tracking for Avg DoD
    const minI = Number.isFinite(this._config.min_current_for_session_a)
      ? (this._config.min_current_for_session_a as number)
      : 2;
    const minSessionSeconds = Number.isFinite(this._config.min_session_seconds)
      ? (this._config.min_session_seconds as number)
      : 120;
    const windowN = Number.isFinite(this._config.dod_sessions_window)
      ? Math.max(1, Math.min(200, this._config.dod_sessions_window as number))
      : 30;

    const soc = this._getAnalyticsSoc();
    const discharging = (a as number) <= -Math.abs(minI);

    if (discharging) {
      this._dischargeActiveMs += dt;
      if (this._dischargeSession === null) {
        if (soc !== null && Number.isFinite(soc)) {
          this._dischargeSession = { startTs: now, startSoc: soc, lastSoc: soc };
        }
      } else {
        if (soc !== null && Number.isFinite(soc)) this._dischargeSession.lastSoc = soc;
      }
    } else {
      // End session
      if (this._dischargeSession && this._dischargeActiveMs >= minSessionSeconds * 1000) {
        const start = this._dischargeSession.startSoc;
        const end = this._dischargeSession.lastSoc;
        if (Number.isFinite(start) && Number.isFinite(end) && start > end) {
          const dod = Math.max(0, Math.min(100, start - end));
          if (dod > 0.1) {
            this._dodSessions = [...this._dodSessions, dod].slice(-windowN);
          }
        }
      }
      this._dischargeSession = null;
      this._dischargeActiveMs = 0;
    }

    // Persist occasionally
    if (now % 10_000 < dt) {
      this._persistAnalytics();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;

    if (this._copyHintTimer) {
      window.clearTimeout(this._copyHintTimer);
      this._copyHintTimer = undefined;
    }

    if (this._analyticsLoaded) {
      this._persistAnalytics();
    }
  }

  private _setCopyHint(msg: string | null) {
    this._copyHint = msg;
    if (this._copyHintTimer) window.clearTimeout(this._copyHintTimer);
    if (msg) {
      this._copyHintTimer = window.setTimeout(() => {
        this._copyHint = null;
        this._copyHintTimer = undefined;
      }, 1400);
    }
  }

  private async _writeClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for environments where Clipboard API is unavailable/blocked.
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', 'true');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.left = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  private _formatSnapshot(packState: PackState): string {
    const now = new Date();
    const voltage = packState.voltage;
    const current = packState.current;
    const power = (voltage ?? 0) * (current ?? 0);

    const delta = packState.delta;
    const minV = packState.minCell;
    const maxV = packState.maxCell;

    const eps = 0.0005;
    const minIdx = (minV === null) ? [] : packState.cells
      .filter(c => Math.abs(c.voltage - minV) <= eps)
      .map(c => c.index + 1);
    const maxIdx = (maxV === null) ? [] : packState.cells
      .filter(c => Math.abs(c.voltage - maxV) <= eps)
      .map(c => c.index + 1);

    const cellsCsv = packState.cells
      .slice()
      .sort((a, b) => a.index - b.index)
      .map(c => formatNumber(c.voltage, 3))
      .join(',');

    const cellLines = packState.cells
      .slice()
      .sort((a, b) => a.index - b.index)
      .map(c => `Cell ${c.index + 1}: ${formatNumber(c.voltage, 3)} V${c.isBalancing ? ' (balancing)' : ''}`)
      .join('\n');

    const sign = power >= 0 ? '+' : '';
    return [
      `JK BMS Snapshot (${now.toISOString()})`,
      `Pack Voltage: ${formatNumber(voltage, 2)} V`,
      `Current: ${formatNumber(current, 2)} A`,
      `Power: ${sign}${formatNumber(power, 1)} W (abs ${formatNumber(Math.abs(power), 1)} W)`,
      `SOC: ${formatNumber(packState.soc, 0)} %`,
      `Delta: ${formatNumber(delta, 3)} V`,
      `Min Cell: ${formatNumber(minV, 3)} V${minIdx.length ? ` (cells ${minIdx.join(', ')})` : ''}`,
      `Max Cell: ${formatNumber(maxV, 3)} V${maxIdx.length ? ` (cells ${maxIdx.join(', ')})` : ''}`,
      packState.isBalancing && packState.balanceCurrent !== null
        ? `Balance Current: ${formatNumber(packState.balanceCurrent, 2)} A`
        : `Balance Current: -`,
      '',
      `Cells CSV (V): ${cellsCsv}`,
      '',
      'Cells:',
      cellLines,
      '',
    ].join('\n');
  }

  private async _copySnapshot(packState: PackState) {
    const text = this._formatSnapshot(packState);
    const ok = await this._writeClipboard(text);
    this._setCopyHint(ok ? 'Copied' : 'Copy failed');
  }

  private _updateCellFlowDotRadii(desiredPxRadius = 4) {
    const el = this.renderRoot?.querySelector('.cell-flow-svg') as SVGElement | null;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const vb = el.getAttribute('viewBox') ?? '';
    const parts = vb.split(/\s+/).map(Number);
    if (parts.length !== 4 || parts.some(v => !Number.isFinite(v))) return;
    const vbW = parts[2];
    const vbH = parts[3];
    if (vbW <= 0 || vbH <= 0) return;

    const sx = rect.width / vbW;
    const sy = rect.height / vbH;
    if (!Number.isFinite(sx) || !Number.isFinite(sy) || sx <= 0 || sy <= 0) return;

    // Allow large radii in SVG units so the on-screen dot can stay circular
    // even when the connector column becomes very narrow (sx is tiny).
    const rx = Math.max(0.5, Math.min(200, desiredPxRadius / sx));
    const ry = Math.max(0.5, Math.min(200, desiredPxRadius / sy));

    if (Math.abs(rx - this._cellFlowDotRx) > 0.05 || Math.abs(ry - this._cellFlowDotRy) > 0.05) {
      this._cellFlowDotRx = rx;
      this._cellFlowDotRy = ry;
    }
  }

  private _updateFlowLineY() {
    const flow = this.renderRoot?.querySelector('.flow-section') as HTMLElement | null;
    const svgEl = this.renderRoot?.querySelector('svg.flow-svg') as SVGSVGElement | null;
    const chargeIcon = this.renderRoot?.querySelector('.flow-section .flow-node:first-of-type .icon-circle') as HTMLElement | null;
    const loadIcon = this.renderRoot?.querySelector('.flow-section .flow-node:last-of-type .icon-circle') as HTMLElement | null;
    const ring = this.renderRoot?.querySelector('.reactor-ring-container') as HTMLElement | null;

    if (!flow || !svgEl || !chargeIcon || !loadIcon || !ring) return;

    const flowRect = flow.getBoundingClientRect();
    if (!flowRect.height) return;

    const cy = (el: Element) => {
      const r = el.getBoundingClientRect();
      return (r.top + r.height / 2) - flowRect.top;
    };

    // Average keeps the line horizontal while aligning well.
    const avgY = (cy(chargeIcon) + cy(ring) + cy(loadIcon)) / 3;
    const y = Math.max(0, Math.min(180, (avgY / flowRect.height) * 180));
    if (Number.isFinite(y) && Math.abs(y - this._flowLineY) > 0.4) {
      this._flowLineY = y;
    }
  }

  public setConfig(config: JkBmsReactorCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    // Set defaults - don't throw errors for missing entities
    // This allows the card to render in edit mode and show placeholders
    this._config = {
      ...config,
      // Apply defaults only if not provided
      pack_voltage: config.pack_voltage ?? '',
      current: config.current ?? '',
      soc: config.soc ?? '',
      cells_prefix: config.cells_prefix ?? 'sensor.jk_bms_cell_',
      cells_count: config.cells_count ?? 16,
      show_overlay: config.show_overlay ?? true,
      show_cell_labels: config.show_cell_labels ?? true,
      compact_cells: config.compact_cells ?? false,
      cell_columns: config.cell_columns ?? 2,

      cell_heatmap_mode: config.cell_heatmap_mode ?? 'normal',
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5,

      pack_voltage_min: config.pack_voltage_min,
      pack_voltage_max: config.pack_voltage_max,
      capacity_remaining: config.capacity_remaining,
      capacity_total_ah: config.capacity_total_ah,

      energy_total_kwh: config.energy_total_kwh,
      energy_uvp_cell_v: config.energy_uvp_cell_v,
      energy_soc100_cell_v: config.energy_soc100_cell_v,

      show_knee_zone: config.show_knee_zone ?? false,

      cell_order_mode: config.cell_order_mode ?? 'linear',

      tint_soc_details: config.tint_soc_details ?? false,
    };
  }

  private _sanitizeCssToken(value: string): string {
    // Prevent breaking out of a style attribute
    return value.replace(/[;\n\r]/g, '').trim();
  }

  private _hexToRgba(hex: string, alpha: number): string | null {
    const cleaned = hex.trim();
    const m = cleaned.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) {
      h = h.split('').map(c => c + c).join('');
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private _buildCardStyle(): string {
    const c = this._config;
    const cssVars: Record<string, string | undefined> = {
      '--cell-columns': c.cell_columns ? String(Math.max(1, Math.min(2, c.cell_columns))) : undefined,
      '--accent-color': c.color_accent ? this._sanitizeCssToken(c.color_accent) : undefined,
      '--solar-color': c.color_charge ? this._sanitizeCssToken(c.color_charge) : undefined,
      '--discharge-color': c.color_discharge ? this._sanitizeCssToken(c.color_discharge) : undefined,
      '--standby-color': c.color_standby ? this._sanitizeCssToken(c.color_standby) : undefined,
      '--balance-charge-color': c.color_balance_charge ? this._sanitizeCssToken(c.color_balance_charge) : undefined,
      '--balance-discharge-color': c.color_balance_discharge ? this._sanitizeCssToken(c.color_balance_discharge) : undefined,
      '--min-cell-color': c.color_min_cell ? this._sanitizeCssToken(c.color_min_cell) : undefined,
      '--max-cell-color': c.color_max_cell ? this._sanitizeCssToken(c.color_max_cell) : undefined,
    };

    // Derive glow/border colors from hex if possible
    const accent = c.color_accent ? this._sanitizeCssToken(c.color_accent) : '';
    const discharge = c.color_discharge ? this._sanitizeCssToken(c.color_discharge) : '';
    const standby = c.color_standby ? this._sanitizeCssToken(c.color_standby) : '';
    const flowInGlow = this._hexToRgba(accent, 0.22);
    const flowInBorder = this._hexToRgba(accent, 0.35);
    const flowOutGlow = this._hexToRgba(discharge, 0.22);
    const flowOutBorder = this._hexToRgba(discharge, 0.35);
    const standbyGlow = this._hexToRgba(standby, 0.18);

    if (flowInGlow) cssVars['--flow-in-glow'] = flowInGlow;
    if (flowInBorder) cssVars['--flow-in-border'] = flowInBorder;
    if (flowOutGlow) cssVars['--flow-out-glow'] = flowOutGlow;
    if (flowOutBorder) cssVars['--flow-out-border'] = flowOutBorder;
    if (standbyGlow) cssVars['--standby-glow'] = standbyGlow;

    return Object.entries(cssVars)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
  }

  public getCardSize(): number {
    return 6;
  }

  public static getConfigElement() {
    return document.createElement('jk-bms-reactor-card-editor');
  }

  public static getStubConfig() {
    return {
      type: 'custom:jk-bms-reactor-card',
      pack_voltage: '',
      current: '',
      soc: '',
      cells_prefix: 'sensor.jk_bms_cell_',
      cells_count: 16,
    };
  }

  protected updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    // Keep the balancing connector dot round even when the SVG appears later
    // (e.g. when balancing starts) or when layout changes.
    this._updateCellFlowDotRadii(4.5);
    this._updateFlowLineY();

    // Allow smooth transitions: keep the previous connector geometry/colors.
    this._lastCellFlow = this._pendingCellFlow;
    this._pendingCellFlow = null;

    if (!changedProperties.has('hass')) return;
    if (!this.hass || !this._config) return;

    if (!this._historySeeded) {
      this._historySeeded = true;
      this._seedHistoryFromHa().catch(() => {
        // ignore; local sampling will still work
      });
    }

    const now = Date.now();
    if (now - this._lastSampleTs < this._sampleIntervalMs) return;
    this._lastSampleTs = now;

    const packState = computePackState(this.hass, this._config);
    const voltage = packState.voltage;
    const current = packState.current;
    const power = (voltage ?? 0) * (current ?? 0);

    const push = (key: keyof typeof this._history, value: number | null) => {
      if (value === null || value === undefined || Number.isNaN(value)) return;
      const arr = this._history[key];
      arr.push(value);
      if (arr.length > this._historyMax) arr.splice(0, arr.length - this._historyMax);
    };

    push('voltage', voltage);
    push('current', current);
    push('power', power);
    push('delta', packState.delta);

    const pushEntity = (entityId: string | undefined, value: number | null) => {
      if (!entityId) return;
      if (value === null || value === undefined || Number.isNaN(value)) return;
      const arr = (this._historyByEntity[entityId] = this._historyByEntity[entityId] ?? []);
      arr.push(value);
      if (arr.length > this._historyMax) arr.splice(0, arr.length - this._historyMax);
    };

    pushEntity(this._config.mos_temp, packState.mosTemp ?? null);
    this._updateAnalytics(packState);
    for (const entityId of this._config.temp_sensors ?? []) {
      if (!entityId) continue;
      const raw = this.hass.states[entityId]?.state ?? null;
      const n = raw === null ? NaN : Number(raw);
      pushEntity(entityId, Number.isFinite(n) ? n : null);
    }

    // Ensure sparklines repaint even if no other state changed
    this.requestUpdate();
  }

  private _downsample(values: number[], max: number): number[] {
    if (values.length <= max) return values;
    const step = values.length / max;
    const out: number[] = [];
    for (let i = 0; i < max; i++) {
      out.push(values[Math.floor(i * step)]);
    }
    return out;
  }

  private async _seedHistoryFromHa(): Promise<void> {
    if (!this.hass?.callApi) return;
    if (!this._config?.pack_voltage || !this._config?.current) return;

    const start = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const entityIds = [
      this._config.pack_voltage,
      this._config.current,
      this._config.delta,
      this._config.mos_temp,
      ...(this._config.temp_sensors ?? []),
    ]
      .filter(Boolean)
      .join(',');

    const path = `history/period/${start}`;
    const result = await this.hass.callApi<any>('GET', path, {
      filter_entity_id: entityIds,
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: true,
    });

    if (!Array.isArray(result)) return;

    const extract = (s: any): number | null => {
      const raw = s?.s ?? s?.state;
      const n = raw === undefined || raw === null ? NaN : Number(raw);
      return Number.isFinite(n) ? n : null;
    };

    const perEntity: Record<string, number[]> = {};
    for (const entityHistory of result) {
      if (!Array.isArray(entityHistory) || entityHistory.length === 0) continue;
      const first = entityHistory[0];
      const entityId = first?.entity_id ?? first?.e;
      if (!entityId) continue;

      const vals: number[] = [];
      for (const st of entityHistory) {
        const v = extract(st);
        if (v !== null) vals.push(v);
      }
      perEntity[entityId] = vals;
    }

    const vSeries = this._downsample(perEntity[this._config.pack_voltage] ?? [], this._historyMax);
    const cSeries = this._downsample(perEntity[this._config.current] ?? [], this._historyMax);
    const dSeries = this._config.delta
      ? this._downsample(perEntity[this._config.delta] ?? [], this._historyMax)
      : [];

    if (vSeries.length) this._history.voltage = vSeries;
    if (cSeries.length) this._history.current = cSeries;
    if (dSeries.length) this._history.delta = dSeries;

    const n = Math.min(this._history.voltage.length, this._history.current.length);
    if (n > 0) {
      const p: number[] = [];
      for (let i = 0; i < n; i++) {
        p.push(this._history.voltage[i] * this._history.current[i]);
      }
      this._history.power = p;
    }

    const seedEntity = (entityId?: string) => {
      if (!entityId) return;
      const series = this._downsample(perEntity[entityId] ?? [], this._historyMax);
      if (series.length) this._historyByEntity[entityId] = series;
    };

    seedEntity(this._config.mos_temp);
    for (const t of this._config.temp_sensors ?? []) seedEntity(t);

    this.requestUpdate();
  }

  private _sparklinePoints(
    values: number[],
    width = 100,
    height = 30,
    range?: { min?: number; max?: number }
  ): string {
    if (!values.length) return '';

    const smooth = (arr: number[], window = 3) => {
      if (arr.length < 3) return arr;
      const half = Math.floor(window / 2);
      return arr.map((_, i) => {
        let sum = 0;
        let count = 0;
        for (let j = i - half; j <= i + half; j++) {
          if (j < 0 || j >= arr.length) continue;
          sum += arr[j];
          count++;
        }
        return count ? sum / count : arr[i];
      });
    };

    const percentileMinMax = (arr: number[], lowP = 0.1, highP = 0.9) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const n = sorted.length;
      const lo = sorted[Math.max(0, Math.floor((n - 1) * lowP))];
      const hi = sorted[Math.max(0, Math.ceil((n - 1) * highP))];
      if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { min: 0, max: 1 };
      if (hi === lo) return { min: lo - 1, max: hi + 1 };

      // Add a little padding so the line doesn't hug the edges
      const pad = (hi - lo) * 0.08;
      return { min: lo - pad, max: hi + pad };
    };

    const smoothed = smooth(values, 3);
    const hasFixedRange =
      range?.min !== undefined && range?.max !== undefined &&
      Number.isFinite(range.min) && Number.isFinite(range.max) &&
      (range.max as number) > (range.min as number);

    const { min, max } = hasFixedRange
      ? { min: range!.min as number, max: range!.max as number }
      : percentileMinMax(smoothed, 0.1, 0.9);
    const span = max - min;

    const stepX = values.length > 1 ? width / (values.length - 1) : 0;
    return smoothed
      .map((v, i) => {
        const x = i * stepX;
        const clamped = Math.min(max, Math.max(min, v));
        const t = span === 0 ? 0.5 : (clamped - min) / span;
        const y = height - t * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  private _getCellVoltageClass(voltage: number, minCell: number | null, maxCell: number | null): string {
    if (voltage < 3.0) return 'low-voltage';
    if (voltage > 3.5) return 'high-voltage';
    return 'normal-voltage';
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    const cardStyle = this._buildCardStyle();

    // Check if configuration is incomplete
    const hasRequiredConfig = this._config.pack_voltage && this._config.current && this._config.soc;
    const hasCellsConfig = this._config.cells || (this._config.cells_prefix && this._config.cells_count);

    if (!hasRequiredConfig || !hasCellsConfig) {
      return html`
                <ha-card style=${cardStyle}>
                    <div class="card-content" style="padding: 24px; text-align: center;">
                        <ha-icon icon="mdi:alert-circle-outline" style="font-size: 48px; color: var(--warning-color);"></ha-icon>
                        <h3 style="margin: 16px 0 8px;">Configuration Required</h3>
                        <p style="color: var(--secondary-text-color); margin: 0;">
                            Please configure the card using the visual editor.
                        </p>
                        <ul style="text-align: left; display: inline-block; margin-top: 16px;">
                            ${!this._config.pack_voltage ? html`<li>Pack Voltage entity</li>` : ''}
                            ${!this._config.current ? html`<li>Current entity</li>` : ''}
                            ${!this._config.soc ? html`<li>SOC entity</li>` : ''}
                            ${!hasCellsConfig ? html`<li>Cell configuration (cells array or prefix+count)</li>` : ''}
                        </ul>
                    </div>
                </ha-card>
            `;
    }

    const packState = computePackState(this.hass, this._config);

    return html`
        <ha-card style=${cardStyle}>
                <div class="card-content">
                    ${this._renderPackInfo(packState)}
                    ${this._renderReactor(packState)}
                    ${this._renderStatusBar(packState)}
                </div>
            </ha-card>
        `;
  }

  private _handleChargeClick() {
    if (this._config.charging_switch && this.hass) {
      this.hass.callService('switch', 'toggle', {
        entity_id: this._config.charging_switch,
      });
    }
  }

  private _handleDischargeClick() {
    if (this._config.discharging_switch && this.hass) {
      this.hass.callService('switch', 'toggle', {
        entity_id: this._config.discharging_switch,
      });
    }
  }

  private _renderPackInfo(packState: PackState) {
    const current = packState.current ?? 0;
    const voltage = packState.voltage ?? 0;
    const soc = packState.soc ?? 0;
    const isChargingFlow = packState.isCharging && current > 0;
    const isDischargingFlow = packState.isDischarging && current < 0;
    const power = Math.abs(voltage * current);
    const chargeCurrent = isChargingFlow ? Math.abs(current) : 0;
    const dischargeCurrent = isDischargingFlow ? Math.abs(current) : 0;

    const dotRadiusForPower = (watts: number) => {
      const scaled = 3 + Math.min(5, Math.log10(watts + 1) * 1.8);
      return Number(scaled.toFixed(2));
    };

    const chargeDotSize = isChargingFlow ? dotRadiusForPower(power) : 3;
    const dischargeDotSize = isDischargingFlow ? dotRadiusForPower(power) : 3;

    const segCount = 360;
    const activeSegs = Math.max(0, Math.min(segCount, Math.round((soc / 100) * segCount)));
    const socGlowClass = isChargingFlow ? 'charging' : isDischargingFlow ? 'discharging' : 'standby';

    const capacityLeftAh =
      (packState.capacityRemainingAh ?? null) ??
      (this._config.capacity_total_ah !== undefined && this._config.capacity_total_ah !== null && Number.isFinite(this._config.capacity_total_ah)
        ? (packState.soc !== null && packState.soc !== undefined
          ? (this._config.capacity_total_ah as number) * ((packState.soc as number) / 100)
          : null)
        : null);

    const avgCellV = packState.cells.length
      ? packState.cells.reduce((sum, c) => sum + c.voltage, 0) / packState.cells.length
      : (this._config.cells_count && Number.isFinite(this._config.cells_count)
        ? voltage / (this._config.cells_count as number)
        : null);

    const cellsCount = packState.cells.length
      ? packState.cells.length
      : (this._config.cells_count && Number.isFinite(this._config.cells_count))
        ? (this._config.cells_count as number)
        : Array.isArray(this._config.cells)
          ? this._config.cells.length
          : null;

    const uvpCellV = (this._config.energy_uvp_cell_v !== undefined && Number.isFinite(this._config.energy_uvp_cell_v))
      ? (this._config.energy_uvp_cell_v as number)
      : (this._config.pack_voltage_min !== undefined && Number.isFinite(this._config.pack_voltage_min) && cellsCount)
        ? (this._config.pack_voltage_min as number) / (cellsCount as number)
        : null;

    const soc100CellV = (this._config.energy_soc100_cell_v !== undefined && Number.isFinite(this._config.energy_soc100_cell_v))
      ? (this._config.energy_soc100_cell_v as number)
      : (this._config.pack_voltage_max !== undefined && Number.isFinite(this._config.pack_voltage_max) && cellsCount)
        ? (this._config.pack_voltage_max as number) / (cellsCount as number)
        : null;

    const totalKwhOverride = (this._config.energy_total_kwh !== undefined && Number.isFinite(this._config.energy_total_kwh))
      ? (this._config.energy_total_kwh as number)
      : null;

    const totalKwhAuto = (this._config.capacity_total_ah !== undefined && Number.isFinite(this._config.capacity_total_ah))
      ? (() => {
        const capAh = this._config.capacity_total_ah as number;
        // Prefer pack_voltage_max as a pack-level reference if present.
        if (this._config.pack_voltage_max !== undefined && Number.isFinite(this._config.pack_voltage_max)) {
          return (capAh * (this._config.pack_voltage_max as number)) / 1000;
        }
        // Otherwise derive pack max voltage from per-cell SOC100 voltage.
        if (soc100CellV !== null && cellsCount) {
          return (capAh * (soc100CellV as number) * (cellsCount as number)) / 1000;
        }
        return null;
      })()
      : null;

    const totalKwh = totalKwhOverride ?? totalKwhAuto;

    const canEnergy =
      avgCellV !== null &&
      totalKwh !== null &&
      uvpCellV !== null &&
      soc100CellV !== null &&
      (soc100CellV as number) > (uvpCellV as number);

    const energyAvailableKwh = canEnergy
      ? (() => {
        const uvp = uvpCellV as number;
        const soc100 = soc100CellV as number;
        const total = totalKwh as number;
        const t = ((avgCellV as number) - uvp) / (soc100 - uvp);
        const clamped = Math.max(0, Math.min(1, t));
        return clamped * total;
      })()
      : null;

    // -------- Battery analytics --------
    const chargeTotalId = this._firstExistingEntityId([
      this._config.analytics_charge_energy_total_kwh,
      'sensor.main_mainbms_charge_energy_total_kwh',
    ]);
    const dischargeTotalId = this._firstExistingEntityId([
      this._config.analytics_discharge_energy_total_kwh,
      'sensor.main_mainbms_discharge_energy_total_kwh',
    ]);
    const cycleCountId = this._firstExistingEntityId([
      this._config.analytics_cycle_count,
      'sensor.main_mainbms_cycle_count',
    ]);
    const capacityAhId = this._firstExistingEntityId([
      this._config.analytics_capacity_ah,
      'sensor.main_mainbns_capacity_ah',
    ]);

    const chargeTotalKwh = chargeTotalId ? getNumericValue(this.hass, chargeTotalId) : null;
    const dischargeTotalKwh = dischargeTotalId ? getNumericValue(this.hass, dischargeTotalId) : null;
    const cycleCountDirect = cycleCountId ? getNumericValue(this.hass, cycleCountId) : null;

    const lifetimeDischargeKwh = dischargeTotalKwh ?? (this._analyticsDischargeKwh || null);
    const lifetimeChargeKwh = chargeTotalKwh ?? (this._analyticsChargeKwh || null);

    const nominalCapacityAh = (() => {
      if (Number.isFinite(this._config.nominal_capacity_ah)) return this._config.nominal_capacity_ah as number;
      const fromEntity = capacityAhId ? getNumericValue(this.hass, capacityAhId) : null;
      if (fromEntity !== null && Number.isFinite(fromEntity) && fromEntity > 0) return fromEntity;
      return 314;
    })();

    const nominalVoltageV = Number.isFinite(this._config.nominal_voltage_v)
      ? (this._config.nominal_voltage_v as number)
      : 51.2;

    const nominalPackKwh = (nominalCapacityAh > 0 && nominalVoltageV > 0)
      ? (nominalCapacityAh * nominalVoltageV) / 1000
      : null;

    const equivalentCycles = (cycleCountDirect !== null && Number.isFinite(cycleCountDirect))
      ? cycleCountDirect
      : (lifetimeDischargeKwh !== null && nominalPackKwh !== null && nominalPackKwh > 0)
        ? (lifetimeDischargeKwh / nominalPackKwh)
        : null;

    const measuredCapacityAhId = this._firstExistingEntityId([
      this._config.measured_capacity_ah,
    ]);
    const measuredCapacityAh = measuredCapacityAhId ? getNumericValue(this.hass, measuredCapacityAhId) : null;
    const sohPct = (measuredCapacityAh !== null && Number.isFinite(measuredCapacityAh) && nominalCapacityAh > 0)
      ? (measuredCapacityAh / nominalCapacityAh) * 100
      : null;

    const avgDodPct = this._dodSessions.length
      ? this._dodSessions.reduce((sum, x) => sum + x, 0) / this._dodSessions.length
      : null;

    const lifetimeTitle = dischargeTotalId
      ? `Direct: ${dischargeTotalId}`
      : 'Derived: integrated discharge power (local)';
    const cyclesTitle = cycleCountId
      ? `Direct: ${cycleCountId}`
      : (lifetimeDischargeKwh !== null && nominalPackKwh !== null)
        ? `Derived: discharge_kWh / nominal_pack_kWh (${formatNumber(nominalPackKwh, 2)} kWh)`
        : 'Derived: needs lifetime discharge kWh and nominal pack kWh';
    const dodTitle = this._dodSessions.length
      ? `Derived: rolling avg over ${this._dodSessions.length} discharge sessions`
      : 'Derived: needs SOC + discharge sessions';
    const sohTitle = measuredCapacityAhId
      ? `Derived: ${measuredCapacityAhId} / nominal_capacity_ah`
      : 'Derived: needs measured capacity Ah entity';

    const showAnalytics =
      chargeTotalId !== null ||
      dischargeTotalId !== null ||
      cycleCountId !== null ||
      capacityAhId !== null ||
      measuredCapacityAhId !== null ||
      (this._analyticsChargeKwh > 0) ||
      (this._analyticsDischargeKwh > 0) ||
      this._dodSessions.length > 0;

    return html`
      <div class="flow-section">
        <!-- Charger Node -->
        <div class="flow-node">
          <div class="icon-circle ${isChargingFlow ? 'active-charge' : ''} clickable"
               @click=${() => this._handleChargeClick()}>
            <ha-icon icon="mdi:power-plug-outline"></ha-icon>
          </div>
          <div class="node-label">Charge</div>
          ${packState.isCharging ? html`
            <div class="node-status">
              <span class="status-on">ON</span>
            </div>
          ` : ''}
          ${chargeCurrent > 0 ? html`
            <div class="node-current">${formatNumber(chargeCurrent, 1)} A</div>
          ` : ''}
        </div>

        <!-- Reactor Ring (SOC Progress) -->
        <div class="reactor-ring-container">
          <svg class="soc-segmented ${socGlowClass}" viewBox="0 0 120 120" aria-hidden="true">
            <g transform="translate(60 60)">
              ${Array.from({ length: segCount }, (_, i) => {
      const isActive = i < activeSegs;
      return svg`
                  <line
                    class="soc-seg ${isActive ? 'active' : 'inactive'}"
                    x1="0" y1="-52" x2="0" y2="-58"
                    transform="rotate(${i})"
                  ></line>
                `;
    })}
            </g>
          </svg>
          <div class="reactor-ring ${socGlowClass} ${this._config.tint_soc_details ? 'tint-details' : ''} ${packState.isBalancing ? 'balancing-active' : ''}">
            <div class="soc-label">%</div>
            <div class="soc-value">${formatNumber(soc, 0)}%</div>
            <div class="capacity-text">
              ${capacityLeftAh !== null
        ? html`${formatNumber(capacityLeftAh, 1)} Ah`
        : html`${formatNumber(voltage, 1)}V`}
            </div>
            ${energyAvailableKwh !== null ? html`
              <div class="energy-text">${formatNumber(energyAvailableKwh, 1)} kWh</div>
            ` : ''}
          </div>
        </div>

        <!-- Load/Discharge Node -->
        <div class="flow-node">
          <div class="icon-circle ${isDischargingFlow ? 'active-discharge' : ''} clickable"
               @click=${() => this._handleDischargeClick()}>
            <ha-icon icon="mdi:power-socket"></ha-icon>
          </div>
          <div class="node-label">Load</div>
          ${packState.isDischarging ? html`
            <div class="node-status">
              <span class="status-on">ON</span>
            </div>
          ` : ''}
          ${dischargeCurrent > 0 ? html`
            <div class="node-current">${formatNumber(dischargeCurrent, 1)} A</div>
          ` : ''}
        </div>

        <!-- SVG Flow Lines with animated dots -->
        <svg class="flow-svg" viewBox="0 0 400 180" preserveAspectRatio="none">
          <!-- Charge line (left to center) -->
          <line x1="62.5" y1="${this._flowLineY}" x2="200" y2="${this._flowLineY}" 
                class="flow-line ${isChargingFlow ? 'active-charge' : 'inactive'}" />
          ${isChargingFlow ? svg`
            <circle class="flow-dot dot-1" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 62.5,${this._flowLineY} L 200,${this._flowLineY}" />
            </circle>
            <circle class="flow-dot dot-2" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 62.5,${this._flowLineY} L 200,${this._flowLineY}" />
            </circle>
            <circle class="flow-dot dot-3" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 62.5,${this._flowLineY} L 200,${this._flowLineY}" />
            </circle>
          ` : ''}
          
          <!-- Discharge line (center to right) -->
          <line x1="200" y1="${this._flowLineY}" x2="337.5" y2="${this._flowLineY}" 
                class="flow-line ${isDischargingFlow ? 'active-discharge' : 'inactive'}" />
          ${isDischargingFlow ? svg`
            <circle class="flow-dot dot-1" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 200,${this._flowLineY} L 337.5,${this._flowLineY}" />
            </circle>
            <circle class="flow-dot dot-2" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 200,${this._flowLineY} L 337.5,${this._flowLineY}" />
            </circle>
            <circle class="flow-dot dot-3" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 200,${this._flowLineY} L 337.5,${this._flowLineY}" />
            </circle>
          ` : ''}
        </svg>
      </div>

      <!-- Stats Panels with sparklines -->
      <div class="stats-grid">
        <div class="stat-panel stat-voltage">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline voltage" points="${this._sparklinePoints(this._history.voltage, 100, 30, {
          min: this._config.pack_voltage_min,
          max: this._config.pack_voltage_max,
        })}"></polyline>
          </svg>
          <div class="stat-label">Voltage</div>
          <div class="stat-value">${formatNumber(packState.voltage, 2)} V</div>
        </div>

        <div class="stat-panel stat-avg-cell" title="Average of all cell voltages">
          <div class="stat-label">Avg Cell</div>
          <div class="stat-value">${avgCellV !== null ? `${formatNumber(avgCellV, 3)} V` : '—'}</div>
        </div>

        <div class="stat-panel stat-current ${current > 0.5 ? 'flow-in' : current < -0.5 ? 'flow-out' : ''}">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline current" points="${this._sparklinePoints(this._history.current)}"></polyline>
          </svg>
          <div class="stat-label">Current</div>
          <div class="stat-value">${formatNumber(packState.current, 2)} A</div>
        </div>
        <div class="stat-panel stat-power ${current > 0.5 ? 'flow-in' : current < -0.5 ? 'flow-out' : ''}">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline power" points="${this._sparklinePoints(this._history.power)}"></polyline>
          </svg>
          <div class="stat-label">Power</div>
          <div class="stat-value">${formatNumber(Math.abs((packState.voltage ?? 0) * (packState.current ?? 0)), 1)} W</div>
        </div>
        ${(() => {
        const d = Math.abs(packState.delta ?? 0);
        const deltaLevel = d < 0.05 ? 'ok' : d < 0.1 ? 'warn' : d < 0.15 ? 'alert' : 'danger';

        const stability = d < 0.04 ? 'stable' : d <= 0.1 ? 'moderate' : 'high';
        const stabilityLabel = stability === 'stable'
          ? 'Stable'
          : stability === 'moderate'
            ? 'Normal'
            : 'High spread';

        const avgCellV = packState.cells.length
          ? packState.cells.reduce((sum, c) => sum + c.voltage, 0) / packState.cells.length
          : null;

        const kneeWindow = 6;
        const deltaHist = this._history.delta;
        const deltaRise = deltaHist.length >= kneeWindow
          ? deltaHist[deltaHist.length - 1] - deltaHist[deltaHist.length - kneeWindow]
          : 0;

        const inKnee =
          (this._config.show_knee_zone ?? false) &&
          avgCellV !== null &&
          (avgCellV as number) > 3.38 &&
          deltaRise >= 0.01;

        return html`
        <div class="stat-panel stat-delta delta-minmax-panel delta-${deltaLevel}">
          <div class="delta-minmax-container">
            <div class="delta-left">
              <svg class="delta-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
                <polyline class="sparkline delta" points="${this._sparklinePoints(this._history.delta)}"></polyline>
              </svg>
              <div class="delta-label">Delta</div>
              <div class="delta-value">${formatNumber(packState.delta, 3)}V</div>
              <div class="stability-row stability-${stability}">
                <span class="stability-dot"></span>
                ${stabilityLabel} (Δ ${formatNumber(d, 3)}V)
              </div>
              ${inKnee ? html`
                <div class="knee-indicator" title="Delta rising rapidly near top knee">
                  Top Knee Zone
                </div>
              ` : ''}
            </div>
            <div class="delta-divider">|</div>
            <div class="delta-right">
              <div class="minmax-row max">
                <ha-icon class="minmax-icon" icon="mdi:arrow-up-bold"></ha-icon>
                <span class="max-value">${formatNumber(packState.maxCell, 3)}V</span>
              </div>
              <div class="minmax-divider"></div>
              <div class="minmax-row min">
                <ha-icon class="minmax-icon" icon="mdi:arrow-down-bold"></ha-icon>
                <span class="min-value">${formatNumber(packState.minCell, 3)}V</span>
              </div>
            </div>
          </div>
        </div>`;
      })()}

        ${this._config.mos_temp ? html`
          <div class="stat-panel stat-mos-temp">
            <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
              <polyline class="sparkline temp" points="${this._sparklinePoints(this._historyByEntity[this._config.mos_temp] ?? [])}"></polyline>
            </svg>
            <div class="stat-label">MOS Temp</div>
            <div class="stat-value">${formatNumber(packState.mosTemp ?? null, 1)} °C</div>
          </div>
        ` : ''}
      </div>

      ${(this._config.temp_sensors ?? []).length ? html`
        <div class="temps-grid">
          ${(packState.temps ?? []).map(t => html`
            <div class="stat-panel">
              <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
                <polyline class="sparkline temp" points="${this._sparklinePoints(this._historyByEntity[(this._config.temp_sensors ?? [])[t.index]] ?? [])}"></polyline>
              </svg>
              <div class="stat-label">Temp ${t.index + 1}</div>
              <div class="stat-value">${formatNumber(t.temp ?? null, 1)} °C</div>
            </div>
          `)}
        </div>
      ` : ''}

      ${showAnalytics ? html`
        <div class="analysis-section">
          <div class="analysis-title">Battery analytics</div>
          <div class="analysis-grid">
            <div class="stat-panel" title="${lifetimeTitle}">
              <div class="stat-label">Lifetime discharge</div>
              <div class="stat-value">${lifetimeDischargeKwh !== null ? `${formatNumber(lifetimeDischargeKwh, 1)} kWh` : '—'}</div>
            </div>
            <div class="stat-panel" title="${cyclesTitle}">
              <div class="stat-label">Eq cycles</div>
              <div class="stat-value">${equivalentCycles !== null ? formatNumber(equivalentCycles, 1) : '—'}</div>
            </div>
            <div class="stat-panel" title="${dodTitle}">
              <div class="stat-label">Avg DoD</div>
              <div class="stat-value">${avgDodPct !== null ? `${formatNumber(avgDodPct, 0)}%` : '—'}</div>
            </div>
            <div class="stat-panel" title="${sohTitle}">
              <div class="stat-label">Est SOH</div>
              <div class="stat-value">${sohPct !== null ? `${formatNumber(sohPct, 0)}%` : '—'}</div>
            </div>
          </div>
          ${(lifetimeChargeKwh !== null || lifetimeDischargeKwh !== null) ? html`
            <div class="analysis-subtitle">
              ${lifetimeChargeKwh !== null ? html`Charge: ${formatNumber(lifetimeChargeKwh, 1)} kWh` : ''}
              ${(lifetimeChargeKwh !== null && lifetimeDischargeKwh !== null) ? html` · ` : ''}
              ${lifetimeDischargeKwh !== null ? html`Discharge: ${formatNumber(lifetimeDischargeKwh, 1)} kWh` : ''}
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;
  }

  private _renderReactor(packState: PackState) {
    const showLabels = this._config.show_cell_labels !== false;
    const compact = this._config.compact_cells ?? false;

    const heatmapMode = this._config.cell_heatmap_mode ?? 'normal';
    const avgCellV = packState.cells.length
      ? packState.cells.reduce((sum, c) => sum + c.voltage, 0) / packState.cells.length
      : null;

    const mode = this._config.cell_order_mode ?? 'linear';
    const n = packState.cells.length;
    const half = Math.ceil(n / 2);

    type Slot = { cell: (typeof packState.cells)[number]; originalIndex: number };

    const left: Slot[] = [];
    const right: Slot[] = [];

    if (mode === 'bank') {
      for (let i = 0; i < Math.min(half, n); i++) {
        left.push({ cell: packState.cells[i], originalIndex: i });
      }
      for (let i = half; i < n; i++) {
        right.push({ cell: packState.cells[i], originalIndex: i });
      }
    } else {
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0) left.push({ cell: packState.cells[i], originalIndex: i });
        else right.push({ cell: packState.cells[i], originalIndex: i });
      }
    }

    const rows = Math.max(left.length, right.length);

    const posForIndex = (idx: number) => {
      if (mode === 'bank') {
        return idx < half
          ? { row: idx, side: 0 }
          : { row: idx - half, side: 1 };
      }
      return { row: Math.floor(idx / 2), side: idx % 2 };
    };

    const balancingCells = packState.cells.filter(c => c.isBalancing);
    const showConnector = packState.isBalancing && balancingCells.length >= 2;

    // Always flow from higher-voltage cell -> lower-voltage cell.
    const maxBal = balancingCells.reduce((a, b) => (b.voltage > a.voltage ? b : a), balancingCells[0]);
    const minBal = balancingCells.reduce((a, b) => (b.voltage < a.voltage ? b : a), balancingCells[0]);
    const startIndex = showConnector ? maxBal.index : -1;
    const endIndex = showConnector ? minBal.index : -1;
    const startPos = startIndex >= 0 ? posForIndex(startIndex) : { row: 0, side: 0 };
    const endPos = endIndex >= 0 ? posForIndex(endIndex) : { row: 0, side: 0 };
    const startRow = startPos.row;
    const endRow = endPos.row;
    const startSide = startPos.side; // 0=left, 1=right
    const endSide = endPos.side;
    const flowDirClass = showConnector ? (startRow > endRow ? 'dir-up' : 'dir-down') : '';

    const step = 10;
    const y = (r: number) => r * step + step / 2;
    const xL = 0;
    const xR = 100;
    const xM = 50;

    const xStart = startSide === 0 ? xL : xR;
    const xEnd = endSide === 0 ? xL : xR;
    const yStart = y(startRow);
    const yEnd = y(endRow);

    const colorForDir = (dir?: string | null) => {
      if (dir === 'charging') return 'var(--balance-charge-color)';
      if (dir === 'discharging') return 'var(--balance-discharge-color)';
      return null;
    };
    const startColor = colorForDir((showConnector ? maxBal.balanceDirection : null) ?? null) ?? 'var(--balance-discharge-color)';
    const endColor = colorForDir((showConnector ? minBal.balanceDirection : null) ?? null) ?? 'var(--balance-charge-color)';

    const cellTemplate = (cell: any, originalIndex: number) => {
      const cellClass = this._getCellVoltageClass(cell.voltage, packState.minCell, packState.maxCell);

      const dev = avgCellV !== null ? Math.abs(cell.voltage - (avgCellV as number)) : 0;
      const thermalClass = heatmapMode === 'spread'
        ? (dev <= 0.02 ? 'thermal-green' : dev <= 0.05 ? 'thermal-yellow' : dev > 0.1 ? 'thermal-red' : 'thermal-orange')
        : '';

      const minV = packState.minCell;
      const maxV = packState.maxCell;
      const span = (minV !== null && maxV !== null) ? (maxV - minV) : 0;
      const ratioRaw = span > 0 ? (cell.voltage - (minV as number)) / span : 0.5;
      const ratio = Math.max(0, Math.min(1, ratioRaw));

      const eps = 0.0005;
      const isMin = minV !== null && Math.abs(cell.voltage - minV) <= eps;
      const isMax = maxV !== null && Math.abs(cell.voltage - maxV) <= eps;

      return html`
        <div class="cell ${cellClass} ${thermalClass} ${cell.isBalancing ? `balancing${cell.balanceDirection ? ` balancing-${cell.balanceDirection}` : ''}` : ''}">
          ${isMin ? html`
            <div class="cell-extreme min" title="Min cell">
              <ha-icon icon="mdi:arrow-down-bold"></ha-icon>
            </div>
          ` : ''}
          ${isMax ? html`
            <div class="cell-extreme max" title="Max cell">
              <ha-icon icon="mdi:arrow-up-bold"></ha-icon>
            </div>
          ` : ''}

          ${compact ? html`
            <div class="cell-compact-row">
              <span class="cell-index">${originalIndex + 1}:</span>
              <span class="cell-compact-voltage">${formatNumber(cell.voltage, 3)}V</span>
            </div>
          ` : html`
            ${showLabels ? html`<div class="cell-label">Cell ${originalIndex + 1}</div>` : ''}
            <div class="cell-voltage">
              ${formatNumber(cell.voltage, 3)}
              <span class="cell-voltage-unit">V</span>
            </div>
          `}

          <div class="cell-bar" aria-hidden="true">
            <div class="cell-bar-fill" style="width: ${(ratio * 100).toFixed(1)}%;"></div>
          </div>
          ${cell.isBalancing ? html`<div class="balancing-indicator"></div>` : ''}
        </div>
      `;
    };

    const connectorPath = () => {
      if (!showConnector) return '';
      // Keep a constant path command structure so the SVG 'd' attribute can animate smoothly.
      return `M ${xStart} ${yStart} L ${xM} ${yStart} L ${xM} ${yEnd} L ${xEnd} ${yEnd}`;
    };

    const flowNow = showConnector
      ? {
        d: connectorPath(),
        x1: xStart,
        y1: yStart,
        x2: xEnd,
        y2: yEnd,
        c1: startColor,
        c2: endColor,
      }
      : null;
    this._pendingCellFlow = flowNow;
    const flowPrev = this._lastCellFlow;

    return html`
      <div class="reactor-container">
        <div class="reactor-grid ${compact ? 'compact' : ''} ${heatmapMode === 'spread' ? 'spread' : ''}">
          <div class="cell-flow-column ${showConnector ? 'active' : ''} ${flowDirClass}" style="grid-row: 1 / span ${Math.max(1, rows)};">
            <svg class="cell-flow-svg" viewBox="0 0 100 ${Math.max(1, rows) * 10}" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient
                  id="cellFlowGrad-${this._uid}"
                  gradientUnits="userSpaceOnUse"
                  x1="${flowNow?.x1 ?? xStart}"
                  y1="${flowNow?.y1 ?? yStart}"
                  x2="${flowNow?.x2 ?? xEnd}"
                  y2="${flowNow?.y2 ?? yEnd}"
                >
                  ${flowPrev && flowNow && (flowPrev.x1 !== flowNow.x1 || flowPrev.y1 !== flowNow.y1 || flowPrev.x2 !== flowNow.x2 || flowPrev.y2 !== flowNow.y2)
        ? svg`
                        <animate attributeName="x1" dur="420ms" fill="freeze" values="${flowPrev.x1};${flowNow.x1}" calcMode="spline" keyTimes="0;1" keySplines="0.2 0 0.2 1"></animate>
                        <animate attributeName="y1" dur="420ms" fill="freeze" values="${flowPrev.y1};${flowNow.y1}" calcMode="spline" keyTimes="0;1" keySplines="0.2 0 0.2 1"></animate>
                        <animate attributeName="x2" dur="420ms" fill="freeze" values="${flowPrev.x2};${flowNow.x2}" calcMode="spline" keyTimes="0;1" keySplines="0.2 0 0.2 1"></animate>
                        <animate attributeName="y2" dur="420ms" fill="freeze" values="${flowPrev.y2};${flowNow.y2}" calcMode="spline" keyTimes="0;1" keySplines="0.2 0 0.2 1"></animate>
                      `
        : ''}
                  <stop offset="0%" stop-color="${flowNow?.c1 ?? startColor}">
                    ${flowPrev && flowNow && flowPrev.c1 !== flowNow.c1
        ? svg`<animate attributeName="stop-color" dur="420ms" fill="freeze" values="${flowPrev.c1};${flowNow.c1}" calcMode="spline" keyTimes="0;1" keySplines="0.2 0 0.2 1"></animate>`
        : ''}
                  </stop>
                  <stop offset="100%" stop-color="${flowNow?.c2 ?? endColor}">
                    ${flowPrev && flowNow && flowPrev.c2 !== flowNow.c2
        ? svg`<animate attributeName="stop-color" dur="420ms" fill="freeze" values="${flowPrev.c2};${flowNow.c2}" calcMode="spline" keyTimes="0;1" keySplines="0.2 0 0.2 1"></animate>`
        : ''}
                  </stop>
                </linearGradient>
              </defs>
              <path
                id="cellFlowPath-${this._uid}"
                class="cell-flow-path ${showConnector ? 'active' : ''}"
                d="${flowNow?.d ?? connectorPath()}"
                vector-effect="non-scaling-stroke"
              >
                ${flowPrev && flowNow && flowPrev.d !== flowNow.d
        ? svg`<animate attributeName="d" dur="420ms" fill="freeze" values="${flowPrev.d};${flowNow.d}" calcMode="spline" keyTimes="0;1" keySplines="0.2 0 0.2 1"></animate>`
        : ''}
              </path>
              ${showConnector ? svg`
                <ellipse class="cell-flow-dot" rx="${this._cellFlowDotRx}" ry="${this._cellFlowDotRy}" fill="url(#cellFlowGrad-${this._uid})">
                  <animateMotion dur="1.8s" repeatCount="indefinite">
                    <mpath href="#cellFlowPath-${this._uid}"></mpath>
                  </animateMotion>
                </ellipse>
              ` : ''}
            </svg>
          </div>

          ${Array.from({ length: rows }, (_, r) => {
          const l = left[r];
          const rc = right[r];
          return html`
              ${l ? html`<div class="cell-wrap" style="grid-column: 1; grid-row: ${r + 1};">${cellTemplate(l.cell, l.originalIndex)}</div>` : ''}
              ${rc ? html`<div class="cell-wrap" style="grid-column: 3; grid-row: ${r + 1};">${cellTemplate(rc.cell, rc.originalIndex)}</div>` : ''}
            `;
        })}
        </div>
      </div>
    `;
  }



  private _renderStatusBar(packState: PackState) {
    const badges = [];

    if (packState.isCharging) {
      badges.push(html`
        <div class="status-badge charging">
          <span class="status-indicator"></span>
          Charging
        </div>
      `);
    }

    if (packState.isDischarging) {
      badges.push(html`
        <div class="status-badge discharging">
          <span class="status-indicator"></span>
          Discharging
        </div>
      `);
    }

    if (packState.isBalancing) {
      badges.push(html`
        <div class="status-badge balancing">
          <span class="status-indicator"></span>
          Balancing${packState.balanceCurrent !== null ? html`&nbsp;${formatNumber(packState.balanceCurrent, 2)}A` : ''}
        </div>
      `);
    }

    if (badges.length === 0) {
      badges.push(html`
        <div class="status-badge standby">
          <span class="status-indicator"></span>
          Standby
        </div>
      `);
    }

    return html`
      <div class="status-bar">
        <div class="status-left">${badges}</div>
        <div class="status-actions">
          ${this._copyHint ? html`<div class="copy-hint">${this._copyHint}</div>` : ''}
          <button class="copy-btn" @click=${() => this._copySnapshot(packState)} title="Copy pack + cell snapshot">
            <ha-icon icon="mdi:content-copy"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }
}
