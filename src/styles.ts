import { css } from "lit";

export const cardStyles = css`
  :host {
    display: block;
    --bms-bg: #1a1a2e;
    --bms-surface: #16213e;
    --bms-cell-bg: #0f3460;
    --bms-cell-border: #533483;
    --bms-text: #e0e0e0;
    --bms-text-dim: #888;
    --bms-accent: #e94560;
    --bms-good: #4caf50;
    --bms-warn: #ff9800;
    --bms-bad: #f44336;
    --bms-balance-color: #00e5ff;
    --bms-charging-color: #76ff03;
    --bms-discharging-color: #ff6d00;
  }

  ha-card {
    background: var(--bms-bg);
    color: var(--bms-text);
    font-family: var(--paper-font-body1_-_font-family, sans-serif);
    border-radius: 12px;
    overflow: hidden;
    padding: 0;
  }

  .card-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
    padding: 12px 16px 8px;
    background: var(--bms-surface);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  .header-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 64px;
  }

  .header-stat .label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--bms-text-dim);
  }

  .header-stat .value {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .header-stat .value.charging {
    color: var(--bms-charging-color);
  }

  .header-stat .value.discharging {
    color: var(--bms-discharging-color);
  }

  .header-stat .value.balancing {
    color: var(--bms-balance-color);
  }

  /* ── Reactor grid ──────────────────────────────────────── */
  .reactor-wrapper {
    position: relative;
    padding: 12px;
  }

  .reactor-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    position: relative;
    z-index: 1;
  }

  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bms-cell-bg);
    border: 1px solid var(--bms-cell-border);
    border-radius: 8px;
    padding: 6px 4px 4px;
    min-height: 56px;
    position: relative;
    transition: border-color 0.3s;
  }

  .cell.balancing {
    border-color: var(--bms-balance-color);
    animation: cell-pulse 1.4s ease-in-out infinite;
  }

  .cell.max-cell {
    border-color: var(--bms-warn);
  }

  .cell.min-cell {
    border-color: var(--bms-bad);
  }

  .cell-label {
    font-size: 0.6rem;
    color: var(--bms-text-dim);
    letter-spacing: 0.04em;
    line-height: 1;
    margin-bottom: 2px;
  }

  .cell-value {
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.2;
  }

  /* ── SVG overlay ───────────────────────────────────────── */
  .balance-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
  }

  .balance-line {
    animation: dash-flow 1.2s linear infinite;
  }

  .balance-ring {
    animation: ring-pulse 1.4s ease-in-out infinite;
  }

  /* ── Flow indicator ────────────────────────────────────── */
  .flow-bar {
    height: 3px;
    margin: 0 16px 10px;
    border-radius: 2px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.07);
  }

  .flow-bar .flow-fill {
    height: 100%;
    border-radius: 2px;
    width: 40%;
  }

  .flow-bar.charging .flow-fill {
    background: var(--bms-charging-color);
    animation: flow-charge 1s linear infinite;
  }

  .flow-bar.discharging .flow-fill {
    background: var(--bms-discharging-color);
    animation: flow-discharge 1s linear infinite;
  }

  /* ── Keyframes ─────────────────────────────────────────── */
  @keyframes cell-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); }
    50%       { box-shadow: 0 0 8px 3px rgba(0, 229, 255, 0.45); }
  }

  @keyframes dash-flow {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -20; }
  }

  @keyframes ring-pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 1; }
  }

  @keyframes flow-charge {
    from { transform: translateX(-100%); }
    to   { transform: translateX(250%); }
  }

  @keyframes flow-discharge {
    from { transform: translateX(250%); }
    to   { transform: translateX(-100%); }
  }
`;
