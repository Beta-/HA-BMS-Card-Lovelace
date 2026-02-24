import type { HomeAssistant, JkBmsReactorCardConfig, CellData, PackState } from './types';

/**
 * Safely get entity state as string
 */
export function getEntityState(hass: HomeAssistant, entityId: string): string | null {
    const entity = hass.states[entityId];
    return entity?.state ?? null;
}

/**
 * Parse entity state as float
 */
export function parseFloat(state: string | null): number | null {
    if (state === null || state === 'unknown' || state === 'unavailable') {
        return null;
    }
    const value = Number(state);
    return isNaN(value) ? null : value;
}

/**
 * Get numeric value from entity
 */
export function getNumericValue(hass: HomeAssistant, entityId: string): number | null {
    const state = getEntityState(hass, entityId);
    return parseFloat(state);
}

/**
 * Check if entity is "on" or truthy
 */
export function isEntityOn(hass: HomeAssistant, entityId: string): boolean {
    const state = getEntityState(hass, entityId);
    if (!state) return false;
    return state.toLowerCase() === 'on' || state === '1' || state === 'true';
}

/**
 * Generate cell entity IDs from config
 */
export function getCellEntityIds(config: JkBmsReactorCardConfig): string[] {
    if (config.cells && config.cells.length > 0) {
        return config.cells;
    }

    if (config.cells_prefix && config.cells_count) {
        const count = config.cells_count;
        return Array.from({ length: count }, (_, i) => `${config.cells_prefix}${String(i + 1).padStart(2, '0')}`);
    }

    // Default: assume 16 cells
    return [];
}

/**
 * Get all cell voltages
 */
export function getCellVoltages(hass: HomeAssistant, config: JkBmsReactorCardConfig): number[] {
    const entityIds = getCellEntityIds(config);
    return entityIds.map(id => getNumericValue(hass, id) ?? 0);
}

/**
 * Determine which cells are balancing
 */
export function getBalancingCells(
    hass: HomeAssistant,
    config: JkBmsReactorCardConfig,
    cellVoltages: number[],
    current: number | null,
    delta: number | null
): boolean[] {
    const balancingEntity = config.balancing;

    // If balancing entity exists and is on, try to infer which cells
    if (balancingEntity) {
        const isBalancing = isEntityOn(hass, balancingEntity);
        if (!isBalancing) {
            return cellVoltages.map(() => false);
        }
    }

    // Infer balancing cells based on max voltage
    const maxVoltage = Math.max(...cellVoltages);
    const threshold = config.balance_threshold_v ?? 0.01;

    // Only infer balancing if:
    // 1. We're charging (current > threshold)
    // 2. Delta is significant OR max cell is high
    const chargeThreshold = config.charge_threshold_a ?? 0.5;
    const isCharging = current !== null && current > chargeThreshold;
    const hasSignificantDelta = delta !== null && delta > 0.02;
    const hasHighCell = maxVoltage > 3.35;

    if (config.balancing && isEntityOn(hass, config.balancing)) {
        // Explicit balancing entity is on
        return cellVoltages.map(v => Math.abs(v - maxVoltage) <= threshold);
    } else if (isCharging && (hasSignificantDelta || hasHighCell)) {
        // Infer balancing during charging with conditions
        return cellVoltages.map(v => Math.abs(v - maxVoltage) <= threshold);
    }

    return cellVoltages.map(() => false);
}

/**
 * Compute full pack state from HA entities
 */
export function computePackState(
    hass: HomeAssistant,
    config: JkBmsReactorCardConfig
): PackState {
    const voltage = getNumericValue(hass, config.pack_voltage);
    const current = getNumericValue(hass, config.current);
    const soc = getNumericValue(hass, config.soc);

    const cellVoltages = getCellVoltages(hass, config);

    // Compute delta if not provided
    let delta: number | null = null;
    if (config.delta) {
        delta = getNumericValue(hass, config.delta);
    } else if (cellVoltages.length > 0) {
        const validVoltages = cellVoltages.filter(v => v > 0);
        if (validVoltages.length > 0) {
            const minV = Math.min(...validVoltages);
            const maxV = Math.max(...validVoltages);
            delta = maxV - minV;
        }
    }

    const minCell = cellVoltages.length > 0 ? Math.min(...cellVoltages.filter(v => v > 0)) : null;
    const maxCell = cellVoltages.length > 0 ? Math.max(...cellVoltages) : null;

    const balancingFlags = getBalancingCells(hass, config, cellVoltages, current, delta);
    const isBalancing = balancingFlags.some(b => b);

    const cells: CellData[] = cellVoltages.map((voltage, index) => ({
        index,
        voltage,
        isBalancing: balancingFlags[index],
    }));

    const chargeThreshold = config.charge_threshold_a ?? 0.5;
    const dischargeThreshold = config.discharge_threshold_a ?? 0.5;

    const isCharging = current !== null && current > chargeThreshold;
    const isDischarging = current !== null && current < -dischargeThreshold;

    return {
        voltage,
        current,
        soc,
        cells,
        delta,
        minCell,
        maxCell,
        isBalancing,
        isCharging,
        isDischarging,
    };
}

/**
 * Format number with fallback
 */
export function formatNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return '—';
    return value.toFixed(decimals);
}
