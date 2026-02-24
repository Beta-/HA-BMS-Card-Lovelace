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

  private _renderPackInfo(packState: PackState) {
    const current = packState.current ?? 0;
    const voltage = packState.voltage ?? 0;
    const isChargingFlow = packState.isCharging && current > 0;
    const isDischargingFlow = packState.isDischarging && current < 0;
    const power = Math.abs(voltage * current);

    return html`
      <div class="flow-section">
        <!-- Solar/Grid/Charger Node -->
        <div class="flow-node">
          <div class="icon-circle ${isChargingFlow ? 'active-charge' : ''}">
            <ha-icon icon="mdi:solar-power"></ha-icon>
          </div>
          <div class="node-label">Charge</div>
          <div class="node-status">
            <span class="${packState.isCharging ? 'status-on' : 'status-off'}">
              ${packState.isCharging ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <!-- Reactor Ring (SOC Display) -->
        <div class="reactor-ring ${packState.isBalancing ? 'balancing-active' : ''}">
          <div class="soc-label">SoC</div>
          <div class="soc-value">${formatNumber(packState.soc, 0)}%</div>
          <div class="capacity-text">
            ${packState.isBalancing ? 'Balancing' : `${formatNumber(packState.voltage, 1)}V`}
          </div>
        </div>

        <!-- Load/Discharge Node -->
        <div class="flow-node">
          <div class="icon-circle ${isDischargingFlow ? 'active-discharge' : ''}">
            <ha-icon icon="mdi:power-plug"></ha-icon>
          </div>
          <div class="node-label">Load</div>
          <div class="node-status">
            <span class="${packState.isDischarging ? 'status-on' : 'status-off'}">
              ${packState.isDischarging ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <!-- SVG Flow Lines -->
        <svg class="flow-svg" viewBox="0 0 400 180" preserveAspectRatio="meet">
          <!-- Charge path (left to center) -->
          <path d="M 60,70 Q 120,70 125,90" 
                class="flow-path ${isChargingFlow ? 'path-active-charge' : 'path-inactive'}" />
          <!-- Discharge path (center to right) -->
          <path d="M 275,90 Q 280,70 340,70" 
                class="flow-path ${isDischargingFlow ? 'path-active-discharge' : 'path-inactive'}" />
        </svg>
      </div>

      <!-- Stats Panels -->
      <div class="stats-grid">
        <div class="stat-panel">
          <div class="stat-label">Voltage</div>
          <div class="stat-value">${formatNumber(packState.voltage, 2)} V</div>
        </div>
        <div class="stat-panel">
          <div class="stat-label">Current</div>
          <div class="stat-value">${formatNumber(packState.current, 2)} A</div>
        </div>
        <div class="stat-panel">
          <div class="stat-label">Power</div>
          <div class="stat-value">${formatNumber(power, 1)} W</div>
        </div>
        <div class="stat-panel">
          <div class="stat-label">Delta</div>
          <div class="stat-value">${formatNumber(packState.delta, 3)} V</div>
        </div>
        <div class="stat-panel">
          <div class="stat-label">Min Cell</div>
          <div class="stat-value">${formatNumber(packState.minCell, 3)} V</div>
        </div>
        <div class="stat-panel">
          <div class="stat-label">Max Cell</div>
          <div class="stat-value">${formatNumber(packState.maxCell, 3)} V</div>
        </div>
      </div>
    `;
  }

  private _renderReactor(packState: PackState) {
    const showLabels = this._config.show_cell_labels !== false;

    return html`
      <div class="reactor-container">
        <div class="reactor-grid">
          ${packState.cells.map((cell, index) => {
      const cellClass = this._getCellVoltageClass(
        cell.voltage,
        packState.minCell,
        packState.maxCell
      );

      return html`
              <div class="cell ${cellClass} ${cell.isBalancing ? 'balancing' : ''}">
                ${showLabels ? html`<div class="cell-label">Cell ${index + 1}</div>` : ''}
                <div class="cell-voltage">
                  ${formatNumber(cell.voltage, 3)}
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
