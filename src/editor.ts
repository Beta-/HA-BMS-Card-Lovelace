import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, JkBmsReactorCardConfig } from './types';

export class JkBmsReactorCardEditor extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
    @state() private _config!: JkBmsReactorCardConfig;

    static get styles() {
        return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .option {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .option label {
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .option .description {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: -2px;
      }

      ha-textfield,
      ha-switch {
        width: 100%;
      }

      .section-title {
        font-weight: 600;
        font-size: 16px;
        margin-top: 8px;
        margin-bottom: 8px;
        color: var(--primary-text-color);
      }

      .cells-mode {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .cells-mode ha-button {
        flex: 1;
      }

      .cells-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }

      .cell-input {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .cell-input ha-textfield {
        flex: 1;
      }

      .add-cell-btn {
        margin-top: 8px;
      }
    `;
    }

    public setConfig(config: JkBmsReactorCardConfig): void {
        this._config = config;
    }

    protected render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        const useCellsArray = Array.isArray(this._config.cells) && this._config.cells.length > 0;

        return html`
      <div class="card-config">
        <div class="section-title">Required Settings</div>

        <div class="option">
          <label>Pack Voltage Entity</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.pack_voltage || ''}
            .configValue=${'pack_voltage'}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for total pack voltage</div>
        </div>

        <div class="option">
          <label>Current Entity</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.current || ''}
            .configValue=${'current'}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for pack current (positive = charging)</div>
        </div>

        <div class="option">
          <label>State of Charge (SOC) Entity</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.soc || ''}
            .configValue=${'soc'}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for battery state of charge (%)</div>
        </div>

        <div class="section-title">Cell Configuration</div>
        
        <div class="cells-mode">
          <mwc-button
            ?raised=${useCellsArray}
            @click=${() => this._setCellsMode('array')}
          >
            Individual Cells
          </mwc-button>
          <mwc-button
            ?raised=${!useCellsArray}
            @click=${() => this._setCellsMode('prefix')}
          >
            Prefix + Count
          </mwc-button>
        </div>

        ${useCellsArray ? this._renderCellsArray() : this._renderCellsPrefix()}

        <div class="section-title">Optional Settings</div>

        <div class="option">
          <label>Balancing Entity (Optional)</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.balancing || ''}
            .configValue=${'balancing'}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Binary sensor for balancing status</div>
        </div>

        <div class="option">
          <label>Delta Voltage Entity (Optional)</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.delta || ''}
            .configValue=${'delta'}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for cell voltage delta (auto-calculated if not provided)</div>
        </div>

        <div class="section-title">Thresholds</div>

        <div class="option">
          <label>Balance Threshold (V)</label>
          <ha-textfield
            type="number"
            step="0.001"
            .value=${this._config.balance_threshold_v ?? 0.01}
            .configValue=${'balance_threshold_v'}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Voltage difference to mark cells as balancing (default: 0.01V)</div>
        </div>

        <div class="option">
          <label>Charge Threshold (A)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.charge_threshold_a ?? 0.5}
            .configValue=${'charge_threshold_a'}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Current threshold for charging animation (default: 0.5A)</div>
        </div>

        <div class="option">
          <label>Discharge Threshold (A)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.discharge_threshold_a ?? 0.5}
            .configValue=${'discharge_threshold_a'}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Current threshold for discharging animation (default: 0.5A)</div>
        </div>

        <div class="section-title">Display Options</div>

        <div class="option">
          <ha-switch
            .checked=${this._config.show_overlay !== false}
            .configValue=${'show_overlay'}
            @change=${this._toggleChanged}
          >
            <span slot="label">Show Balancing Overlay</span>
          </ha-switch>
          <div class="description">Display SVG overlay with balancing animations</div>
        </div>

        <div class="option">
          <ha-switch
            .checked=${this._config.show_cell_labels !== false}
            .configValue=${'show_cell_labels'}
            @change=${this._toggleChanged}
          >
            <span slot="label">Show Cell Labels</span>
          </ha-switch>
          <div class="description">Display cell numbers on each cell</div>
        </div>
      </div>
    `;
    }

    private _renderCellsPrefix() {
        return html`
      <div class="option">
        <label>Cell Entity Prefix</label>
        <ha-textfield
          .value=${this._config.cells_prefix || ''}
          .configValue=${'cells_prefix'}
          @input=${this._valueChanged}
          placeholder="sensor.jk_bms_cell_"
        ></ha-textfield>
        <div class="description">Prefix for cell entities (e.g., sensor.jk_bms_cell_)</div>
      </div>

      <div class="option">
        <label>Number of Cells</label>
        <ha-textfield
          type="number"
          .value=${this._config.cells_count || 16}
          .configValue=${'cells_count'}
          @input=${this._valueChanged}
          min="1"
          max="32"
        ></ha-textfield>
        <div class="description">Total number of cells (default: 16)</div>
      </div>
    `;
    }

    private _renderCellsArray() {
        const cells = this._config.cells || [];

        return html`
      <div class="option">
        <label>Cell Entities</label>
        <div class="cells-list">
          ${cells.map((cell, index) => html`
            <div class="cell-input">
              <span style="min-width: 60px;">Cell ${index + 1}:</span>
              <ha-entity-picker
                .hass=${this.hass}
                .value=${cell}
                .index=${index}
                @value-changed=${this._cellChanged}
                allow-custom-entity
              ></ha-entity-picker>
              <mwc-icon-button
                @click=${() => this._removeCell(index)}
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </mwc-icon-button>
            </div>
          `)}
        </div>
        <mwc-button
          class="add-cell-btn"
          @click=${this._addCell}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Cell
        </mwc-button>
      </div>
    `;
    }

    private _setCellsMode(mode: 'array' | 'prefix') {
        const newConfig = { ...this._config };

        if (mode === 'array') {
            // Switch to cells array
            const count = newConfig.cells_count || 16;
            const prefix = newConfig.cells_prefix || 'sensor.jk_bms_cell_';
            newConfig.cells = Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
            delete newConfig.cells_prefix;
            delete newConfig.cells_count;
        } else {
            // Switch to prefix mode
            const cellCount = Array.isArray(newConfig.cells) ? newConfig.cells.length : 16;
            newConfig.cells_prefix = 'sensor.jk_bms_cell_';
            newConfig.cells_count = cellCount;
            delete newConfig.cells;
        }

        this._config = newConfig;
        this._configChanged();
    }

    private _addCell() {
        const cells = [...(this._config.cells || [])];
        cells.push('');
        this._config = { ...this._config, cells };
        this._configChanged();
    }

    private _removeCell(index: number) {
        const cells = [...(this._config.cells || [])];
        cells.splice(index, 1);
        this._config = { ...this._config, cells };
        this._configChanged();
    }

    private _cellChanged(ev: CustomEvent) {
        const target = ev.target as any;
        const index = target.index;
        const value = ev.detail.value;

        const cells = [...(this._config.cells || [])];
        cells[index] = value;
        this._config = { ...this._config, cells };
        this._configChanged();
    }

    private _valueChanged(ev: CustomEvent) {
        const target = ev.target as any;
        const configValue = target.configValue;
        let value = target.value;

        // Handle entity picker
        if (ev.detail && ev.detail.value !== undefined) {
            value = ev.detail.value;
        }

        // Convert numeric values
        if (target.type === 'number') {
            value = value === '' ? undefined : Number(value);
        }

        if (!configValue) return;

        this._config = {
            ...this._config,
            [configValue]: value,
        };

        this._configChanged();
    }

    private _toggleChanged(ev: CustomEvent) {
        const target = ev.target as any;
        const configValue = target.configValue;
        const checked = target.checked;

        if (!configValue) return;

        this._config = {
            ...this._config,
            [configValue]: checked,
        };

        this._configChanged();
    }

    private _configChanged() {
        const event = new CustomEvent('config-changed', {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
}
