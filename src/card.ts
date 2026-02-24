import { LitElement, html, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, JkBmsReactorCardConfig, PackState } from './types';
import { computePackState, formatNumber } from './ha_state';
import { styles } from './styles';

export class JkBmsReactorCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: JkBmsReactorCardConfig;

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
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5,
    };
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

  private _getCellVoltageClass(voltage: number, minCell: number | null, maxCell: number | null): string {
    if (voltage < 3.0) return 'low-voltage';
    if (voltage > 3.5) return 'high-voltage';
    return 'normal-voltage';
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    // Check if configuration is incomplete
    const hasRequiredConfig = this._config.pack_voltage && this._config.current && this._config.soc;
    const hasCellsConfig = this._config.cells || (this._config.cells_prefix && this._config.cells_count);

    if (!hasRequiredConfig || !hasCellsConfig) {
      return html`
                <ha-card>
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
            <ha-card>
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

    // Calculate SOC progress (283 is circumference of 45px radius circle)
    const circumference = 283;
    const progress = circumference - (soc / 100) * circumference;

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
          <svg class="soc-progress" viewBox="0 0 100 100">
            <circle class="soc-bg" cx="50" cy="50" r="45"></circle>
            <circle class="soc-fill ${packState.isBalancing ? 'balancing-active' : ''}" 
                    cx="50" cy="50" r="45"
                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${progress};"></circle>
          </svg>
          <div class="reactor-ring ${packState.isBalancing ? 'balancing-active' : ''}">
            <div class="soc-label">SoC</div>
            <div class="soc-value">${formatNumber(soc, 0)}%</div>
            <div class="capacity-text">
              ${packState.isBalancing && packState.balanceCurrent !== null
        ? html`${formatNumber(packState.balanceCurrent, 2)} A`
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
            <circle class="flow-dot dot-1" r="3" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 80,90 L 150,90" />
            </circle>
            <circle class="flow-dot dot-2" r="3" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 80,90 L 150,90" />
            </circle>
            <circle class="flow-dot dot-3" r="3" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 80,90 L 150,90" />
            </circle>
          ` : ''}
          
          <!-- Discharge line (center to right) -->
          <line x1="250" y1="90" x2="320" y2="90" 
                class="flow-line ${isDischargingFlow ? 'active-discharge' : 'inactive'}" />
          ${isDischargingFlow ? svg`
            <circle class="flow-dot dot-1" r="3" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 250,90 L 320,90" />
            </circle>
            <circle class="flow-dot dot-2" r="3" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 250,90 L 320,90" />
            </circle>
            <circle class="flow-dot dot-3" r="3" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 250,90 L 320,90" />
            </circle>
          ` : ''}
        </svg>
      </div>

      <!-- Stats Panels with sparklines -->
      <div class="stats-grid">
        <div class="stat-panel">
          <div class="stat-sparkline"></div>
          <div class="stat-label">Voltage</div>
          <div class="stat-value">${formatNumber(packState.voltage, 2)} V</div>
        </div>
        <div class="stat-panel">
          <div class="stat-sparkline"></div>
          <div class="stat-label">Current</div>
          <div class="stat-value">${formatNumber(packState.current, 2)} A</div>
        </div>
        <div class="stat-panel">
          <div class="stat-sparkline"></div>
          <div class="stat-label">Power</div>
          <div class="stat-value">${formatNumber(power, 1)} W</div>
        </div>
        <div class="stat-panel delta-minmax-panel">
          <div class="stat-sparkline"></div>
          <div class="delta-minmax-container">
            <div class="delta-row">
              <span class="delta-label">Δ</span>
              <span class="delta-value">${formatNumber(packState.delta, 3)}V</span>
              <span class="delta-separator">|</span>
              <span class="max-value">${formatNumber(packState.maxCell, 3)}V</span>
            </div>
            <div class="min-row">
              <span class="min-value">${formatNumber(packState.minCell, 3)}V</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderReactor(packState: PackState) {
    const showLabels = this._config.show_cell_labels !== false;
    const compact = this._config.compact_cells ?? false;

    return html`
      <div class="reactor-container">
        <div class="reactor-grid ${compact ? 'compact' : ''}">
          ${packState.cells.map((cell, index) => {
      const cellClass = this._getCellVoltageClass(
        cell.voltage,
        packState.minCell,
        packState.maxCell
      );

      return html`
              <div class="cell ${cellClass} ${cell.isBalancing ? `balancing balancing-${cell.balanceDirection}` : ''}">
                ${showLabels && !compact ? html`<div class="cell-label">Cell ${index + 1}</div>` : ''}
                <div class="cell-voltage">
                  ${compact ? formatNumber(cell.voltage, 2) : formatNumber(cell.voltage, 3)}
                  <span class="cell-voltage-unit">V</span>
                </div>
                ${cell.isBalancing ? html`<div class="balancing-indicator"></div>` : ''}
              </div>
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
