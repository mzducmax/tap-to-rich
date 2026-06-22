/**
 * Divine crossbow — random edge spawn, cyan energy bolts.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const divineCrossbowStyles = `
  .divine-crossbow-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
    isolation: isolate;
  }

  .divine-crossbow-layer-overlay {
    position: fixed;
    inset: auto;
    overflow: visible;
  }

  .divine-crossbow-fx-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
    z-index: 40;
  }

  .divine-crossbow-rig {
    position: absolute;
    left: 0;
    pointer-events: none;
    will-change: transform, opacity;
    transform: rotate(var(--crossbow-rot, 0deg));
    transform-origin: 50% 100%;
  }

  .divine-crossbow-rig-side-bottom {
    bottom: 0;
    transform-origin: 50% 100%;
    overflow: hidden;
  }

  .divine-crossbow-rig-side-left {
    transform-origin: 0% 50%;
    overflow: visible;
  }

  .divine-crossbow-rig-side-right {
    transform-origin: 100% 50%;
    overflow: visible;
  }

  .divine-crossbow-rig-spawn.divine-crossbow-rig-side-bottom {
    animation: divine-crossbow-rise-bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .divine-crossbow-rig-spawn.divine-crossbow-rig-side-left {
    animation: divine-crossbow-rise-left 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .divine-crossbow-rig-spawn.divine-crossbow-rig-side-right {
    animation: divine-crossbow-rise-right 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .divine-crossbow-rig-fade.divine-crossbow-rig-side-bottom {
    animation: divine-crossbow-fade-bottom 0.42s ease-out forwards;
  }

  .divine-crossbow-rig-fade.divine-crossbow-rig-side-left {
    animation: divine-crossbow-fade-left 0.42s ease-out forwards;
  }

  .divine-crossbow-rig-fade.divine-crossbow-rig-side-right {
    animation: divine-crossbow-fade-right 0.42s ease-out forwards;
  }

  .divine-crossbow-rig-recoil.divine-crossbow-rig-side-bottom {
    animation: divine-crossbow-recoil-bottom var(--recoil-ms, 140ms) ease-out;
  }

  .divine-crossbow-rig-recoil.divine-crossbow-rig-side-left {
    animation: divine-crossbow-recoil-left var(--recoil-ms, 140ms) ease-out;
  }

  .divine-crossbow-rig-recoil.divine-crossbow-rig-side-right {
    animation: divine-crossbow-recoil-right var(--recoil-ms, 140ms) ease-out;
  }

  @keyframes divine-crossbow-rise-bottom {
    0% { opacity: 0; transform: rotate(var(--crossbow-rot, 0deg)) translateY(28px) scale(0.88); }
    100% { opacity: 1; transform: rotate(var(--crossbow-rot, 0deg)) translateY(0) scale(1); }
  }

  @keyframes divine-crossbow-rise-left {
    0% { opacity: 0; transform: rotate(var(--crossbow-rot, 0deg)) translateX(-28px) scale(0.88); }
    100% { opacity: 1; transform: rotate(var(--crossbow-rot, 0deg)) translateX(0) scale(1); }
  }

  @keyframes divine-crossbow-rise-right {
    0% { opacity: 0; transform: rotate(var(--crossbow-rot, 0deg)) translateX(28px) scale(0.88); }
    100% { opacity: 1; transform: rotate(var(--crossbow-rot, 0deg)) translateX(0) scale(1); }
  }

  @keyframes divine-crossbow-fade-bottom {
    to { opacity: 0; transform: rotate(var(--crossbow-rot, 0deg)) translateY(18px) scale(0.92); }
  }

  @keyframes divine-crossbow-fade-left {
    to { opacity: 0; transform: rotate(var(--crossbow-rot, 0deg)) translateX(-18px) scale(0.92); }
  }

  @keyframes divine-crossbow-fade-right {
    to { opacity: 0; transform: rotate(var(--crossbow-rot, 0deg)) translateX(18px) scale(0.92); }
  }

  @keyframes divine-crossbow-recoil-bottom {
    0% { transform: rotate(var(--crossbow-rot, 0deg)) translateY(0) scale(1); }
    20% { transform: rotate(var(--crossbow-rot, 0deg)) translateY(10px) scale(0.94); }
    55% { transform: rotate(var(--crossbow-rot, 0deg)) translateY(4px) scale(0.98); }
    100% { transform: rotate(var(--crossbow-rot, 0deg)) translateY(0) scale(1); }
  }

  @keyframes divine-crossbow-recoil-left {
    0% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(0) scale(1); }
    20% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(-10px) scale(0.94); }
    55% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(-4px) scale(0.98); }
    100% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(0) scale(1); }
  }

  @keyframes divine-crossbow-recoil-right {
    0% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(0) scale(1); }
    20% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(10px) scale(0.94); }
    55% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(4px) scale(0.98); }
    100% { transform: rotate(var(--crossbow-rot, 0deg)) translateX(0) scale(1); }
  }

  .divine-crossbow-img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    object-position: center top;
    /* Black JPEG background reads as transparent on gameplay layers. */
    mix-blend-mode: screen;
    filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45));
    user-select: none;
    -webkit-user-drag: none;
  }

  .divine-crossbow-tip-anchor {
    position: absolute;
    left: var(--tip-x-ratio, 50%);
    top: var(--tip-y-ratio, 5%);
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .divine-crossbow-bolt {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--bolt-len, 104px);
    height: 16px;
    pointer-events: none;
    will-change: transform;
    transform-origin: 100% 50%;
    z-index: 50;
  }

  .divine-crossbow-bolt-trail {
    position: absolute;
    left: 0;
    right: 18%;
    top: 50%;
    height: 10px;
    margin-top: -5px;
    border-radius: 5px;
    opacity: 0.85;
    background: repeating-linear-gradient(
      90deg,
      rgba(56, 189, 248, 0) 0px,
      rgba(56, 189, 248, 0.15) 6px,
      rgba(186, 230, 253, 0.55) 12px,
      rgba(255, 255, 255, 0.9) 18px,
      rgba(56, 189, 248, 0.2) 24px
    );
    background-size: 48px 100%;
    filter: blur(0.4px);
  }

  .divine-crossbow-bolt-flying .divine-crossbow-bolt-trail.divine-crossbow-bolt-anim-replay {
    animation: divine-crossbow-bolt-trail-scroll 0.11s linear infinite;
  }

  @keyframes divine-crossbow-bolt-trail-scroll {
    from { background-position: 0 0; }
    to { background-position: 48px 0; }
  }

  .divine-crossbow-bolt-core {
    position: absolute;
    inset: 22% 14% 22% 8%;
    border-radius: 5px;
    background: linear-gradient(
      90deg,
      rgba(186, 230, 253, 0.18) 0%,
      rgba(56, 189, 248, 0.95) 38%,
      rgba(224, 242, 254, 1) 72%,
      rgba(255, 255, 255, 1) 100%
    );
    box-shadow:
      0 0 16px rgba(56, 189, 248, 1),
      0 0 32px rgba(14, 165, 233, 0.75),
      0 0 48px rgba(125, 211, 252, 0.45);
  }

  .divine-crossbow-bolt-head {
    position: absolute;
    right: -2px;
    top: 50%;
    width: 18px;
    height: 14px;
    margin-top: -7px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff 0%, #e0f2fe 45%, rgba(56, 189, 248, 0.4) 72%, transparent 100%);
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.95);
  }

  .divine-crossbow-bolt-glow {
    position: absolute;
    right: -6px;
    top: 50%;
    width: 22px;
    height: 22px;
    margin-top: -11px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff 0%, rgba(186, 230, 253, 0.85) 42%, transparent 72%);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.95);
  }

  .divine-crossbow-bolt-spark {
    position: absolute;
    top: 50%;
    width: 6px;
    height: 6px;
    margin-top: -3px;
    border-radius: 50%;
    background: #e0f2fe;
    opacity: 0;
    box-shadow: 0 0 10px #38bdf8;
  }

  .divine-crossbow-bolt-spark-a { left: 28%; }
  .divine-crossbow-bolt-spark-b { left: 52%; }

  .divine-crossbow-bolt-flying .divine-crossbow-bolt-core.divine-crossbow-bolt-anim-replay {
    animation: divine-crossbow-bolt-pulse 0.14s ease-in-out infinite alternate;
  }

  .divine-crossbow-bolt-flying .divine-crossbow-bolt-head.divine-crossbow-bolt-anim-replay {
    animation: divine-crossbow-bolt-head-flare 0.2s steps(3) infinite;
  }

  .divine-crossbow-bolt-flying .divine-crossbow-bolt-glow.divine-crossbow-bolt-anim-replay {
    animation: divine-crossbow-bolt-glow-pulse 0.18s ease-in-out infinite alternate;
  }

  .divine-crossbow-bolt-flying .divine-crossbow-bolt-spark.divine-crossbow-bolt-anim-replay {
    animation: divine-crossbow-bolt-spark-flicker 0.22s steps(2) infinite;
  }

  @keyframes divine-crossbow-bolt-pulse {
    from { filter: brightness(1); transform: scaleY(1); }
    to { filter: brightness(1.45); transform: scaleY(1.15); }
  }

  @keyframes divine-crossbow-bolt-head-flare {
    0% { opacity: 0.75; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.15); }
    100% { opacity: 0.85; transform: scale(1); }
  }

  @keyframes divine-crossbow-bolt-glow-pulse {
    from { opacity: 0.7; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1.12); }
  }

  @keyframes divine-crossbow-bolt-spark-flicker {
    0% { opacity: 0; transform: scale(0.6); }
    50% { opacity: 1; transform: scale(1.3); }
    100% { opacity: 0.2; transform: scale(0.8); }
  }

  .divine-crossbow-bolt-landed .divine-crossbow-bolt-core,
  .divine-crossbow-bolt-landed .divine-crossbow-bolt-head,
  .divine-crossbow-bolt-landed .divine-crossbow-bolt-glow,
  .divine-crossbow-bolt-landed .divine-crossbow-bolt-trail,
  .divine-crossbow-bolt-landed .divine-crossbow-bolt-spark {
    animation: divine-crossbow-bolt-impact 0.16s ease-out forwards;
  }

  @keyframes divine-crossbow-bolt-impact {
    to { opacity: 0; transform: scale(1.4); filter: brightness(2); }
  }

  .divine-crossbow-launch-burst,
  .divine-crossbow-hit-burst,
  .divine-crossbow-volley-launch-burst {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 35;
  }

  .divine-crossbow-burst-replay .divine-crossbow-launch-flash {
    animation: divine-crossbow-flash 0.34s ease-out forwards;
  }

  .divine-crossbow-burst-replay .divine-crossbow-launch-ring {
    animation: divine-crossbow-ring 0.52s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-volley-launch-burst .divine-crossbow-volley-core-flash {
    animation: divine-crossbow-volley-core-flash 0.42s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-volley-launch-burst .divine-crossbow-volley-ring-a {
    animation: divine-crossbow-volley-ring-a 0.62s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-volley-launch-burst .divine-crossbow-volley-ring-b {
    animation: divine-crossbow-volley-ring-b 0.78s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-volley-launch-burst .divine-crossbow-volley-cone {
    animation: divine-crossbow-volley-cone 0.48s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-volley-launch-burst .divine-crossbow-volley-shockwave {
    animation: divine-crossbow-volley-shockwave 0.72s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-hit-burst .divine-crossbow-hit-bloom {
    animation: divine-crossbow-hit-bloom 0.72s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-hit-burst .divine-crossbow-hit-flash {
    animation: divine-crossbow-hit-flash 0.5s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-hit-burst .divine-crossbow-hit-ring {
    animation: divine-crossbow-hit-ring 0.68s ease-out forwards;
  }

  .divine-crossbow-burst-replay.divine-crossbow-hit-burst .divine-crossbow-hit-spark {
    animation: divine-crossbow-hit-spark 0.58s ease-out forwards;
  }

  .divine-crossbow-launch-flash {
    position: absolute;
    left: 0;
    top: 0;
    width: 28px;
    height: 28px;
    margin: -14px 0 0 -14px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(56,189,248,0.55) 65%, transparent 100%);
    opacity: 0;
  }

  .divine-crossbow-launch-ring {
    position: absolute;
    left: 0;
    top: 0;
    width: 56px;
    height: 56px;
    margin: -28px 0 0 -28px;
    border-radius: 50%;
    border: 2px solid rgba(56, 189, 248, 0.75);
    opacity: 0;
  }

  .divine-crossbow-volley-core-flash {
    position: absolute;
    left: 0;
    top: 0;
    width: 44px;
    height: 44px;
    margin: -22px 0 0 -22px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 1) 0%,
      rgba(186, 230, 253, 0.95) 35%,
      rgba(56, 189, 248, 0.55) 62%,
      transparent 100%
    );
    opacity: 0;
    box-shadow: 0 0 40px rgba(56, 189, 248, 0.95);
  }

  .divine-crossbow-volley-ring-a {
    position: absolute;
    left: 0;
    top: 0;
    width: 72px;
    height: 72px;
    margin: -36px 0 0 -36px;
    border-radius: 50%;
    border: 3px solid rgba(186, 230, 253, 0.95);
    opacity: 0;
    box-shadow: 0 0 24px rgba(56, 189, 248, 0.75);
  }

  .divine-crossbow-volley-ring-b {
    position: absolute;
    left: 0;
    top: 0;
    width: 112px;
    height: 112px;
    margin: -56px 0 0 -56px;
    border-radius: 50%;
    border: 2px solid rgba(56, 189, 248, 0.65);
    opacity: 0;
  }

  .divine-crossbow-volley-cone {
    position: absolute;
    left: 0;
    top: 0;
    width: 96px;
    height: 140px;
    margin: -8px 0 0 -48px;
    transform-origin: 50% 100%;
    background: linear-gradient(
      to top,
      rgba(56, 189, 248, 0.55) 0%,
      rgba(186, 230, 253, 0.35) 42%,
      rgba(255, 255, 255, 0.08) 100%
    );
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    opacity: 0;
    filter: blur(0.5px);
  }

  .divine-crossbow-volley-shockwave {
    position: absolute;
    left: 0;
    top: 0;
    width: 160px;
    height: 160px;
    margin: -80px 0 0 -80px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.35) 0%,
      rgba(56, 189, 248, 0.22) 35%,
      transparent 70%
    );
    opacity: 0;
  }

  .divine-crossbow-hit-bloom {
    position: absolute;
    left: 0;
    top: 0;
    width: 140px;
    height: 140px;
    margin: -70px 0 0 -70px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(186, 230, 253, 0.78) 28%,
      rgba(56, 189, 248, 0.42) 55%,
      transparent 78%
    );
    opacity: 0;
  }

  .divine-crossbow-hit-flash {
    position: absolute;
    left: 0;
    top: 0;
    width: 72px;
    height: 72px;
    margin: -36px 0 0 -36px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff 0%, rgba(186,230,253,0.85) 40%, transparent 100%);
    opacity: 0;
    box-shadow: 0 0 48px rgba(56, 189, 248, 1);
  }

  .divine-crossbow-hit-ring {
    position: absolute;
    left: 0;
    top: 0;
    width: 108px;
    height: 108px;
    margin: -54px 0 0 -54px;
    border-radius: 50%;
    border: 4px solid rgba(186, 230, 253, 0.95);
    opacity: 0;
    box-shadow: 0 0 28px rgba(56, 189, 248, 0.75);
  }

  .divine-crossbow-hit-spark {
    position: absolute;
    left: 0;
    top: 0;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    border-radius: 50%;
    background: #e0f2fe;
    opacity: 0;
    box-shadow: 0 0 14px #38bdf8;
  }

  .divine-crossbow-hit-spark-a { --spark-tx: -58px; --spark-ty: -14px; }
  .divine-crossbow-hit-spark-b { --spark-tx: 54px; --spark-ty: -12px; }
  .divine-crossbow-hit-spark-c { --spark-tx: 8px; --spark-ty: 52px; }

  @keyframes divine-crossbow-flash {
    0% { opacity: 0; transform: scale(0.35); }
    30% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(2.1); }
  }

  @keyframes divine-crossbow-ring {
    0% { opacity: 0.9; transform: scale(0.4); }
    100% { opacity: 0; transform: scale(2.8); }
  }

  @keyframes divine-crossbow-volley-core-flash {
    0% { opacity: 0; transform: scale(0.2); filter: brightness(1); }
    18% { opacity: 1; transform: scale(1.15); filter: brightness(2.2); }
    100% { opacity: 0; transform: scale(2.4); filter: brightness(1.4); }
  }

  @keyframes divine-crossbow-volley-ring-a {
    0% { opacity: 0.95; transform: scale(0.35); }
    100% { opacity: 0; transform: scale(2.6); }
  }

  @keyframes divine-crossbow-volley-ring-b {
    0% { opacity: 0.75; transform: scale(0.25); }
    100% { opacity: 0; transform: scale(3.4); }
  }

  @keyframes divine-crossbow-volley-cone {
    0% { opacity: 0; transform: scaleY(0.2) scaleX(0.5); }
    20% { opacity: 0.85; transform: scaleY(1) scaleX(1); }
    100% { opacity: 0; transform: scaleY(1.35) scaleX(1.25); }
  }

  @keyframes divine-crossbow-volley-shockwave {
    0% { opacity: 0; transform: scale(0.15); }
    25% { opacity: 0.55; transform: scale(0.85); }
    100% { opacity: 0; transform: scale(2.2); }
  }

  @keyframes divine-crossbow-hit-bloom {
    0% { opacity: 0; transform: scale(0.2); }
    25% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0; transform: scale(2.8); }
  }

  @keyframes divine-crossbow-hit-flash {
    0% { opacity: 0; transform: scale(0.25); }
    22% { opacity: 1; transform: scale(1.15); }
    100% { opacity: 0; transform: scale(2.4); }
  }

  @keyframes divine-crossbow-hit-ring {
    0% { opacity: 0.95; transform: scale(0.35); }
    100% { opacity: 0; transform: scale(3.4); }
  }

  @keyframes divine-crossbow-hit-spark {
    0% { opacity: 1; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(var(--spark-tx, 0), var(--spark-ty, 0)) scale(2); }
  }
`;
