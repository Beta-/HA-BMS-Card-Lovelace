import { LitElement, html, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, JkBmsReactorCardConfig, PackState } from './types';
import { computePackState, formatNumber } from './ha_state';
import { styles } from './styles';

export class JkBmsReactorCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: JkBmsReactorCardConfig;

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

  static get styles() {
    return styles;
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
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5,

      pack_voltage_min: config.pack_voltage_min,
      pack_voltage_max: config.pack_voltage_max,
      capacity_remaining: config.capacity_remaining,
      capacity_total_ah: config.capacity_total_ah,
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
      '--balance-charge-color': c.color_balance_charge ? this._sanitizeCssToken(c.color_balance_charge) : undefined,
      '--balance-discharge-color': c.color_balance_discharge ? this._sanitizeCssToken(c.color_balance_discharge) : undefined,
      '--min-cell-color': c.color_min_cell ? this._sanitizeCssToken(c.color_min_cell) : undefined,
      '--max-cell-color': c.color_max_cell ? this._sanitizeCssToken(c.color_max_cell) : undefined,
    };

    // Derive glow/border colors from hex if possible
    const accent = c.color_accent ? this._sanitizeCssToken(c.color_accent) : '';
    const discharge = c.color_discharge ? this._sanitizeCssToken(c.color_discharge) : '';
    const flowInGlow = this._hexToRgba(accent, 0.22);
    const flowInBorder = this._hexToRgba(accent, 0.35);
    const flowOutGlow = this._hexToRgba(discharge, 0.22);
    const flowOutBorder = this._hexToRgba(discharge, 0.35);

    if (flowInGlow) cssVars['--flow-in-glow'] = flowInGlow;
    if (flowInBorder) cssVars['--flow-in-border'] = flowInBorder;
    if (flowOutGlow) cssVars['--flow-out-glow'] = flowOutGlow;
    if (flowOutBorder) cssVars['--flow-out-border'] = flowOutBorder;

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
    const socGlowClass = isChargingFlow ? 'charging' : isDischargingFlow ? 'discharging' : '';

    const capacityLeftAh =
      (packState.capacityRemainingAh ?? null) ??
      (this._config.capacity_total_ah !== undefined && this._config.capacity_total_ah !== null && Number.isFinite(this._config.capacity_total_ah)
        ? (packState.soc !== null && packState.soc !== undefined
          ? (this._config.capacity_total_ah as number) * ((packState.soc as number) / 100)
          : null)
        : null);

    return html`
      <div class="flow-section">
        <!-- Charger Node -->
        <div class="flow-node">
          <div class="icon-circle ${isChargingFlow ? 'active-charge' : ''} clickable"
               @click=${() => this._handleChargeClick()}>
            <ha-icon icon="mdi:power-plug-outline"></ha-icon>
          </div>
          <div class="node-label">Charge</div>
          <div class="node-status">
            <span class="${packState.isCharging ? 'status-on' : 'status-off'}">
              ${packState.isCharging ? 'ON' : 'OFF'}
            </span>
          </div>
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
          <div class="reactor-ring ${packState.isBalancing ? 'balancing-active' : ''}">
            <div class="soc-label">SoC</div>
            <div class="soc-value">${formatNumber(soc, 0)}%</div>
            <div class="capacity-text">
              ${packState.isBalancing && packState.balanceCurrent !== null
        ? html`${formatNumber(packState.balanceCurrent, 2)} A`
        : capacityLeftAh !== null
          ? html`${formatNumber(capacityLeftAh, 1)} Ah`
          : html`${formatNumber(voltage, 1)}V`}
            </div>
          </div>
        </div>

        <!-- Load/Discharge Node -->
        <div class="flow-node">
          <div class="icon-circle ${isDischargingFlow ? 'active-discharge' : ''} clickable"
               @click=${() => this._handleDischargeClick()}>
            <ha-icon icon="mdi:power-socket"></ha-icon>
          </div>
          <div class="node-label">Load</div>
          <div class="node-status">
            <span class="${packState.isDischarging ? 'status-on' : 'status-off'}">
              ${packState.isDischarging ? 'ON' : 'OFF'}
            </span>
          </div>
          ${dischargeCurrent > 0 ? html`
            <div class="node-current">${formatNumber(dischargeCurrent, 1)} A</div>
          ` : ''}
        </div>

        <!-- SVG Flow Lines with animated dots -->
        <svg class="flow-svg" viewBox="0 0 400 180" preserveAspectRatio="meet">
          <!-- Charge line (left to center) -->
          <line x1="80" y1="90" x2="150" y2="90" 
                class="flow-line ${isChargingFlow ? 'active-charge' : 'inactive'}" />
          ${isChargingFlow ? svg`
            <circle class="flow-dot dot-1" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 80,90 L 150,90" />
            </circle>
            <circle class="flow-dot dot-2" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 80,90 L 150,90" />
            </circle>
            <circle class="flow-dot dot-3" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 80,90 L 150,90" />
            </circle>
          ` : ''}
          
          <!-- Discharge line (center to right) -->
          <line x1="250" y1="90" x2="320" y2="90" 
                class="flow-line ${isDischargingFlow ? 'active-discharge' : 'inactive'}" />
          ${isDischargingFlow ? svg`
            <circle class="flow-dot dot-1" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 250,90 L 320,90" />
            </circle>
            <circle class="flow-dot dot-2" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 250,90 L 320,90" />
            </circle>
            <circle class="flow-dot dot-3" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 250,90 L 320,90" />
            </circle>
          ` : ''}
        </svg>
      </div>

      <!-- Stats Panels with sparklines -->
      <div class="stats-grid">
        <div class="stat-panel">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline voltage" points="${this._sparklinePoints(this._history.voltage, 100, 30, {
            min: this._config.pack_voltage_min,
            max: this._config.pack_voltage_max,
          })}"></polyline>
          </svg>
          <div class="stat-label">Voltage</div>
          <div class="stat-value">${formatNumber(packState.voltage, 2)} V</div>
        </div>
        <div class="stat-panel ${current > 0.5 ? 'flow-in' : current < -0.5 ? 'flow-out' : ''}">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline current" points="${this._sparklinePoints(this._history.current)}"></polyline>
          </svg>
          <div class="stat-label">Current</div>
          <div class="stat-value">${formatNumber(packState.current, 2)} A</div>
        </div>
        <div class="stat-panel ${current > 0.5 ? 'flow-in' : current < -0.5 ? 'flow-out' : ''}">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline power" points="${this._sparklinePoints(this._history.power)}"></polyline>
          </svg>
          <div class="stat-label">Power</div>
          <div class="stat-value">${formatNumber(Math.abs((packState.voltage ?? 0) * (packState.current ?? 0)), 1)} W</div>
        </div>
        <div class="stat-panel delta-minmax-panel">
          <div class="delta-minmax-container">
            <div class="delta-left">
              <svg class="delta-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
                <polyline class="sparkline delta" points="${this._sparklinePoints(this._history.delta)}"></polyline>
              </svg>
              <div class="delta-label">Delta</div>
              <div class="delta-value">${formatNumber(packState.delta, 3)}V</div>
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
        </div>

        ${this._config.mos_temp ? html`
          <div class="stat-panel">
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
    `;
  }

  private _renderReactor(packState: PackState) {
    const showLabels = this._config.show_cell_labels !== false;
    const compact = this._config.compact_cells ?? false;

    const left = packState.cells.filter((_, i) => i % 2 === 0);
    const right = packState.cells.filter((_, i) => i % 2 === 1);
    const rows = Math.max(left.length, right.length);

    const flowClass = packState.isCharging ? 'charging' : packState.isDischarging ? 'discharging' : '';

    const cellTemplate = (cell: any, index: number) => {
      const cellClass = this._getCellVoltageClass(cell.voltage, packState.minCell, packState.maxCell);
      return html`
        <div class="cell ${cellClass} ${cell.isBalancing ? `balancing${cell.balanceDirection ? ` balancing-${cell.balanceDirection}` : ''}` : ''}">
          ${compact ? html`
            <div class="cell-compact-row">
              <span class="cell-index">${index + 1}:</span>
              <span class="cell-compact-voltage">${formatNumber(cell.voltage, 3)}V</span>
            </div>
          ` : html`
            ${showLabels ? html`<div class="cell-label">Cell ${index + 1}</div>` : ''}
            <div class="cell-voltage">
              ${formatNumber(cell.voltage, 3)}
              <span class="cell-voltage-unit">V</span>
            </div>
          `}
          ${cell.isBalancing ? html`<div class="balancing-indicator"></div>` : ''}
        </div>
      `;
    };

    const connectorPath = () => {
      if (rows <= 0) return '';
      const step = 10;
      const y = (r: number) => r * step + step / 2;
      const xL = 0;
      const xR = 100;
      const xM = 50;

      let d = `M ${xL} ${y(0)} L ${xR} ${y(0)}`;
      for (let r = 0; r < rows - 1; r++) {
        d += ` L ${xM} ${y(r)} L ${xM} ${y(r + 1)} L ${xL} ${y(r + 1)} L ${xR} ${y(r + 1)}`;
      }
      return d;
    };

    return html`
      <div class="reactor-container">
        <div class="reactor-grid ${compact ? 'compact' : ''}">
          <div class="cell-flow-column ${flowClass}" style="grid-row: 1 / span ${Math.max(1, rows)};">
            <svg class="cell-flow-svg" viewBox="0 0 100 ${Math.max(1, rows) * 10}" preserveAspectRatio="none" aria-hidden="true">
              <path class="cell-flow-path" d="${connectorPath()}"></path>
            </svg>
          </div>

          ${Array.from({ length: rows }, (_, r) => {
      const l = left[r];
      const rc = right[r];
      const lIndex = r * 2;
      const rIndex = r * 2 + 1;
      return html`
              ${l ? html`<div class="cell-wrap" style="grid-column: 1; grid-row: ${r + 1};">${cellTemplate(l, lIndex)}</div>` : ''}
              ${rc ? html`<div class="cell-wrap" style="grid-column: 3; grid-row: ${r + 1};">${cellTemplate(rc, rIndex)}</div>` : ''}
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
          Balancing
        </div>
      `);
    }

    if (badges.length === 0) {
      return html``;
    }

    return html`
      <div class="status-bar">
        ${badges}
      </div>
    `;
  }
}
