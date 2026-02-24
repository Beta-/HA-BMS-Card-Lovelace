import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { cardStyles } from "./styles.js";
import {
  Hass,
  getFloat,
  getBool,
  getCellEntityIds,
  getCellVoltages,
  fmt,
} from "./ha_state.js";
import { getCellPositions, CELL_RADIUS } from "./reactor_layout.js";
import { renderBalanceOverlay } from "./balance_overlay.js";

/** Card configuration schema. */
export interface JkBmsCardConfig {
  type: string;
  pack_voltage?: string;
  current?: string;
  soc?: string;
  cells?: string[];
  cells_prefix?: string;
  cells_count?: number;
  balancing?: string;
  delta?: string;
  balance_threshold_v?: number;
  charge_threshold_a?: number;
  discharge_threshold_a?: number;
  show_overlay?: boolean;
  show_cell_labels?: boolean;
}

const SVG_W = 320;
const SVG_H = 320;

export class JkBmsReactorCard extends LitElement {
  static styles = cardStyles;

  @property({ attribute: false }) hass!: Hass;
  @state() private _config!: JkBmsCardConfig;

  setConfig(config: JkBmsCardConfig): void {
    if (!config) throw new Error("jk-bms-reactor-card: configuration is required");
    this._config = {
      balance_threshold_v: 0.01,
      charge_threshold_a: 0.5,
      discharge_threshold_a: 0.5,
      show_overlay: true,
      show_cell_labels: true,
      ...config,
    };
  }

  getCardSize(): number {
    return 6;
  }

  // ── Helpers ──────────────────────────────────────────────

  private get _cellEntityIds(): string[] {
    return getCellEntityIds(this._config);
  }

  private get _cellVoltages(): number[] {
    return getCellVoltages(this.hass, this._cellEntityIds);
  }

  private get _current(): number {
    return getFloat(this.hass, this._config.current);
  }

  private get _packVoltage(): number {
    return getFloat(this.hass, this._config.pack_voltage);
  }

  private get _soc(): number {
    return getFloat(this.hass, this._config.soc);
  }

  private get _delta(): number {
    const fromEntity = getFloat(this.hass, this._config.delta);
    if (!isNaN(fromEntity)) return fromEntity;
    // Compute from cell voltages
    const voltages = this._cellVoltages.filter((v) => !isNaN(v));
    if (voltages.length === 0) return NaN;
    return Math.max(...voltages) - Math.min(...voltages);
  }

  /** Determine which cell indices (0-based) are balancing. */
  private get _balancingIndices(): number[] {
    const cfg = this._config;
    const voltages = this._cellVoltages;

    // If a boolean balancing entity exists and is false, skip overlay.
    const hasBalancingEntity = !!cfg.balancing;
    if (hasBalancingEntity && !getBool(this.hass, cfg.balancing)) {
      return [];
    }

    const threshold = cfg.balance_threshold_v ?? 0.01;
    const validVoltages = voltages.filter((v) => !isNaN(v));
    if (validVoltages.length === 0) return [];

    const maxV = Math.max(...validVoltages);

    if (!hasBalancingEntity) {
      // Infer balancing: only when charging and conditions suggest active balancing
      const current = this._current;
      const chargeThresh = cfg.charge_threshold_a ?? 0.5;
      const delta = this._delta;

      const isCharging = !isNaN(current) && current > chargeThresh;
      const deltaSuggestsBalance =
        isNaN(delta) || delta > 0.02 || maxV > 3.35;

      if (!isCharging || !deltaSuggestsBalance) {
        return [];
      }
    }

    // Mark cells within threshold of the max voltage as balancing.
    return voltages.reduce<number[]>((acc, v, i) => {
      if (!isNaN(v) && maxV - v <= threshold) acc.push(i);
      return acc;
    }, []);
  }

  // ── Render ───────────────────────────────────────────────

  override render() {
    if (!this._config || !this.hass) return nothing;

    const current = this._current;
    const packVoltage = this._packVoltage;
    const soc = this._soc;
    const delta = this._delta;
    const voltages = this._cellVoltages;
    const cfg = this._config;

    const chargeThresh = cfg.charge_threshold_a ?? 0.5;
    const dischargeThresh = cfg.discharge_threshold_a ?? 0.5;
    const isCharging = !isNaN(current) && current > chargeThresh;
    const isDischarging = !isNaN(current) && current < -dischargeThresh;
    const balancingIndices = this._balancingIndices;
    const isBalancing = balancingIndices.length > 0;

    const validVoltages = voltages.filter((v) => !isNaN(v));
    const maxV = validVoltages.length ? Math.max(...validVoltages) : NaN;
    const minV = validVoltages.length ? Math.min(...validVoltages) : NaN;

    const showOverlay = cfg.show_overlay !== false;
    const showLabels = cfg.show_cell_labels !== false;

    const positions = getCellPositions(SVG_W, SVG_H);

    // Flow bar class
    const flowClass = isCharging
      ? "flow-bar charging"
      : isDischarging
        ? "flow-bar discharging"
        : "flow-bar";

    return html`
      <ha-card>
        <!-- Header stats row -->
        <div class="card-header">
          ${this._statChip(
            "Voltage",
            `${fmt(packVoltage, 2)} V`,
          )}
          ${this._statChip(
            "Current",
            `${fmt(current, 2)} A`,
            isCharging ? "charging" : isDischarging ? "discharging" : undefined,
          )}
          ${this._statChip("SOC", `${fmt(soc, 1)} %`)}
          ${this._statChip("Δ Cell", `${fmt(delta, 3)} V`)}
          ${this._statChip("Max Cell", `${fmt(maxV, 3)} V`)}
          ${this._statChip("Min Cell", `${fmt(minV, 3)} V`)}
          ${isBalancing
            ? this._statChip("Balance", "Active", "balancing")
            : nothing}
        </div>

        <!-- Flow bar -->
        <div class="${flowClass}">
          <div class="flow-fill"></div>
        </div>

        <!-- Reactor grid + overlay -->
        <div class="reactor-wrapper">
          <div class="reactor-grid" id="reactor-grid">
            ${voltages.map((v, i) => {
              const isMax = !isNaN(v) && !isNaN(maxV) && v === maxV;
              const isMin = !isNaN(v) && !isNaN(minV) && v === minV && minV !== maxV;
              const isBal = balancingIndices.includes(i);
              const classes = [
                "cell",
                isBal ? "balancing" : "",
                isMax ? "max-cell" : "",
                isMin ? "min-cell" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return html`
                <div class="${classes}">
                  ${showLabels
                    ? html`<span class="cell-label">C${i + 1}</span>`
                    : nothing}
                  <span class="cell-value">${fmt(v, 3)}</span>
                </div>
              `;
            })}
          </div>

          ${showOverlay
            ? renderBalanceOverlay(positions, balancingIndices, SVG_W, SVG_H)
            : nothing}
        </div>
      </ha-card>
    `;
  }

  private _statChip(
    label: string,
    value: string,
    valueClass?: string,
  ) {
    return html`
      <div class="header-stat">
        <span class="label">${label}</span>
        <span class="value ${valueClass ?? ""}">${value}</span>
      </div>
    `;
  }
}
