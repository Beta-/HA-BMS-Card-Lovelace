/**
 * Home Assistant types and interfaces
 */

export interface HomeAssistant {
    states: {
        [entity_id: string]: HassEntity | undefined;
    };
    callService: (domain: string, service: string, serviceData?: any) => Promise<void>;
    callApi?: <T = any>(method: string, path: string, parameters?: any) => Promise<T>;
    // Add other HA properties as needed
}

export interface HassEntity {
    entity_id: string;
    state: string;
    attributes: Record<string, any>;
    last_changed: string;
    last_updated: string;
}

/**
 * Card configuration interface
 */
export interface JkBmsReactorCardConfig {
    type: string;
    pack_voltage: string;
    current: string;
    soc: string;

    // Optional alternative to `current`: provide separate sensors.
    // charge_current is normalized to positive, discharge_current to negative.
    charge_current?: string;
    discharge_current?: string;

    // Optional: average cell voltage provided by BMS/HA
    avg_cell_voltage?: string;

    // Optional scaling for pack voltage sparkline
    pack_voltage_min?: number;
    pack_voltage_max?: number;
    cells?: string[];
    cells_prefix?: string;
    cells_count?: number;
    // If true, generates cell IDs like ..._01, ..._02, etc. (prefix mode only)
    cells_prefix_pad?: boolean;

    // Optional: per-cell wire resistance (Ohm). Used only for display.
    // Provide either explicit entities (cell_wire_resistances) or a template with {n} placeholder.
    // Example template: sensor.jk_bms_cell_{n}_wire_resistance
    cell_wire_resistances?: string[];
    cell_wire_resistance_template?: string;
    balancing?: string;
    balancing_current?: string;
    delta?: string;
    charging_switch?: string;
    discharging_switch?: string;
    balance_threshold_v?: number;
    charge_threshold_a?: number;
    discharge_threshold_a?: number;
    show_overlay?: boolean;
    show_cell_labels?: boolean;
    compact_cells?: boolean;

    // Optional cell heatmap mode
    cell_heatmap_mode?: 'normal' | 'spread';

    cell_columns?: number;

    // Cell ordering in the 2-column reactor grid
    cell_order_mode?: 'linear' | 'bank';

    // Optional temperatures
    mos_temp?: string;
    temp_sensors?: string[];

    // Optional capacity (Ah)
    capacity_remaining?: string;
    capacity_total_ah?: number;

    // Battery analytics (optional)
    // Preferred direct sensors (if present):
    // - sensor.main_mainbms_charge_energy_total_kwh
    // - sensor.main_mainbms_discharge_energy_total_kwh
    // - sensor.main_mainbms_cycle_count
    // - sensor.main_mainbns_capacity_ah (nominal/measured capacity)
    // If missing, the card derives values locally where possible.
    analytics_charge_energy_total_kwh?: string;
    analytics_discharge_energy_total_kwh?: string;
    analytics_cycle_count?: string;
    analytics_capacity_ah?: string;
    analytics_soc?: string; // override SOC entity for analytics sessions
    measured_capacity_ah?: string; // if present, used to estimate SOH

    // UI toggle for analytics section
    show_battery_analytics?: boolean;

    nominal_capacity_ah?: number; // default 314
    nominal_voltage_v?: number;   // default 51.2 (16S LFP)
    min_current_for_session_a?: number; // default 2A (discharge only)
    min_session_seconds?: number; // default 120s
    dod_sessions_window?: number; // default 30

    // Optional energy estimate under SOC
    // If not provided, total kWh can be derived from capacity_total_ah and pack_voltage_max.
    // If per-cell UVP/SOC100 voltages are not provided, they can be derived from pack_voltage_min/max and cell count.
    energy_total_kwh?: number;
    energy_uvp_cell_v?: number;
    energy_soc100_cell_v?: number;

    // Optional advanced indicator
    show_knee_zone?: boolean;

    // Optional color overrides (CSS color strings)
    color_accent?: string;
    color_charge?: string;
    color_discharge?: string;
    color_standby?: string;
    tint_soc_details?: boolean;
    color_balance_charge?: string;
    color_balance_discharge?: string;
    color_min_cell?: string;
    color_max_cell?: string;
}

/**
 * Cell data structure
 */
export interface CellData {
    index: number;
    voltage: number;
    isBalancing: boolean;
    balanceDirection?: 'charging' | 'discharging' | null;
    wireResistanceOhm?: number | null;
}

/**
 * Cell position for layout
 */
export interface CellPosition {
    x: number;
    y: number;
    index: number;
}

/**
 * Pack state computed from entities
 */
export interface PackState {
    voltage: number | null;
    current: number | null;
    soc: number | null;
    cells: CellData[];
    delta: number | null;
    minCell: number | null;
    maxCell: number | null;
    isBalancing: boolean;
    balanceCurrent: number | null;
    isCharging: boolean;
    isDischarging: boolean;

    mosTemp?: number | null;
    temps?: Array<{ index: number; temp: number | null }>;

    capacityRemainingAh?: number | null;
}
