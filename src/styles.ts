import { css } from 'lit';

export const styles = css`
  :host {
    --accent-color: #41cd52;
    --accent-color-dim: rgba(65, 205, 82, 0.2);
    --discharge-color: #3090c7;
    --discharge-color-dim: rgba(48, 144, 199, 0.2);
    --solar-color: #ffd30f;
    --balancing-color: #ff6333;
    --balance-charge-color: #ff6b6b;
    --balance-discharge-color: #339af0;
    --min-cell-color: #ff6b6b;
    --max-cell-color: #51cf66;
    --flow-in-glow: rgba(81, 207, 102, 0.22);
    --flow-in-border: rgba(81, 207, 102, 0.35);
    --flow-out-glow: rgba(51, 154, 240, 0.22);
    --flow-out-border: rgba(51, 154, 240, 0.35);
    --panel-bg: var(--secondary-background-color, rgba(255, 255, 255, 0.05));
    --panel-border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
  }

  ha-card {
    padding: 16px;
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Flow Section - Top area with charge/reactor/discharge */
  .flow-section {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    align-items: center;
    gap: 16px;
    position: relative;
    min-height: 180px;
    margin-bottom: 16px;
  }

  .flow-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    z-index: 2;
  }

  .icon-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid var(--secondary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--panel-bg);
    transition: all 0.3s ease;
  }

  .icon-circle.clickable {
    cursor: pointer;
  }

  .icon-circle.clickable:hover {
    transform: scale(1.1);
    border-color: var(--accent-color);
  }

  .icon-circle ha-icon {
    --mdc-icon-size: 32px;
    color: #666;
    transition: color 0.3s ease;
  }

  .icon-circle.active-charge {
    border-color: var(--solar-color);
    box-shadow: 0 0 20px var(--solar-color);
  }

  .icon-circle.active-charge ha-icon {
    color: var(--solar-color);
  }

  .icon-circle.active-discharge {
    border-color: var(--discharge-color);
    box-shadow: 0 0 20px var(--discharge-color);
  }

  .icon-circle.active-discharge ha-icon {
    color: var(--discharge-color);
  }

  .node-label {
    font-size: 0.9em;
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  .node-status {
    font-size: 0.85em;
  }

  .node-current {
    font-size: 0.9em;
    font-weight: bold;
    color: var(--accent-color);
    margin-top: 2px;
  }

  /* Reactor Ring Container with Progress */
  .reactor-ring-container {
    position: relative;
    width: 160px;
    height: 160px;
    margin: 0 auto;
  }

  .soc-progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .soc-segmented {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .soc-seg {
    stroke-width: 2.2;
    stroke-linecap: butt;
  }

  .soc-seg.inactive {
    stroke: rgba(255, 255, 255, 0.12);
  }

  .soc-seg.active {
    stroke: rgba(255, 255, 255, 0.85);
  }

  .soc-segmented.charging .soc-seg.active {
    stroke: var(--accent-color);
    filter: drop-shadow(0 0 3px var(--flow-in-glow));
  }

  .soc-segmented.discharging .soc-seg.active {
    stroke: var(--discharge-color);
    filter: drop-shadow(0 0 3px var(--flow-out-glow));
  }

  .soc-bg {
    fill: none;
    stroke: var(--panel-bg);
    stroke-width: 8;
  }

  .soc-fill {
    fill: none;
    stroke: var(--accent-color);
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
  }

  .soc-fill.balancing-active {
    stroke: var(--balancing-color);
  }

  .status-on {
    color: var(--accent-color);
    font-weight: bold;
  }

  .status-off {
    color: var(--disabled-text-color, #666);
  }

  /* Reactor Ring - Central SOC Display */
  .reactor-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130px;
    height: 130px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--card-background-color);
    transition: all 0.3s ease;
  }

  .soc-label {
    font-size: 0.9em;
    color: var(--secondary-text-color);
    margin-bottom: -4px;
  }

  .soc-value {
    font-size: 2.8em;
    font-weight: bold;
    color: var(--accent-color);
    line-height: 1;
  }

  .capacity-text {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  /* SVG Flow Lines */
  .flow-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .flow-line {
    stroke-width: 3;
    transition: stroke 0.3s ease;
  }

  .flow-line.active-charge {
    stroke: var(--solar-color);
  }

  .flow-line.active-discharge {
    stroke: var(--discharge-color);
  }

  .flow-line.inactive {
    stroke: #444;
    opacity: 0.3;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat-panel {
    background: var(--panel-bg);
    border: var(--panel-border);
    border-radius: 10px;
    padding: 12px 8px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .stat-panel.flow-in {
    box-shadow: 0 0 18px var(--flow-in-glow);
    border-color: var(--flow-in-border);
  }

  .stat-panel.flow-out {
    box-shadow: 0 0 18px var(--flow-out-glow);
    border-color: var(--flow-out-border);
  }

  .stat-sparkline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(65, 205, 82, 0.05) 0%, 
      rgba(65, 205, 82, 0.15) 50%,
      rgba(65, 205, 82, 0.05) 100%);
    opacity: 0.5;
    z-index: 0;
  }

  .stat-sparkline-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.55;
    z-index: 0;
  }

  .stat-sparkline-svg .sparkline {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .stat-sparkline-svg .sparkline.voltage {
    stroke: rgba(255, 255, 255, 0.22);
  }

  .stat-panel.flow-in .stat-sparkline-svg .sparkline.current,
  .stat-panel.flow-in .stat-sparkline-svg .sparkline.power {
    stroke: var(--flow-in-border);
  }

  .stat-panel.flow-out .stat-sparkline-svg .sparkline.current,
  .stat-panel.flow-out .stat-sparkline-svg .sparkline.power {
    stroke: var(--flow-out-border);
  }

  .stat-panel:not(.flow-in):not(.flow-out) .stat-sparkline-svg .sparkline.current,
  .stat-panel:not(.flow-in):not(.flow-out) .stat-sparkline-svg .sparkline.power {
    stroke: rgba(255, 255, 255, 0.18);
  }

  .stat-sparkline-svg .sparkline.temp {
    stroke: rgba(255, 211, 15, 0.45);
  }

  .stat-label {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .stat-value {
    font-size: 1.3em;
    font-weight: bold;
    color: var(--primary-text-color);
    position: relative;
    z-index: 1;
  }

  .delta-minmax-panel {
    padding: 10px 8px;
    grid-column: span 2;
  }

  .temps-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: -8px;
    margin-bottom: 16px;
  }

  .delta-minmax-container {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
  }

  .delta-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
    position: relative;
    overflow: hidden;
  }

  .delta-sparkline-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.55;
    z-index: 0;
  }

  .delta-sparkline-svg .sparkline.delta {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke: rgba(255, 255, 255, 0.22);
  }

  .delta-label {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    font-weight: bold;
    position: relative;
    z-index: 1;
  }

  .delta-value {
    font-weight: bold;
    color: var(--primary-text-color);
    font-size: 1.1em;
    position: relative;
    z-index: 1;
  }

  .delta-divider {
    color: var(--secondary-text-color);
    opacity: 0.3;
    font-size: 1.2em;
    margin: 0 2px;
    display: flex;
    align-items: center;
  }

  .delta-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 80px;
    flex: 0 0 auto;
  }

  .minmax-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    line-height: 1;
  }

  .minmax-icon {
    --mdc-icon-size: 14px;
    opacity: 0.85;
  }

  .max-value {
    font-weight: bold;
    color: var(--max-cell-color);
    font-size: 0.9em;
  }

  .minmax-divider {
    width: 100%;
    height: 1px;
    background: var(--divider-color);
    opacity: 0.6;
    margin: 2px 0;
  }

  .min-value {
    font-weight: bold;
    color: var(--min-cell-color);
    font-size: 0.9em;
  }

  .cell.balancing {
    border-color: var(--balancing-color);
    animation: cell-balance-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 15px var(--balancing-color);
    position: relative;
  }

  .cell.balancing::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 14px;
    border: 2px solid var(--balancing-color);
    opacity: 0.5;
    animation: balance-ring-pulse 2s ease-in-out infinite;
  }

  .cell.balancing::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 16px;
    border: 1px solid var(--balancing-color);
    opacity: 0.3;
    animation: balance-ring-pulse 2s ease-in-out infinite 0.5s;
  }

  /* Reactor Grid - Cell Display */
  .reactor-container {
    position: relative;
    width: 100%;
  }

  .reactor-grid {
    display: grid;
    grid-template-columns: 1fr var(--reactor-mid-gap, 28px) 1fr;
    column-gap: 0;
    row-gap: 8px;
    position: relative;
  }

  .cell-wrap {
    display: contents;
  }

  .cell-flow-column {
    grid-column: 2;
    position: relative;
    pointer-events: none;
    display: flex;
    align-items: stretch;
    justify-content: center;
  }

  .cell-flow-svg {
    width: 100%;
    height: 100%;
  }

  .cell-flow-path {
    fill: none;
    stroke: rgba(255, 255, 255, 0.18);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cell-flow-column.charging .cell-flow-path {
    stroke: var(--accent-color);
    filter: drop-shadow(0 0 4px var(--flow-in-glow));
  }

  .cell-flow-column.discharging .cell-flow-path {
    stroke: var(--discharge-color);
    filter: drop-shadow(0 0 4px var(--flow-out-glow));
  }

  .reactor-grid.compact {
    row-gap: 4px;
  }

  .reactor-grid.compact .cell {
    aspect-ratio: auto;
    min-height: 28px;
    padding: 6px 8px;
    border-radius: 10px;
    flex-direction: row;
    justify-content: space-between;
  }

  .reactor-grid.compact .cell-compact-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding-right: 12px;
  }

  .reactor-grid.compact .cell-index {
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text-color);
  }

  .reactor-grid.compact .cell-compact-voltage {
    font-size: 13px;
    font-weight: 800;
    color: var(--primary-text-color);
  }

  .reactor-grid.compact .balancing-indicator {
    top: 50%;
    transform: translateY(-50%);
  }

  .cell {
    aspect-ratio: 1;
    background: var(--panel-bg);
    border: 2px solid var(--panel-border);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .cell.balancing-discharging {
    border-color: var(--balance-discharge-color);
    animation: cell-balance-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 15px var(--balance-discharge-color);
    position: relative;
  }

  .cell.balancing-discharging::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 14px;
    border: 2px solid var(--balance-discharge-color);
    opacity: 0.5;
    animation: balance-ring-pulse 2s ease-in-out infinite;
  }

  .cell.balancing-discharging::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 16px;
    border: 1px solid var(--balance-discharge-color);
    opacity: 0.3;
    animation: balance-ring-pulse 2s ease-in-out infinite 0.5s;
  }

  .cell.balancing-charging {
    border-color: var(--balance-charge-color);
    animation: cell-balance-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 15px var(--balance-charge-color);
    position: relative;
  }

  .cell.balancing-charging::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 14px;
    border: 2px solid var(--balance-charge-color);
    opacity: 0.5;
    animation: balance-ring-pulse 2s ease-in-out infinite;
  }

  .cell.balancing-charging::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 16px;
    border: 1px solid var(--balance-charge-color);
    opacity: 0.3;
    animation: balance-ring-pulse 2s ease-in-out infinite 0.5s;
  }

  @keyframes balance-ring-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.6;
    }
  }

  .balancing-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--balancing-color);
    animation: balancing-blink 1s ease-in-out infinite;
    box-shadow: 0 0 8px var(--balancing-color);
  }

  .balancing-discharging .balancing-indicator {
    background: var(--balance-discharge-color);
    box-shadow: 0 0 8px var(--balance-discharge-color);
  }

  .balancing-charging .balancing-indicator {
    background: var(--balance-charge-color);
    box-shadow: 0 0 8px var(--balance-charge-color);
  }

  @keyframes balancing-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes cell-balance-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 20px var(--balancing-color);
    }
  }

  .cell-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
    font-weight: 500;
  }

  .cell-voltage {
    font-size: 16px;
    font-weight: 700;
    color: var(--primary-text-color);
  }

  .cell-voltage-unit {
    font-size: 11px;
    margin-left: 2px;
    opacity: 0.8;
  }

  /* Cell voltage color coding */
  .cell.low-voltage {
    border-color: #ff9800;
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
  }

  .cell.low-voltage .cell-voltage {
    color: #ff9800;
  }

  .cell.high-voltage {
    border-color: #2196f3;
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  }

  .cell.high-voltage .cell-voltage {
    color: #2196f3;
  }

  .cell.normal-voltage {
    border-color: var(--accent-color);
    background: linear-gradient(135deg, var(--accent-color-dim) 0%, rgba(65, 205, 82, 0.05) 100%);
  }

  .cell.normal-voltage .cell-voltage {
    color: var(--accent-color);
  }

  /* Status Bar */
  .status-bar {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .status-badge {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-badge.charging {
    background: rgba(255, 211, 15, 0.15);
    color: var(--solar-color);
    border: 1px solid var(--solar-color);
  }

  .status-badge.discharging {
    background: var(--discharge-color-dim);
    color: var(--discharge-color);
    border: 1px solid var(--discharge-color);
  }

  .status-badge.balancing {
    background: rgba(255, 99, 51, 0.15);
    color: var(--balancing-color);
    border: 1px solid var(--balancing-color);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: status-blink 1.5s ease-in-out infinite;
  }

  @keyframes status-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Responsive design */
  @media (max-width: 600px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .delta-minmax-panel {
      grid-column: span 2;
    }

    .flow-section {
      grid-template-columns: 0.8fr 1.2fr 0.8fr;
      min-height: 150px;
    }

    .icon-circle {
      width: 50px;
      height: 50px;
    }

    .icon-circle ha-icon {
      --mdc-icon-size: 26px;
    }

    .reactor-ring-container {
      width: 130px;
      height: 130px;
    }

    .reactor-ring {
      width: 100px;
      height: 100px;
    }

    .soc-value {
      font-size: 2.2em;
    }

    .reactor-grid {
      gap: 6px;
    }

    .cell-voltage {
      font-size: 14px;
    }
  }
`;
