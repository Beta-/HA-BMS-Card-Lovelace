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

    // Optional scaling for pack voltage sparkline
    pack_voltage_min?: number;
    pack_voltage_max?: number;
    cells?: string[];
    cells_prefix?: string;
    cells_count?: number;
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

    cell_columns?: number;

    // Optional temperatures
    mos_temp?: string;
    temp_sensors?: string[];

    // Optional capacity (Ah)
    capacity_remaining?: string;
    capacity_total_ah?: number;

    // Optional color overrides (CSS color strings)
    color_accent?: string;
    color_charge?: string;
    color_discharge?: string;
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
