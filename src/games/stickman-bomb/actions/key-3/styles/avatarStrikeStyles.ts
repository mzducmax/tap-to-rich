/**
 * GPU-oriented styles: bow portal + flying arrows.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const avatarStrikeStyles = `
  .avatar-strike-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
    z-index: 32;
    contain: layout style;
  }

  .avatar-strike-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
  }

  .avatar-strike-portal-wrap {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    overflow: visible;
    will-change: transform;
    z-index: 40;
  }

  .avatar-strike-archer-frame {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--archer-frame-w, 126px);
    height: var(--archer-frame-h, 156px);
    transform: translate(-50%, -50%);
    overflow: visible;
    will-change: transform, opacity;
    backface-visibility: hidden;
  }

  .avatar-strike-bow-aim {
    position: absolute;
    inset: 0;
    transform-origin:
      calc(var(--archer-frame-w, 126px) * var(--launch-left-w, 0.518))
      calc(var(--archer-frame-h, 156px) * var(--launch-top-h, 0.319));
    transform: rotate(var(--bow-aim-rot, 0rad));
    transition: transform 0.09s ease-out;
    will-change: transform;
    backface-visibility: hidden;
  }

  .avatar-strike-frame-drifting {
    animation: avatar-strike-frame-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .avatar-strike-frame-drifting .avatar-strike-frame-img {
    animation: avatar-strike-bow-glow 2.6s ease-in-out infinite;
  }

  .avatar-strike-frame-fade {
    animation: avatar-strike-frame-fade 0.42s ease-out forwards;
  }

  @keyframes avatar-strike-bow-glow {
    0%, 100% { filter: drop-shadow(0 4px 10px rgba(15, 23, 42, 0.3)); }
    50% { filter: drop-shadow(0 6px 16px rgba(251, 191, 36, 0.4)); }
  }

  @keyframes avatar-strike-frame-pop {
    0% { transform: translate(-50%, -50%) scale(0.35); opacity: 0; }
    70% { transform: translate(-50%, -50%) scale(1.06); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }

  @keyframes avatar-strike-frame-fade {
    to { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
  }

  .avatar-strike-avatar-hole {
    position: absolute;
    left: calc(var(--archer-frame-w, 126px) * var(--avatar-hole-cx-w, 0.501));
    top: calc(var(--archer-frame-h, 156px) * var(--avatar-hole-cy-h, 0.506));
    width: var(--avatar-hole-size-px, 47px);
    height: var(--avatar-hole-size-px, 47px);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
    box-sizing: border-box;
    clip-path: circle(50% at 50% 50%);
  }

  .avatar-strike-frame-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 2;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  .avatar-strike-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    display: block;
    background: transparent;
  }

  .avatar-strike-fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #6366f1 0%, #4f46e5 100%);
    color: #fff;
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    user-select: none;
  }
`;

