/**
 * Classic doodle counter display (monospace font).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const counterStylesClassic = `
  .counter-scene {
    --line-color: #1a1a1a;
    --ground-shadow: rgba(0, 0, 0, 0.15);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    perspective: 1000px;
    padding: 40px;
    cursor: none;
  }

  .stick-ui-box {
    position: relative;
    background: #fff;
    border: 6px solid var(--line-color);
    border-radius: 255px 25px 225px 25px / 25px 225px 25px 255px;
    padding: 15px 25px;
    z-index: 10;
    background-color: white;
  }

  .digit-wrapper {
    display: flex;
    gap: 0;
  }

  .digit-slot {
    height: 100px;
    width: 65px;
    overflow: hidden;
  }

  .digit-group-gap {
    width: 18px;
    flex-shrink: 0;
  }

  .digit-strip {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .digit {
    height: 100px;
    font-size: 90px;
    font-weight: 900;
    font-family: 'Courier New', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--line-color);
  }

  .counter-dollar-classic {
    height: 100px;
    font-size: 90px;
    font-weight: 900;
    font-family: 'Courier New', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--line-color);
    line-height: 1;
    margin-left: 2px;
    flex-shrink: 0;
  }

  .ground-shadow {
    position: absolute;
    bottom: 0;
    width: 160px;
    height: 40px;
    background: var(--ground-shadow);
    border-radius: 50%;
    filter: blur(8px);
    transform: rotateX(60deg);
    z-index: 1;
  }

  .float-animation {
    animation: counterFloatMove 3s ease-in-out infinite;
  }

  .shadow-animation {
    animation: counterShadowScale 3s ease-in-out infinite;
  }

  @keyframes counterFloatMove {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }

  @keyframes counterShadowScale {
    0%, 100% {
      transform: rotateX(60deg) scale(1);
      opacity: 1;
    }
    50% {
      transform: rotateX(60deg) scale(0.7);
      opacity: 0.4;
    }
  }
`;
