import type { CellPosition } from './types';

/**
 * Generate cell positions in a 4x4 grid reactor layout
 * This creates a consistent layout where cells are arranged in a grid pattern
 */
export function getCellPositions(cellCount: number = 16): CellPosition[] {
    const positions: CellPosition[] = [];
    const cols = 4;
    const rows = Math.ceil(cellCount / cols);

    // Grid spacing
    const cellSize = 80;
    const gapSize = 20;
    const totalWidth = cols * cellSize + (cols - 1) * gapSize;
    const totalHeight = rows * cellSize + (rows - 1) * gapSize;

    // Center offset
    const offsetX = 50; // Left padding
    const offsetY = 50; // Top padding

    for (let i = 0; i < cellCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        positions.push({
            index: i,
            x: offsetX + col * (cellSize + gapSize) + cellSize / 2,
            y: offsetY + row * (cellSize + gapSize) + cellSize / 2,
        });
    }

    return positions;
}

/**
 * Calculate the viewBox dimensions for the reactor SVG
 */
export function getReactorViewBox(cellCount: number = 16): string {
    const cols = 4;
    const rows = Math.ceil(cellCount / cols);

    const cellSize = 80;
    const gapSize = 20;
    const padding = 100;

    const width = cols * cellSize + (cols - 1) * gapSize + padding * 2;
    const height = rows * cellSize + (rows - 1) * gapSize + padding * 2;

    return `0 0 ${width} ${height}`;
}

/**
 * Get reactor container dimensions
 */
export function getReactorDimensions(cellCount: number = 16): { width: number; height: number } {
    const cols = 4;
    const rows = Math.ceil(cellCount / cols);

    const cellSize = 80;
    const gapSize = 20;
    const padding = 100;

    return {
        width: cols * cellSize + (cols - 1) * gapSize + padding * 2,
        height: rows * cellSize + (rows - 1) * gapSize + padding * 2,
    };
}
