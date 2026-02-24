import { svg } from 'lit';
import type { CellData, CellPosition } from './types';
import { getCellPositions } from './reactor_layout';

/**
 * Generate SVG overlay for balancing visualization
 * Shows connecting lines between balancing cells and glow effects
 */
export function renderBalanceOverlay(cells: CellData[], isBalancing: boolean) {
    if (!isBalancing) {
        return svg``;
    }

    const positions = getCellPositions(cells.length);
    const balancingCells = cells.filter(c => c.isBalancing);
    const balancingPositions = balancingCells.map(c => positions[c.index]);

    if (balancingPositions.length === 0) {
        return svg``;
    }

    // Generate connecting lines between balancing cells
    const lines = [];
    const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
    const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;

    // Draw lines from center to each balancing cell
    for (const pos of balancingPositions) {
        lines.push(svg`
      <line
        x1="${centerX}"
        y1="${centerY}"
        x2="${pos.x}"
        y2="${pos.y}"
        class="balance-line"
        stroke="var(--balance-color, #ffa500)"
        stroke-width="2"
        stroke-dasharray="5,5"
      />
    `);
    }

    // Draw circles at balancing cell positions for glow effect
    const glowCircles = balancingPositions.map(pos => svg`
    <circle
      cx="${pos.x}"
      cy="${pos.y}"
      r="35"
      class="balance-glow"
      fill="none"
      stroke="var(--balance-color, #ffa500)"
      stroke-width="2"
      opacity="0.6"
    />
  `);

    return svg`
    <g class="balance-overlay">
      ${lines}
      ${glowCircles}
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="10"
        class="balance-center"
        fill="var(--balance-color, #ffa500)"
        opacity="0.8"
      />
    </g>
  `;
}

/**
 * Generate energy flow animation overlay
 */
export function renderEnergyFlow(isCharging: boolean, isDischarging: boolean) {
    if (!isCharging && !isDischarging) {
        return svg``;
    }

    const direction = isCharging ? 'charging' : 'discharging';
    const positions = getCellPositions(16);

    // Create subtle energy flow particles
    const particles = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
        const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
        const radius = 80;

        particles.push(svg`
      <circle
        cx="${centerX + Math.cos(angle) * radius}"
        cy="${centerY + Math.sin(angle) * radius}"
        r="3"
        class="energy-particle ${direction}"
        fill="var(--energy-color, #4CAF50)"
        opacity="0.7"
      />
    `);
    }

    return svg`
    <g class="energy-flow ${direction}">
      ${particles}
    </g>
  `;
}
