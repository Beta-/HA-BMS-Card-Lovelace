import { LitElement, html, css } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
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

      .cells-mode ha-button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
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

      .icon-btn {
        width: 36px;
        height: 36px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      .icon-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--primary-text-color);
      }
    `;
  }

  public setConfig(config: JkBmsReactorCardConfig): void {
    // Ensure we have a valid config object with defaults
    this._config = {
      ...config,
      pack_voltage: config.pack_voltage ?? '',
      current: config.current ?? '',
      soc: config.soc ?? '',
      cells_prefix: config.cells_prefix ?? 'sensor.jk_bms_cell_',
      cells_count: config.cells_count ?? 16,
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5,
      show_overlay: config.show_overlay ?? true,
      show_cell_labels: config.show_cell_labels ?? true,
      cell_columns: config.cell_columns ?? 2,

      pack_voltage_min: config.pack_voltage_min,
      pack_voltage_max: config.pack_voltage_max,
      capacity_remaining: config.capacity_remaining ?? '',
      capacity_total_ah: config.capacity_total_ah,
    };
  }

  private _entityPickerTag(): string | null {
    if (customElements.get('ha-entity-picker')) return 'ha-entity-picker';
    if (customElements.get('hui-entity-picker')) return 'hui-entity-picker';
    return null;
  }

  private _renderEntityPicker(options: {
    value: string;
    configValue?: string;
    index?: number;
    includeDomains?: string[];
    onChanged: (ev: CustomEvent) => void;
  }) {
    const tag = this._entityPickerTag();
    if (!tag) {
      return html`
        <ha-textfield
          .value=${options.value}
          .configValue=${options.configValue ?? ''}
          @input=${options.onChanged as any}
        ></ha-textfield>
      `;
    }

    return staticHtml`
      <${unsafeStatic(tag)}
        .hass=${this.hass}
        .value=${options.value}
        .configValue=${options.configValue ?? undefined}
        .index=${options.index ?? undefined}
        .includeDomains=${options.includeDomains ?? undefined}
        .allowCustomEntity=${true}
        allow-custom-entity
        @value-changed=${options.onChanged}
      ></${unsafeStatic(tag)}>
    `;
  }

  protected render() {
    if (!this._config) {
      return html``;
    }

    // If hass isn't loaded yet, show loading state
    if (!this.hass) {
      return html`
        <div class="card-config">
          <div class="option">
            <p>Loading...</p>
          </div>
        </div>
      `;
    }

    const useCellsArray = Array.isArray(this._config.cells) && this._config.cells.length > 0;

    return html`
      <div class="card-config">
        <div class="section-title">Required Settings</div>

        <div class="option">
          <label>Pack Voltage Entity</label>
          ${this._renderEntityPicker({
      value: this._config.pack_voltage || '',
      configValue: 'pack_voltage',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Entity for total pack voltage</div>
        </div>

        <div class="option">
          <label>Current Entity</label>
          ${this._renderEntityPicker({
      value: this._config.current || '',
      configValue: 'current',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Entity for pack current (positive = charging)</div>
        </div>

        <div class="option">
          <label>State of Charge (SOC) Entity</label>
          ${this._renderEntityPicker({
      value: this._config.soc || '',
      configValue: 'soc',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Entity for battery state of charge (%)</div>
        </div>

        <div class="section-title">Cell Configuration</div>
        
        <div class="cells-mode">
          <ha-button
            class=${useCellsArray ? 'active' : ''}
            @click=${() => this._setCellsMode('array')}
          >
            Individual Cells
          </ha-button>
          <ha-button
            class=${!useCellsArray ? 'active' : ''}
            @click=${() => this._setCellsMode('prefix')}
          >
            Prefix + Count
          </ha-button>
        </div>

        ${useCellsArray ? this._renderCellsArray() : this._renderCellsPrefix()}

        <div class="section-title">Optional Settings</div>

        <div class="option">
          <label>Balancing Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.balancing || '',
      configValue: 'balancing',
      includeDomains: ['binary_sensor', 'sensor', 'input_boolean', 'switch'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Binary sensor for balancing status</div>
        </div>

        <div class="option">
          <label>Balancing Current Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.balancing_current || '',
      configValue: 'balancing_current',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Entity for balancing current (displayed in reactor ring)</div>
        </div>

        <div class="option">
          <label>Charging Switch (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.charging_switch || '',
      configValue: 'charging_switch',
      includeDomains: ['switch', 'input_boolean'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Switch entity to control charging (clickable charge icon)</div>
        </div>

        <div class="option">
          <label>Discharging Switch (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.discharging_switch || '',
      configValue: 'discharging_switch',
      includeDomains: ['switch', 'input_boolean'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Switch entity to control discharging (clickable discharge icon)</div>
        </div>

        <div class="option">
          <label>Delta Voltage Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.delta || '',
      configValue: 'delta',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Entity for cell voltage delta (auto-calculated if not provided)</div>
        </div>

        <div class="option">
          <label>MOS Temperature Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.mos_temp || '',
      configValue: 'mos_temp',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Entity for MOSFET temperature</div>
        </div>

        <div class="option">
          <label>Temperature Sensors (Optional)</label>
          <div class="cells-list">
            ${(this._config.temp_sensors || []).map((temp, index) => html`
              <div class="cell-input">
                <span style="min-width: 70px;">Temp ${index + 1}:</span>
                ${this._renderEntityPicker({
      value: temp,
      index,
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._tempSensorChanged,
    })}
                <div class="icon-btn" @click=${() => this._removeTempSensor(index)}>
                  <ha-icon icon="mdi:delete"></ha-icon>
                </div>
              </div>
            `)}
          </div>
                  <div class="section-title">Graphs</div>

                  <div class="option">
                    <label>Pack Voltage Min (V)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.pack_voltage_min ?? ''}
                      .configValue=${'pack_voltage_min'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 44.0"
                    ></ha-textfield>
                    <div class="description">Optional: clamp voltage sparkline lower bound</div>
                  </div>

                  <div class="option">
                    <label>Pack Voltage Max (V)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.pack_voltage_max ?? ''}
                      .configValue=${'pack_voltage_max'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 57.6"
                    ></ha-textfield>
                    <div class="description">Optional: clamp voltage sparkline upper bound</div>
                  </div>

                  <div class="section-title">Capacity (Optional)</div>

                  <div class="option">
                    <label>Capacity Remaining Entity (Ah)</label>
                    ${this._renderEntityPicker({
      value: this._config.capacity_remaining || '',
      configValue: 'capacity_remaining',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
                    <div class="description">If set, shows remaining capacity under SOC</div>
                  </div>

                  <div class="option">
                    <label>Total Capacity (Ah)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.capacity_total_ah ?? ''}
                      .configValue=${'capacity_total_ah'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 280"
                    ></ha-textfield>
                    <div class="description">Used to compute remaining Ah from SOC when no entity is provided</div>
                  </div>
          <ha-button class="add-cell-btn" @click=${this._addTempSensor}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Temp Sensor
          </ha-button>
          <div class="description">Add any number of temperature sensor entities</div>
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

        <div class="option">
          <ha-switch
            .checked=${this._config.compact_cells ?? false}
            .configValue=${'compact_cells'}
            @change=${this._toggleChanged}
          >
            <span slot="label">Compact Cells</span>
          </ha-switch>
          <div class="description">Use smaller cell display to save space</div>
        </div>

        <div class="option">
          <label>Cell Voltage Columns</label>
          <ha-textfield
            type="number"
            min="1"
            max="2"
            step="1"
            .value=${this._config.cell_columns ?? 4}
            .configValue=${'cell_columns'}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Fixed two-column layout (max: 2)</div>
        </div>

        <div class="section-title">Colors (Optional)</div>

        <div class="option">
          <label>Accent / Charging Color</label>
          <ha-textfield
            .value=${this._config.color_accent || ''}
            .configValue=${'color_accent'}
            @input=${this._valueChanged}
            placeholder="#41cd52"
          ></ha-textfield>
          <div class="description">Used for charging glow + SOC segments</div>
        </div>

        <div class="option">
          <label>Charge Line/Dots Color</label>
          <ha-textfield
            .value=${this._config.color_charge || ''}
            .configValue=${'color_charge'}
            @input=${this._valueChanged}
            placeholder="#ffd30f"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Discharge Color</label>
          <ha-textfield
            .value=${this._config.color_discharge || ''}
            .configValue=${'color_discharge'}
            @input=${this._valueChanged}
            placeholder="#3090c7"
          ></ha-textfield>
          <div class="description">Used for discharge glow + SOC segments</div>
        </div>

        <div class="option">
          <label>Balance Charge Color (Cell Charging)</label>
          <ha-textfield
            .value=${this._config.color_balance_charge || ''}
            .configValue=${'color_balance_charge'}
            @input=${this._valueChanged}
            placeholder="#ff6b6b"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Balance Discharge Color (Cell Discharging)</label>
          <ha-textfield
            .value=${this._config.color_balance_discharge || ''}
            .configValue=${'color_balance_discharge'}
            @input=${this._valueChanged}
            placeholder="#339af0"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Min Cell Color</label>
          <ha-textfield
            .value=${this._config.color_min_cell || ''}
            .configValue=${'color_min_cell'}
            @input=${this._valueChanged}
            placeholder="#ff6b6b"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Max Cell Color</label>
          <ha-textfield
            .value=${this._config.color_max_cell || ''}
            .configValue=${'color_max_cell'}
            @input=${this._valueChanged}
            placeholder="#51cf66"
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  private _addTempSensor() {
    const temp_sensors = [...(this._config.temp_sensors || [])];
    temp_sensors.push('');
    this._config = { ...this._config, temp_sensors };
    this._configChanged();
  }

  private _removeTempSensor(index: number) {
    const temp_sensors = [...(this._config.temp_sensors || [])];
    temp_sensors.splice(index, 1);
    this._config = { ...this._config, temp_sensors };
    this._configChanged();
  }

  private _tempSensorChanged(ev: CustomEvent) {
    const target = ev.target as any;
    const index = target.index;
    const value = (ev as any).detail?.value ?? target.value;

    const temp_sensors = [...(this._config.temp_sensors || [])];
    temp_sensors[index] = value;
    this._config = { ...this._config, temp_sensors };
    this._configChanged();
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
              ${this._renderEntityPicker({
      value: cell,
      index,
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._cellChanged,
    })}
              <div class="icon-btn" @click=${() => this._removeCell(index)}>
                <ha-icon icon="mdi:delete"></ha-icon>
              </div>
            </div>
          `)}
        </div>
        <ha-button
          class="add-cell-btn"
          @click=${this._addCell}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Cell
        </ha-button>
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
    const value = (ev as any).detail?.value ?? target.value;

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
