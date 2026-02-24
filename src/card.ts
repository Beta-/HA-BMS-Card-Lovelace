import { LitElement, html, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, JkBmsReactorCardConfig, PackState } from './types';
import { computePackState, formatNumber } from './ha_state';
import { getCellPositions, getReactorViewBox } from './reactor_layout';
import { renderBalanceOverlay, renderEnergyFlow } from './balance_overlay';
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

        if (!config.pack_voltage) {
            throw new Error('pack_voltage is required');
        }

        if (!config.current) {
            throw new Error('current is required');
        }

        if (!config.soc) {
            throw new Error('soc is required');
        }

        if (!config.cells && (!config.cells_prefix || !config.cells_count)) {
            throw new Error('Either cells array or cells_prefix + cells_count is required');
        }

        this._config = {
            show_overlay: true,
            show_cell_labels: true,
            balance_threshold_v: 0.01,
            charge_threshold_a: 0.5,
            discharge_threshold_a: 0.5,
            ...config,
        };
    }

    public getCardSize(): number {
        return 6;
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
        return html`
      <div class="pack-info">
        <div class="info-item">
          <div class="info-label">Voltage</div>
          <div class="info-value">
            ${formatNumber(packState.voltage, 2)}
            <span class="info-unit">V</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Current</div>
          <div class="info-value">
            ${formatNumber(packState.current, 2)}
            <span class="info-unit">A</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">SOC</div>
          <div class="info-value">
            ${formatNumber(packState.soc, 0)}
            <span class="info-unit">%</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Delta</div>
          <div class="info-value">
            ${formatNumber(packState.delta, 3)}
            <span class="info-unit">V</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Min Cell</div>
          <div class="info-value">
            ${formatNumber(packState.minCell, 3)}
            <span class="info-unit">V</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Max Cell</div>
          <div class="info-value">
            ${formatNumber(packState.maxCell, 3)}
            <span class="info-unit">V</span>
          </div>
        </div>
      </div>
    `;
    }

    private _renderReactor(packState: PackState) {
        const showOverlay = this._config.show_overlay !== false;
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
              </div>
            `;
        })}
          
          ${showOverlay ? this._renderOverlay(packState) : ''}
        </div>
      </div>
    `;
    }

    private _renderOverlay(packState: PackState) {
        const positions = getCellPositions(packState.cells.length);
        const viewBox = getReactorViewBox(packState.cells.length);

        // Calculate overlay positioning to match the grid
        const gridGap = 12; // matches CSS gap
        const cellsPerRow = 4;

        return html`
      <svg class="overlay-svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
        ${renderBalanceOverlay(packState.cells, packState.isBalancing)}
        ${renderEnergyFlow(packState.isCharging, packState.isDischarging)}
      </svg>
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
