/**
 * Home Assistant types and interfaces
 */

export interface HomeAssistant {
    states: {
        [entity_id: string]: HassEntity | undefined;
    };
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

/**
 * Cell data structure
 */
export interface CellData {
    index: number;
    voltage: number;
    isBalancing: boolean;
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
    isCharging: boolean;
    isDischarging: boolean;
}
