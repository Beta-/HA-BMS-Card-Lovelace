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
        const pad = config.cells_prefix_pad ?? false;
        return Array.from({ length: count }, (_, i) => {
            const idx = i + 1;
            const suffix = pad ? String(idx).padStart(2, '0') : String(idx);
            return `${config.cells_prefix}${suffix}`;
        });
    }

    // Default: assume 16 cells
    return [];
}

/**
 * Generate wire resistance entity IDs from config
 */
export function getCellWireResistanceEntityIds(config: JkBmsReactorCardConfig): string[] {
    if (Array.isArray(config.cell_wire_resistances) && config.cell_wire_resistances.length > 0) {
        return config.cell_wire_resistances;
    }

    const templateRaw = (config.cell_wire_resistance_template ?? '').trim();
    if (!templateRaw) return [];

    const count = (config.cells_count ?? (Array.isArray(config.cells) ? config.cells.length : 0)) || 0;
    if (!Number.isFinite(count) || count <= 0) return [];

    const pad = config.cells_prefix_pad ?? false;
    return Array.from({ length: count }, (_, i) => {
        const idx = i + 1;
        const n = pad ? String(idx).padStart(2, '0') : String(idx);
        return templateRaw.split('{n}').join(n);
    });
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
 * Direction mapping (as rendered) is based on balance current sign.
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
    // NOTE: This mapping is intentionally inverted compared to the previous implementation
    // because the UI direction colors were observed to be swapped.
    if ((balanceCurrent as number) >= 0) {
        out[max.i] = { isBalancing: true, direction: 'charging' };
        out[min.i] = { isBalancing: true, direction: 'discharging' };
    } else {
        out[max.i] = { isBalancing: true, direction: 'discharging' };
        out[min.i] = { isBalancing: true, direction: 'charging' };
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

    const signedCurrentEntity = (config.current ?? '').trim();
    const currentFromSigned = signedCurrentEntity ? getNumericValue(hass, signedCurrentEntity) : null;

    const chargeCurrentEntity = (config.charge_current ?? '').trim();
    const dischargeCurrentEntity = (config.discharge_current ?? '').trim();
    const chargeRaw = chargeCurrentEntity ? getNumericValue(hass, chargeCurrentEntity) : null;
    const dischargeRaw = dischargeCurrentEntity ? getNumericValue(hass, dischargeCurrentEntity) : null;

    // Normalize: charge => positive, discharge => negative
    const chargeA = chargeRaw !== null && Number.isFinite(chargeRaw) ? Math.abs(chargeRaw) : null;
    const dischargeA = dischargeRaw !== null && Number.isFinite(dischargeRaw) ? -Math.abs(dischargeRaw) : null;

    // Prefer explicit signed current if present; otherwise combine charge+discharge.
    // If only one of them exists, use it.
    const current = currentFromSigned !== null && Number.isFinite(currentFromSigned)
        ? currentFromSigned
        : (chargeA !== null || dischargeA !== null)
            ? (chargeA ?? 0) + (dischargeA ?? 0)
            : null;
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

    const wireResEntityIds = getCellWireResistanceEntityIds(config);
    const wireResOhm = wireResEntityIds.length
        ? wireResEntityIds.map(id => (id ? getNumericValue(hass, id) : null))
        : [];

    const cells: CellData[] = cellVoltages.map((voltage, index) => ({
        index,
        voltage,
        isBalancing: balancingData[index].isBalancing,
        balanceDirection: balancingData[index].direction,
        wireResistanceOhm: index < wireResOhm.length ? wireResOhm[index] : null,
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

    const capacityRemainingAh = config.capacity_remaining
        ? getNumericValue(hass, config.capacity_remaining)
        : null;

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
        capacityRemainingAh,
    };
}

/**
 * Format number with fallback
 */
export function formatNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return '—';
    return value.toFixed(decimals);
}
