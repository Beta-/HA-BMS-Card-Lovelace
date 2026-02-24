/** Minimal typing for Home Assistant state objects used by the card. */
export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

export interface Hass {
  states: Record<string, HassEntity>;
}

/**
 * Safely read a hass entity state string.
 * Returns undefined when the entity doesn't exist.
 */
export function getState(hass: Hass, entityId: string | undefined): string | undefined {
  if (!entityId) return undefined;
  return hass.states[entityId]?.state;
}

/**
 * Parse a float from an entity state.
 * Returns NaN when the entity is missing or the value is unparseable.
 */
export function getFloat(hass: Hass, entityId: string | undefined): number {
  const s = getState(hass, entityId);
  if (s === undefined) return NaN;
  return parseFloat(s);
}

/**
 * Determine whether an entity represents a truthy / "on" boolean state.
 */
export function getBool(hass: Hass, entityId: string | undefined): boolean {
  const s = getState(hass, entityId);
  if (s === undefined) return false;
  return s === "on" || s === "true" || s === "1" || s === "yes";
}

/**
 * Build an array of 16 cell voltage values from config.
 *
 * Config can supply either:
 *   - `cells`: explicit array of 16 entity_ids, OR
 *   - `cells_prefix` + `cells_count` (default 16), e.g. prefix "sensor.bms_cell_"
 *     yields ["sensor.bms_cell_1", …, "sensor.bms_cell_16"].
 */
export function getCellEntityIds(config: {
  cells?: string[];
  cells_prefix?: string;
  cells_count?: number;
}): string[] {
  if (config.cells && config.cells.length > 0) {
    return config.cells.slice(0, 16);
  }
  if (config.cells_prefix) {
    const count = config.cells_count ?? 16;
    return Array.from({ length: count }, (_, i) => `${config.cells_prefix}${i + 1}`);
  }
  return [];
}

/**
 * Returns the array of cell voltages (may contain NaN for missing entities).
 */
export function getCellVoltages(hass: Hass, entityIds: string[]): number[] {
  return entityIds.map((id) => getFloat(hass, id));
}

/** Format a number to fixed decimal places, or return "—" if NaN. */
export function fmt(value: number, decimals = 3): string {
  return isNaN(value) ? "—" : value.toFixed(decimals);
}
