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
 * Determine which cells are balancing and in which direction
 * Positive balance current = high cells discharging
 * Negative balance current = low cells charging  
 */
export function getBalancingCells(
    hass: HomeAssistant,
    config: JkBmsReactorCardConfig,
    cellVoltages: number[],
    current: number | null,
    delta: number | null,
    balanceCurrent: number | null
): Array<{ isBalancing: boolean; direction: 'charging' | 'discharging' | null }> {
    const balancingEntity = config.balancing;

    // If balancing entity exists and is off, no cells are balancing
    if (balancingEntity && !isEntityOn(hass, balancingEntity)) {
        return cellVoltages.map(() => ({ isBalancing: false, direction: null }));
    }

    const hasDirection = balanceCurrent !== null
        && balanceCurrent !== undefined
        && Math.abs(balanceCurrent) >= 0.001;

    const valid = cellVoltages
        .map((v, i) => ({ v, i }))
        .filter(x => x.v > 0);

    if (valid.length < 2) {
        return cellVoltages.map(() => ({ isBalancing: false, direction: null }));
    }

    const min = valid.reduce((a, b) => (b.v < a.v ? b : a));
    const max = valid.reduce((a, b) => (b.v > a.v ? b : a));
    const voltageDelta = max.v - min.v;

    const threshold = config.balance_threshold_v ?? 0.01;
    if (voltageDelta < threshold) {
        return cellVoltages.map(() => ({ isBalancing: false, direction: null }));
    }

    const out = cellVoltages.map(() => ({ isBalancing: false, direction: null as 'charging' | 'discharging' | null }));

    if (!hasDirection) {
        // If we can't tell direction, at least highlight the max cell.
        out[max.i] = { isBalancing: true, direction: null };
        return out;
    }

    // Always show one cell discharging and one charging.
    // Positive current => energy flows max -> min; negative => min -> max.
    if ((balanceCurrent as number) >= 0) {
        out[max.i] = { isBalancing: true, direction: 'discharging' };
        out[min.i] = { isBalancing: true, direction: 'charging' };
    } else {
        out[max.i] = { isBalancing: true, direction: 'charging' };
        out[min.i] = { isBalancing: true, direction: 'discharging' };
    }

    return out;
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

    const balanceCurrent = config.balancing_current
        ? getNumericValue(hass, config.balancing_current)
        : null;

    const balancingData = getBalancingCells(hass, config, cellVoltages, current, delta, balanceCurrent);
    const isBalancing = balancingData.some(b => b.isBalancing);

    const cells: CellData[] = cellVoltages.map((voltage, index) => ({
        index,
        voltage,
        isBalancing: balancingData[index].isBalancing,
        balanceDirection: balancingData[index].direction,
    }));

    const chargeThreshold = config.charge_threshold_a ?? 0.5;
    const dischargeThreshold = config.discharge_threshold_a ?? 0.5;

    const isCharging = current !== null && current > chargeThreshold;
    const isDischarging = current !== null && current < -dischargeThreshold;

    const mosTemp = config.mos_temp ? getNumericValue(hass, config.mos_temp) : null;
    const temps = (config.temp_sensors ?? []).map((entityId, index) => ({
        index,
        temp: entityId ? getNumericValue(hass, entityId) : null,
    }));

    return {
        voltage,
        current,
        soc,
        cells,
        delta,
        minCell,
        maxCell,
        isBalancing,
        balanceCurrent,
        isCharging,
        isDischarging,
        mosTemp,
        temps,
    };
}

/**
 * Format number with fallback
 */
export function formatNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return '—';
    return value.toFixed(decimals);
}
