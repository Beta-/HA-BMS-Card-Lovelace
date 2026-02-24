import { html, svg, TemplateResult } from "lit";
import { Point, CELL_RADIUS } from "./reactor_layout.js";

/**
 * Render an SVG overlay that:
 * 1. Draws dashed animated lines connecting the balancing-cell centres.
 * 2. Draws a pulsing glow ring around each balancing cell.
 *
 * @param positions - Array of centre coordinates for all 16 cells.
 * @param balancingIndices - Zero-based indices of cells that are balancing.
 * @param viewWidth - SVG viewBox width.
 * @param viewHeight - SVG viewBox height.
 */
export function renderBalanceOverlay(
  positions: Point[],
  balancingIndices: number[],
  viewWidth: number,
  viewHeight: number,
): TemplateResult {
  if (balancingIndices.length === 0) {
    return html``;
  }

  const balancingPoints = balancingIndices
    .filter((i) => i >= 0 && i < positions.length)
    .map((i) => positions[i]);

  // Build a polyline path connecting the balancing cells in index order.
  const pathPoints = balancingPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return html`
    <svg
      class="balance-overlay"
      viewBox="0 0 ${viewWidth} ${viewHeight}"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      ${balancingPoints.length > 1
        ? svg`
          <polyline
            class="balance-line"
            points="${pathPoints}"
            fill="none"
            stroke="var(--bms-balance-color, #00e5ff)"
            stroke-width="2"
            stroke-dasharray="6 4"
            filter="url(#glow)"
          />`
        : ""}

      ${balancingPoints.map(
        (p) => svg`
          <circle
            class="balance-ring"
            cx="${p.x}"
            cy="${p.y}"
            r="${CELL_RADIUS + 4}"
            fill="none"
            stroke="var(--bms-balance-color, #00e5ff)"
            stroke-width="2"
            filter="url(#glow)"
          />`,
      )}
    </svg>
  `;
}
