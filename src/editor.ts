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

      .cell-input ha-textfield.range-field {
        flex: 0 0 74px;
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

      .radio-group {
        display: flex;
        gap: 14px;
        align-items: center;
        flex-wrap: wrap;
      }

      .radio {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .radio input {
        width: 16px;
        height: 16px;
        accent-color: var(--primary-color);
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
      charge_current: config.charge_current ?? '',
      discharge_current: config.discharge_current ?? '',
      avg_cell_voltage: config.avg_cell_voltage ?? '',
      cells_prefix: config.cells_prefix ?? 'sensor.jk_bms_cell_',
      cells_count: config.cells_count ?? 16,
      cells_prefix_pad: config.cells_prefix_pad ?? false,
      cell_wire_resistance_template: config.cell_wire_resistance_template ?? '',
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5,
      show_overlay: config.show_overlay ?? true,
      show_cell_labels: config.show_cell_labels ?? true,
      cell_columns: config.cell_columns ?? 2,
      cell_order_mode: config.cell_order_mode ?? 'linear',

      cell_heatmap_mode: config.cell_heatmap_mode ?? 'normal',

      pack_voltage_min: config.pack_voltage_min,
      pack_voltage_max: config.pack_voltage_max,
      current_min: config.current_min,
      current_max: config.current_max,
      power_min: config.power_min,
      power_max: config.power_max,
      delta_min: config.delta_min,
      delta_max: config.delta_max,
      mos_temp_min: config.mos_temp_min,
      mos_temp_max: config.mos_temp_max,
      temp_sensors_min: config.temp_sensors_min ?? [],
      temp_sensors_max: config.temp_sensors_max ?? [],

      temperature_min: config.temperature_min,
      temperature_max: config.temperature_max,

      miniature_view: config.miniature_view ?? false,
      capacity_remaining: config.capacity_remaining ?? '',
      capacity_total_ah: config.capacity_total_ah,

      analytics_charge_energy_total_kwh: config.analytics_charge_energy_total_kwh ?? '',
      analytics_discharge_energy_total_kwh: config.analytics_discharge_energy_total_kwh ?? '',
      analytics_cycle_count: config.analytics_cycle_count ?? '',
      analytics_capacity_ah: config.analytics_capacity_ah ?? '',
      analytics_soc: config.analytics_soc ?? '',
      measured_capacity_ah: config.measured_capacity_ah ?? '',

      show_battery_analytics: config.show_battery_analytics ?? true,

      nominal_capacity_ah: config.nominal_capacity_ah,
      nominal_voltage_v: config.nominal_voltage_v,
      min_current_for_session_a: config.min_current_for_session_a,
      min_session_seconds: config.min_session_seconds,
      dod_sessions_window: config.dod_sessions_window,

      energy_total_kwh: config.energy_total_kwh,
      energy_uvp_cell_v: config.energy_uvp_cell_v,
      energy_soc100_cell_v: config.energy_soc100_cell_v,

      show_knee_zone: config.show_knee_zone ?? false,

      tint_soc_details: config.tint_soc_details ?? false,
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
          <label title="Optional alternative to Current Entity.">Charge Current Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: (this._config.charge_current ?? '') || '',
      configValue: 'charge_current',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">If set (and Current Entity is blank), used as positive charge current</div>
        </div>

        <div class="option">
          <label title="Optional alternative to Current Entity.">Discharge Current Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: (this._config.discharge_current ?? '') || '',
      configValue: 'discharge_current',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">If set (and Current Entity is blank), used as negative discharge current</div>
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

        <div class="option">
          <label title="Optional: if provided, this value is shown in the Delta min/max block and included in the snapshot.">Avg Cell Voltage Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.avg_cell_voltage || '',
      configValue: 'avg_cell_voltage',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Entity for average cell voltage (V)</div>
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

        <div class="option">
          <label>Cell Order Mode</label>
          <div class="radio-group">
            <label class="radio">
              <input
                type="radio"
                name="cell_order_mode"
                .checked=${(this._config.cell_order_mode ?? 'linear') === 'linear'}
                .value=${'linear'}
                .configValue=${'cell_order_mode'}
                @change=${this._valueChanged}
              />
              Linear (1–2 / 3–4)
            </label>
            <label class="radio">
              <input
                type="radio"
                name="cell_order_mode"
                .checked=${(this._config.cell_order_mode ?? 'linear') === 'bank'}
                .value=${'bank'}
                .configValue=${'cell_order_mode'}
                @change=${this._valueChanged}
              />
              Bank (1–9 / 2–10)
            </label>
          </div>
          <div class="description">Controls how cells are arranged in the 2-column grid</div>
        </div>

        <div class="option">
          <label title="Normal shows the standard cell styling. Thermal spread colors cells by their deviation from the average cell voltage.">Cell View Mode</label>
          <div class="radio-group">
            <label class="radio">
              <input
                type="radio"
                name="cell_heatmap_mode"
                .checked=${(this._config.cell_heatmap_mode ?? 'normal') === 'normal'}
                .value=${'normal'}
                .configValue=${'cell_heatmap_mode'}
                @change=${this._valueChanged}
              />
              Normal
            </label>
            <label class="radio">
              <input
                type="radio"
                name="cell_heatmap_mode"
                .checked=${(this._config.cell_heatmap_mode ?? 'normal') === 'spread'}
                .value=${'spread'}
                .configValue=${'cell_heatmap_mode'}
                @change=${this._valueChanged}
              />
              Thermal spread
            </label>
          </div>
          <div class="description">Colors cells by how far they drift from the average cell voltage</div>
        </div>

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

        <div class="section-title">Energy (Optional)</div>

        <div class="option">
          <label title="Optional override. If blank, the card will estimate total kWh from Total Capacity (Ah) and Pack Voltage Max (or Cells × SOC100 cell voltage).">Total Energy Override (kWh)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.energy_total_kwh ?? ''}
            .configValue=${'energy_total_kwh'}
            @input=${this._valueChanged}
            placeholder="13.4"
            title="Leave blank to auto-calculate. Used for: available_kWh = clamp((avgCellV - UVP) / (SOC100 - UVP), 0..1) * total_kWh"
          ></ha-textfield>
          <div class="description">Leave blank to auto-calculate total kWh</div>
        </div>

        <div class="option">
          <label title="Lower reference point for the energy estimate (cell-level voltage). Leave blank to derive from Pack Voltage Min / cell count.">UVP Cell Voltage (V)</label>
          <ha-textfield
            type="number"
            step="0.01"
            .value=${this._config.energy_uvp_cell_v ?? ''}
            .configValue=${'energy_uvp_cell_v'}
            @input=${this._valueChanged}
            placeholder="2.80"
            title="Cell-level voltage at 0% reference (UVP). Must be less than SOC 100% voltage. If blank, uses Pack Voltage Min / cells."
          ></ha-textfield>
        </div>

        <div class="option">
          <label title="Upper reference point for the energy estimate (cell-level voltage). Leave blank to derive from Pack Voltage Max / cell count.">SOC 100% Cell Voltage (V)</label>
          <ha-textfield
            type="number"
            step="0.01"
            .value=${this._config.energy_soc100_cell_v ?? ''}
            .configValue=${'energy_soc100_cell_v'}
            @input=${this._valueChanged}
            placeholder="3.45"
            title="Cell-level voltage treated as 100% reference for the estimate. Must be greater than UVP voltage. If blank, uses Pack Voltage Max / cells."
          ></ha-textfield>
          <div class="description">Used as the upper reference for the energy estimate</div>
        </div>

        <div class="section-title">Battery Analytics (Optional)</div>

        <div class="option">
          <ha-switch
            .checked=${this._config.show_battery_analytics ?? true}
            .configValue=${'show_battery_analytics'}
            @change=${this._toggleChanged}
            title="Show or hide the Battery Analytics section (rendered below the cells)."
          >
            <span slot="label">Show Battery Analytics</span>
          </ha-switch>
          <div class="description">When enabled, shown below the cells</div>
        </div>

        <div class="option">
          <label title="Preferred: a persistent counter of total charged energy (kWh). If blank, the card will derive charge/discharge kWh locally by integrating power.">Charge Energy Total (kWh)</label>
          ${this._renderEntityPicker({
      value: this._config.analytics_charge_energy_total_kwh || '',
      configValue: 'analytics_charge_energy_total_kwh',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Preferred entity: sensor.main_mainbms_charge_energy_total_kwh</div>
        </div>

        <div class="option">
          <label title="Preferred: a persistent counter of total discharged energy (kWh). If blank, the card will derive charge/discharge kWh locally by integrating power.">Discharge Energy Total (kWh)</label>
          ${this._renderEntityPicker({
      value: this._config.analytics_discharge_energy_total_kwh || '',
      configValue: 'analytics_discharge_energy_total_kwh',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Preferred entity: sensor.main_mainbms_discharge_energy_total_kwh</div>
        </div>

        <div class="option">
          <label title="Preferred: a persistent cycle counter. If blank, equivalent cycles are estimated from discharged kWh / nominal pack kWh.">Cycle Count</label>
          ${this._renderEntityPicker({
      value: this._config.analytics_cycle_count || '',
      configValue: 'analytics_cycle_count',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Preferred entity: sensor.main_mainbms_cycle_count</div>
        </div>

        <div class="option">
          <label title="Optional capacity source (Ah). Used for nominal pack kWh if nominal_capacity_ah is not set, and for SOH if measured_capacity_ah is not set.">Capacity (Ah)</label>
          ${this._renderEntityPicker({
      value: this._config.analytics_capacity_ah || '',
      configValue: 'analytics_capacity_ah',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
          <div class="description">Preferred entity: sensor.main_mainbns_capacity_ah</div>
        </div>

        <div class="option">
          <label title="Optional measured capacity (Ah). When provided, SOH = measured_capacity_ah / nominal_capacity_ah * 100.">Measured Capacity (Ah)</label>
          ${this._renderEntityPicker({
      value: this._config.measured_capacity_ah || '',
      configValue: 'measured_capacity_ah',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
        </div>

        <div class="option">
          <label title="Override SOC used for discharge session tracking (Avg DoD). Defaults to the main SOC entity.">Analytics SOC Entity</label>
          ${this._renderEntityPicker({
      value: this._config.analytics_soc || '',
      configValue: 'analytics_soc',
      includeDomains: ['sensor', 'input_number', 'number'],
      onChanged: this._valueChanged,
    })}
        </div>

        <div class="option">
          <label title="Nominal capacity used for cycles and SOH. Default: 314Ah.">Nominal Capacity (Ah)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.nominal_capacity_ah ?? ''}
            .configValue=${'nominal_capacity_ah'}
            @input=${this._valueChanged}
            placeholder="314"
          ></ha-textfield>
        </div>

        <div class="option">
          <label title="Nominal pack voltage used for cycles when no pack_voltage_max is set. Default: 51.2V for 16S LFP.">Nominal Voltage (V)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.nominal_voltage_v ?? ''}
            .configValue=${'nominal_voltage_v'}
            @input=${this._valueChanged}
            placeholder="51.2"
          ></ha-textfield>
        </div>

        <div class="option">
          <label title="Discharge current threshold for session tracking. Sessions start when current is below -threshold for long enough.">Min Current For Session (A)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.min_current_for_session_a ?? ''}
            .configValue=${'min_current_for_session_a'}
            @input=${this._valueChanged}
            placeholder="2"
          ></ha-textfield>
        </div>

        <div class="option">
          <label title="Minimum discharge session duration required to count toward Avg DoD.">Min Session Seconds</label>
          <ha-textfield
            type="number"
            step="1"
            .value=${this._config.min_session_seconds ?? ''}
            .configValue=${'min_session_seconds'}
            @input=${this._valueChanged}
            placeholder="120"
          ></ha-textfield>
        </div>

        <div class="option">
          <label title="Rolling window of discharge sessions used to compute Avg DoD.">DoD Sessions Window</label>
          <ha-textfield
            type="number"
            step="1"
            .value=${this._config.dod_sessions_window ?? ''}
            .configValue=${'dod_sessions_window'}
            @input=${this._valueChanged}
            placeholder="30"
          ></ha-textfield>
        </div>

        <div class="section-title">Advanced (Optional)</div>

        <div class="option">
          <ha-switch
            .checked=${this._config.show_knee_zone ?? false}
            .configValue=${'show_knee_zone'}
            @change=${this._toggleChanged}
            title="Shows Top Knee Zone when avg cell voltage is high and delta is rising rapidly (uses a short delta history window)."
          >
            <span slot="label">Show "Top Knee Zone" indicator</span>
          </ha-switch>
          <div class="description">Shows when avg cell voltage is high and delta is rising rapidly</div>
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
                <ha-textfield
                  class="range-field"
                  type="number"
                  step="0.5"
                  .value=${(this._config.temp_sensors_min ?? [])[index] ?? ''}
                  placeholder="min"
                  @input=${(ev: CustomEvent) => this._tempSensorRangeChanged(ev, index, 'min')}
                  title="Optional: fixed min for this temperature sparkline"
                ></ha-textfield>
                <ha-textfield
                  class="range-field"
                  type="number"
                  step="0.5"
                  .value=${(this._config.temp_sensors_max ?? [])[index] ?? ''}
                  placeholder="max"
                  @input=${(ev: CustomEvent) => this._tempSensorRangeChanged(ev, index, 'max')}
                  title="Optional: fixed max for this temperature sparkline"
                ></ha-textfield>
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

                  <div class="option">
                    <label>Current Min (A)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.current_min ?? ''}
                      .configValue=${'current_min'}
                      @input=${this._valueChanged}
                      placeholder="e.g. -100"
                    ></ha-textfield>
                    <div class="description">Optional: clamp current sparkline lower bound</div>
                  </div>

                  <div class="option">
                    <label>Current Max (A)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.current_max ?? ''}
                      .configValue=${'current_max'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 100"
                    ></ha-textfield>
                    <div class="description">Optional: clamp current sparkline upper bound</div>
                  </div>

                  <div class="option">
                    <label>Power Min (W)</label>
                    <ha-textfield
                      type="number"
                      step="1"
                      .value=${this._config.power_min ?? ''}
                      .configValue=${'power_min'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 0"
                    ></ha-textfield>
                    <div class="description">Optional: clamp power sparkline lower bound</div>
                  </div>

                  <div class="option">
                    <label>Power Max (W)</label>
                    <ha-textfield
                      type="number"
                      step="1"
                      .value=${this._config.power_max ?? ''}
                      .configValue=${'power_max'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 5000"
                    ></ha-textfield>
                    <div class="description">Optional: clamp power sparkline upper bound</div>
                  </div>

                  <div class="option">
                    <label>Delta Min (V)</label>
                    <ha-textfield
                      type="number"
                      step="0.001"
                      .value=${this._config.delta_min ?? ''}
                      .configValue=${'delta_min'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 0"
                    ></ha-textfield>
                    <div class="description">Optional: clamp delta sparkline lower bound</div>
                  </div>

                  <div class="option">
                    <label>Delta Max (V)</label>
                    <ha-textfield
                      type="number"
                      step="0.001"
                      .value=${this._config.delta_max ?? ''}
                      .configValue=${'delta_max'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 0.15"
                    ></ha-textfield>
                    <div class="description">Optional: clamp delta sparkline upper bound</div>
                  </div>

                  <div class="option">
                    <label>Default Temperature Min (°C)</label>
                    <ha-textfield
                      type="number"
                      step="0.5"
                      .value=${this._config.temperature_min ?? ''}
                      .configValue=${'temperature_min'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 0"
                    ></ha-textfield>
                    <div class="description">Optional fallback: used when a per-temp min/max is not set</div>
                  </div>

                  <div class="option">
                    <label>Default Temperature Max (°C)</label>
                    <ha-textfield
                      type="number"
                      step="0.5"
                      .value=${this._config.temperature_max ?? ''}
                      .configValue=${'temperature_max'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 80"
                    ></ha-textfield>
                    <div class="description">Optional fallback: used when a per-temp min/max is not set</div>
                  </div>

                  <div class="option">
                    <label>MOS Temp Min (°C)</label>
                    <ha-textfield
                      type="number"
                      step="0.5"
                      .value=${this._config.mos_temp_min ?? ''}
                      .configValue=${'mos_temp_min'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 0"
                    ></ha-textfield>
                    <div class="description">Optional: fixed min for MOS temperature sparkline</div>
                  </div>

                  <div class="option">
                    <label>MOS Temp Max (°C)</label>
                    <ha-textfield
                      type="number"
                      step="0.5"
                      .value=${this._config.mos_temp_max ?? ''}
                      .configValue=${'mos_temp_max'}
                      @input=${this._valueChanged}
                      placeholder="e.g. 80"
                    ></ha-textfield>
                    <div class="description">Optional: fixed max for MOS temperature sparkline</div>
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
            .checked=${this._config.miniature_view ?? false}
            .configValue=${'miniature_view'}
            @change=${this._toggleChanged}
          >
            <span slot="label">Miniature View</span>
          </ha-switch>
          <div class="description">Show a compact circular overview (hides cell grid, analytics, and status bar)</div>
        </div>

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
          <ha-switch
            .checked=${this._config.tint_soc_details ?? false}
            .configValue=${'tint_soc_details'}
            @change=${this._toggleChanged}
          >
            <span slot="label">Tint SOC label + details</span>
          </ha-switch>
          <div class="description">Apply charging/discharging/standby colors to the SOC label and the line under it</div>
        </div>

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
          <label>SOC Standby Color</label>
          <ha-textfield
            .value=${this._config.color_standby || ''}
            .configValue=${'color_standby'}
            @input=${this._valueChanged}
            placeholder="rgba(180, 180, 180, 0.75)"
          ></ha-textfield>
          <div class="description">SOC ring color when neither charging nor discharging</div>
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
    const temp_sensors_min = [...(this._config.temp_sensors_min ?? [])];
    const temp_sensors_max = [...(this._config.temp_sensors_max ?? [])];
    temp_sensors_min.push(null);
    temp_sensors_max.push(null);

    this._config = { ...this._config, temp_sensors, temp_sensors_min, temp_sensors_max };
    this._configChanged();
  }

  private _removeTempSensor(index: number) {
    const temp_sensors = [...(this._config.temp_sensors || [])];
    temp_sensors.splice(index, 1);
    const temp_sensors_min = [...(this._config.temp_sensors_min ?? [])];
    const temp_sensors_max = [...(this._config.temp_sensors_max ?? [])];
    if (index >= 0 && index < temp_sensors_min.length) temp_sensors_min.splice(index, 1);
    if (index >= 0 && index < temp_sensors_max.length) temp_sensors_max.splice(index, 1);

    this._config = { ...this._config, temp_sensors, temp_sensors_min, temp_sensors_max };
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

  private _tempSensorRangeChanged(ev: CustomEvent, index: number, which: 'min' | 'max') {
    const target = ev.target as any;
    let value: any = target.value;

    // Support HA textfield event shape
    if ((ev as any).detail && (ev as any).detail.value !== undefined) {
      value = (ev as any).detail.value;
    }

    const num: number | null = value === '' || value === undefined || value === null
      ? null
      : Number(value);

    const nextMin = [...(this._config.temp_sensors_min ?? [])];
    const nextMax = [...(this._config.temp_sensors_max ?? [])];

    // Ensure arrays long enough
    const desiredLen = Math.max((this._config.temp_sensors ?? []).length, index + 1);
    while (nextMin.length < desiredLen) nextMin.push(null);
    while (nextMax.length < desiredLen) nextMax.push(null);

    if (which === 'min') nextMin[index] = Number.isFinite(num) ? num : null;
    else nextMax[index] = Number.isFinite(num) ? num : null;

    this._config = { ...this._config, temp_sensors_min: nextMin, temp_sensors_max: nextMax };
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
        <ha-switch
          .checked=${this._config.cells_prefix_pad ?? false}
          .configValue=${'cells_prefix_pad'}
          @change=${this._toggleChanged}
          title="If enabled, generates cell IDs like ..._01, ..._02 (prefix mode only)."
        >
          <span slot="label">Pad cell numbers (01, 02)</span>
        </ha-switch>
        <div class="description">Enable if your entity IDs use leading zeros</div>
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

      <div class="option">
        <label title="Optional: per-cell wire resistance entity template. Use {n} as the cell number placeholder.">Cell Wire Resistance Template (Optional)</label>
        <ha-textfield
          .value=${this._config.cell_wire_resistance_template || ''}
          .configValue=${'cell_wire_resistance_template'}
          @input=${this._valueChanged}
          placeholder="sensor.jk_bms_cell_{n}_wire_resistance"
        ></ha-textfield>
        <div class="description">Example: sensor.jk_bms_cell_{n}_wire_resistance (uses Pad Cell Numbers if enabled)</div>
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

      <div class="option">
        <label title="Optional: per-cell wire resistance entity template. Use {n} as the cell number placeholder.">Cell Wire Resistance Template (Optional)</label>
        <ha-textfield
          .value=${this._config.cell_wire_resistance_template || ''}
          .configValue=${'cell_wire_resistance_template'}
          @input=${this._valueChanged}
          placeholder="sensor.jk_bms_cell_{n}_wire_resistance"
        ></ha-textfield>
        <div class="description">Uses cell index (1..N). Pad setting applies if enabled.</div>
      </div>
    `;
  }

  private _setCellsMode(mode: 'array' | 'prefix') {
    const newConfig = { ...this._config };

    if (mode === 'array') {
      // Switch to cells array
      const count = newConfig.cells_count || 16;
      const prefix = newConfig.cells_prefix || 'sensor.jk_bms_cell_';
      const pad = newConfig.cells_prefix_pad ?? false;
      newConfig.cells = Array.from({ length: count }, (_, i) => {
        const idx = i + 1;
        const suffix = pad ? String(idx).padStart(2, '0') : String(idx);
        return `${prefix}${suffix}`;
      });
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
