/** A point in 2D space (SVG / CSS coordinates). */
export interface Point {
  x: number;
  y: number;
}

/**
 * Returns the centre coordinates for each of the 16 cells arranged in a
 * 4 × 4 grid within a `viewBox="0 0 width height"` SVG canvas.
 *
 * Column-major order (column 0 top-left → column 3 bottom-right) so that
 * cell 1 is top-left and cell 16 is bottom-right when read left-to-right,
 * top-to-bottom:
 *
 *   C1  C2  C3  C4
 *   C5  C6  C7  C8
 *   C9  C10 C11 C12
 *   C13 C14 C15 C16
 */
export function getCellPositions(
  width: number,
  height: number,
  cols = 4,
  rows = 4,
): Point[] {
  const colStep = width / cols;
  const rowStep = height / rows;
  const positions: Point[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: colStep * c + colStep / 2,
        y: rowStep * r + rowStep / 2,
      });
    }
  }
  return positions;
}

/** Cell radius used for hit-testing and overlay drawing. */
export const CELL_RADIUS = 28;
