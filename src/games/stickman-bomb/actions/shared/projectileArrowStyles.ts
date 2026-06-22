/**
 * Shared projectile arrow visuals (avatar strike + bow).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const PROJECTILE_ARROW_LEN = 40;

export const PROJECTILE_ARROW_HTML =
  '<span class="projectile-arrow-fletch" aria-hidden="true"></span>' +
  '<span class="projectile-arrow-nock" aria-hidden="true"></span>' +
  '<span class="projectile-arrow-shaft" aria-hidden="true"></span>' +
  '<span class="projectile-arrow-head" aria-hidden="true"></span>';

export const projectileArrowStyles = `
  .projectile-arrow {
    position: absolute;
    left: 0;
    top: 0;
    width: ${PROJECTILE_ARROW_LEN}px;
    height: 10px;
    transform-origin: 4px 50%;
    pointer-events: none;
    z-index: 26;
    will-change: transform;
    backface-visibility: hidden;
  }

  .projectile-arrow-shaft {
    position: absolute;
    left: 11px;
    right: 11px;
    top: 50%;
    height: 3px;
    margin-top: -1.5px;
    border-radius: 1px;
    background: linear-gradient(
      180deg,
      #a67c52 0%,
      #6b4423 38%,
      #4a2f18 72%,
      #3d2614 100%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.22),
      0 0 0 0.5px rgba(30, 20, 10, 0.35);
  }

  .projectile-arrow-nock {
    position: absolute;
    left: 8px;
    top: 50%;
    width: 3px;
    height: 6px;
    margin-top: -3px;
    border-radius: 1px;
    background: linear-gradient(180deg, #e8c9a0 0%, #c49a6c 100%);
    box-shadow: inset 0 0 0 0.5px rgba(60, 40, 20, 0.25);
  }

  .projectile-arrow-head {
    position: absolute;
    right: -1px;
    top: 50%;
    width: 11px;
    height: 9px;
    margin-top: -4.5px;
    clip-path: polygon(100% 50%, 2px 0, 2px 100%);
    background: linear-gradient(
      160deg,
      #e2e8f0 0%,
      #94a3b8 35%,
      #64748b 65%,
      #475569 100%
    );
    box-shadow: 1px 0 2px rgba(15, 23, 42, 0.35);
  }

  .projectile-arrow-head::after {
    content: '';
    position: absolute;
    left: 2px;
    top: 50%;
    width: 5px;
    height: 1px;
    margin-top: -0.5px;
    background: rgba(30, 41, 59, 0.45);
    transform: rotate(-8deg);
  }

  .projectile-arrow-fletch {
    position: absolute;
    left: 0;
    top: 50%;
    width: 10px;
    height: 10px;
    margin-top: -5px;
  }

  .projectile-arrow-fletch::before,
  .projectile-arrow-fletch::after {
    content: '';
    position: absolute;
    left: 0;
    width: 9px;
    height: 5px;
    border-radius: 0 1px 1px 0;
  }

  .projectile-arrow-fletch::before {
    top: 0;
    background: linear-gradient(95deg, #b91c1c 0%, #ef4444 55%, #fca5a5 100%);
    clip-path: polygon(0 100%, 88% 8%, 100% 0, 100% 100%);
    box-shadow: inset -1px 0 0 rgba(127, 29, 29, 0.35);
  }

  .projectile-arrow-fletch::after {
    bottom: 0;
    background: linear-gradient(95deg, #fef2f2 0%, #fecaca 45%, #f87171 100%);
    clip-path: polygon(0 0, 88% 92%, 100% 100%, 100% 0);
    box-shadow: inset -1px 0 0 rgba(185, 28, 28, 0.2);
  }

  .projectile-arrow-stuck {
    z-index: 28;
    animation: projectile-arrow-wobble 0.34s ease-out forwards;
  }

  @keyframes projectile-arrow-wobble {
    0% {
      transform: translate3d(var(--arrow-x, 0), var(--arrow-y, 0), 0)
        rotate(var(--arrow-angle, 1.5708rad)) scale(1.1);
    }
    40% {
      transform: translate3d(var(--arrow-x, 0), var(--arrow-y, 0), 0)
        rotate(var(--arrow-angle, 1.5708rad)) scale(0.94);
    }
    100% {
      transform: translate3d(var(--arrow-x, 0), var(--arrow-y, 0), 0)
        rotate(var(--arrow-angle, 1.5708rad)) scale(1);
    }
  }

  .projectile-arrow-stuck-legacy {
    z-index: 28;
    animation: projectile-arrow-wobble-legacy 0.34s ease-out forwards;
  }

  @keyframes projectile-arrow-wobble-legacy {
    0% { transform: rotate(var(--arrow-angle, 0rad)) scale(1.1); }
    40% { transform: rotate(var(--arrow-angle, 0rad)) scale(0.94); }
    100% { transform: rotate(var(--arrow-angle, 0rad)) scale(1); }
  }
`;
