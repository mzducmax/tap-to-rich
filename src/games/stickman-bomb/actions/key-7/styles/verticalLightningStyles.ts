/**
 * Vertical lightning — layer chrome + cloud strike pulse (key 7).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const verticalLightningStyles = `
  .vertical-lightning-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 37;
    contain: layout style;
    isolation: isolate;
  }

  /* Full-screen storm gloom: a steady dark veil with a vignette toward the
     edges. Fades in once and holds for the whole session. */
  .vertical-lightning-storm-dim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    contain: strict;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    background:
      linear-gradient(
        180deg,
        rgba(2, 4, 12, 0.93) 0%,
        rgba(5, 7, 16, 0.80) 26%,
        rgba(8, 10, 22, 0.54) 58%,
        rgba(12, 14, 28, 0.22) 84%,
        rgba(14, 16, 32, 0.10) 100%
      );
    animation: vertical-lightning-dim-in 0.85s ease-out forwards;
    will-change: opacity;
  }

  /* Lightning flash: a brief bright veil on top of the gloom, driven only when
     a strike toggles .vertical-lightning-strike-pulse on the layer. Lives on a
     pseudo-element so the base gloom never re-fades. */
  .vertical-lightning-storm-dim::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    mix-blend-mode: screen;
    background:
      radial-gradient(
        100% 85% at 50% 26%,
        rgba(228, 236, 252, 0.55) 0%,
        rgba(192, 208, 240, 0.20) 46%,
        rgba(150, 172, 214, 0) 76%
      );
  }

  .vertical-lightning-strike-pulse .vertical-lightning-storm-dim::before {
    animation: vertical-lightning-dim-flash 0.3s ease-out;
  }

  @keyframes vertical-lightning-dim-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes vertical-lightning-dim-flash {
    0%   { opacity: 0; }
    22%  { opacity: 1; }
    100% { opacity: 0; }
  }

  .vertical-lightning-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
    contain: strict;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
  }

  .vertical-lightning-cloud-pulse {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    z-index: 2;
    pointer-events: none;
  }

  .vertical-lightning-cloud-pulse::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 8px;
    width: 120px;
    height: 64px;
    transform: translate(-50%, 0) scale(0.5);
    opacity: 0;
    border-radius: 50%;
    background:
      radial-gradient(
        ellipse 80% 70% at 50% 40%,
        rgba(255, 248, 210, 0.95) 0%,
        rgba(210, 220, 240, 0.55) 42%,
        rgba(180, 190, 210, 0) 72%
      );
  }

  .vertical-lightning-cloud-pulse-active::before {
    animation: vertical-lightning-cloud-flash 0.34s ease-out forwards;
  }

  @keyframes vertical-lightning-cloud-flash {
    0%   { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
    18%  { opacity: 1; transform: translate(-50%, 0) scale(1.1); }
    100% { opacity: 0; transform: translate(-50%, 0) scale(1.35); }
  }

  /* ── Combo badge ─────────────────────────────────────────────────────── */
  .vertical-lightning-combo-wrap {
    position: absolute;
    left: 50%;
    top: 26%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    text-align: center;
  }

  .vertical-lightning-combo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    animation: vertical-lightning-combo-pop 0.32s cubic-bezier(0.18, 1.6, 0.4, 1) both;
    will-change: transform, opacity;
  }

  .vertical-lightning-combo-count {
    font-weight: 900;
    font-size: clamp(40px, 7vw, 88px);
    letter-spacing: -0.02em;
    color: #fff;
    -webkit-text-stroke: 2px rgba(12, 31, 73, 0.85);
    text-shadow:
      0 0 14px rgba(56, 189, 248, 0.95),
      0 0 30px rgba(14, 116, 233, 0.7),
      0 4px 10px rgba(0, 0, 0, 0.5);
  }

  .vertical-lightning-combo-shout {
    font-weight: 800;
    font-size: clamp(13px, 2vw, 24px);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #e0f2fe;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  }

  /* Escalating tiers turn cooler/brighter as the streak climbs. */
  .vertical-lightning-combo-hot .vertical-lightning-combo-count {
    color: #bae6fd;
    text-shadow:
      0 0 16px rgba(125, 211, 252, 0.95),
      0 0 34px rgba(56, 189, 248, 0.7),
      0 4px 10px rgba(0, 0, 0, 0.5);
  }

  .vertical-lightning-combo-fire .vertical-lightning-combo-count {
    color: #7dd3fc;
    text-shadow:
      0 0 18px rgba(56, 189, 248, 1),
      0 0 38px rgba(14, 116, 233, 0.75),
      0 4px 10px rgba(0, 0, 0, 0.55);
  }

  .vertical-lightning-combo-rampage .vertical-lightning-combo-count {
    color: #a5b4fc;
    text-shadow:
      0 0 20px rgba(129, 140, 248, 1),
      0 0 42px rgba(79, 70, 229, 0.8),
      0 4px 12px rgba(0, 0, 0, 0.6);
  }

  .vertical-lightning-combo-godlike .vertical-lightning-combo-count {
    color: #f5d0fe;
    -webkit-text-stroke: 2px rgba(67, 26, 117, 0.9);
    text-shadow:
      0 0 24px rgba(232, 121, 249, 1),
      0 0 50px rgba(147, 51, 234, 0.85),
      0 4px 14px rgba(0, 0, 0, 0.6);
    animation: vertical-lightning-combo-godlike-shake 0.4s ease-in-out infinite;
  }

  @keyframes vertical-lightning-combo-pop {
    0% { opacity: 0; transform: scale(0.4) translateY(10px); }
    55% { opacity: 1; transform: scale(1.18) translateY(0); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes vertical-lightning-combo-godlike-shake {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.04) rotate(-1.5deg); }
    75% { transform: scale(1.04) rotate(1.5deg); }
  }
`;
