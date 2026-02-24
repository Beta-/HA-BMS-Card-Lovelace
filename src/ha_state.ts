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

    const minVoltage = Math.min(...cellVoltages);
    const maxVoltage = Math.max(...cellVoltages);
    const voltageDelta = maxVoltage - minVoltage;

    // Not balancing if delta is too small
    if (voltageDelta < 0.01) {
        return cellVoltages.map(() => ({ isBalancing: false, direction: null }));
    }

    // Determine which cells are being balanced based on current direction.
    // If we don't have a usable balance current, fall back to generic balancing highlighting.
    return cellVoltages.map(voltage => {
        const voltageDeviation = voltage - minVoltage;
        const isHigh = voltageDeviation > (voltageDelta * 0.7); // Top 30% voltage range
        const isLow = voltageDeviation < (voltageDelta * 0.3);  // Bottom 30% voltage range

        if (!hasDirection) {
            // Unknown direction: show the cells most likely being bled (high cells)
            return { isBalancing: isHigh, direction: null };
        }

        if ((balanceCurrent as number) > 0 && isHigh) {
            // Positive current: high cells are discharging
            return { isBalancing: true, direction: 'discharging' as const };
        } else if ((balanceCurrent as number) < 0 && isLow) {
            // Negative current: low cells are charging
            return { isBalancing: true, direction: 'charging' as const };
        }

        return { isBalancing: false, direction: null };
    });
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
    };
}

/**
 * Format number with fallback
 */
export function formatNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return '—';
    return value.toFixed(decimals);
}
