import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    --primary-color: #03a9f4;
    --balance-color: #ffa500;
    --energy-color: #4caf50;
    --warning-color: #ff9800;
    --danger-color: #f44336;
    --text-primary: var(--primary-text-color, #212121);
    --text-secondary: var(--secondary-text-color, #727272);
    --card-background: var(--ha-card-background, var(--card-background-color, #fff));
    --divider-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .card-content {
    padding: 16px;
    background: var(--card-background);
  }

  .pack-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .info-item {
    text-align: center;
    padding: 8px;
    background: var(--primary-background-color, #fafafa);
    border-radius: 8px;
  }

  .info-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .info-unit {
    font-size: 14px;
    color: var(--text-secondary);
    margin-left: 2px;
  }

  .reactor-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .reactor-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    position: relative;
  }

  .cell {
    aspect-ratio: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .cell.balancing {
    animation: pulse-glow 2s ease-in-out infinite;
    box-shadow: 0 0 20px var(--balance-color);
  }

  .cell-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 4px;
    font-weight: 500;
  }

  .cell-voltage {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
  }

  .cell-voltage-unit {
    font-size: 11px;
    margin-left: 2px;
    opacity: 0.9;
  }

  .overlay-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }

  /* Balancing animations */
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 10px var(--balance-color);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 25px var(--balance-color);
      transform: scale(1.02);
    }
  }

  .balance-line {
    animation: dash-flow 2s linear infinite;
  }

  @keyframes dash-flow {
    to {
      stroke-dashoffset: -10;
    }
  }

  .balance-glow {
    animation: glow-pulse 2s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% {
      opacity: 0.3;
      r: 35;
    }
    50% {
      opacity: 0.8;
      r: 38;
    }
  }

  .balance-center {
    animation: center-pulse 2s ease-in-out infinite;
  }

  @keyframes center-pulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  /* Energy flow animations */
  .energy-flow.charging .energy-particle {
    animation: flow-up 3s ease-in-out infinite;
  }

  .energy-flow.discharging .energy-particle {
    animation: flow-down 3s ease-in-out infinite;
  }

  @keyframes flow-up {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }

  @keyframes flow-down {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0;
      transform: translateY(20px);
    }
  }

  .energy-particle {
    animation-delay: calc(var(--particle-index, 0) * 0.2s);
  }

  /* Status indicators */
  .status-bar {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-badge.charging {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }

  .status-badge.discharging {
    background: rgba(33, 150, 243, 0.1);
    color: #2196f3;
  }

  .status-badge.balancing {
    background: rgba(255, 165, 0, 0.1);
    color: #ffa500;
  }

  .status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Cell voltage color coding */
  .cell.low-voltage {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .cell.high-voltage {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .cell.normal-voltage {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  /* Responsive design */
  @media (max-width: 600px) {
    .pack-info {
      grid-template-columns: repeat(2, 1fr);
    }

    .info-value {
      font-size: 16px;
    }

    .cell-voltage {
      font-size: 14px;
    }

    .reactor-grid {
      gap: 8px;
    }
  }
`;
