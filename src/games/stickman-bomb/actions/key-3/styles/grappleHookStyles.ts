/**
 * Styles for key [3] — grappling-hook money heist.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const grappleHookStyles = `
  .grapple-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 31;
  }

  /* Purple backdrop matching the gif's background (#9999cc). Covers the game
     surroundings but keeps a transparent hole over the house so the estate
     stays visible. Hole position/size come from CSS vars set by the layer. */
  .grapple-joker-backdrop {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at var(--joker-hole-x, 50%) var(--joker-hole-y, 60%),
      rgba(153, 153, 204, 0) 0,
      rgba(153, 153, 204, 0) var(--joker-hole-r, 180px),
      #9999cc calc(var(--joker-hole-r, 180px) + 110px)
    );
    animation: grapple-joker-fade 300ms ease;
  }

  /* Joker gif pinned to the top-left, away from the house. Its frame uses the
     same #9999cc as the backdrop so it blends straight into it. */
  .grapple-joker-gif {
    position: absolute;
    top: 24px;
    left: 24px;
    width: 200px;
    height: 200px;
    border-radius: 16px;
    background: #9999cc;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
    z-index: 60;
    animation: grapple-joker-pop 260ms cubic-bezier(0.2, 1.4, 0.4, 1);
  }

  .grapple-joker-gif img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes grapple-joker-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes grapple-joker-pop {
    from {
      opacity: 0;
      transform: scale(0.6);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Pendulum unit — pivots about its top anchor on the screen edge. */
  .grapple-unit {
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
    transform-origin: 50% 0;
    transform: rotate(var(--sway-deg, 0deg));
    will-change: transform;
  }

  /* Rope/chain hanging straight down from the anchor. */
  .grapple-rope {
    position: absolute;
    top: 0;
    left: -2px;
    width: 4px;
    height: var(--rope-len, 0px);
    background:
      repeating-linear-gradient(
        to bottom,
        #6b5640 0px,
        #6b5640 5px,
        #4a3b29 5px,
        #4a3b29 6px,
        #4a3b29 9px
      );
    background-color: #5c4a36;
    border-radius: 2px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
  }

  /* Claw sits at the bottom of the rope. */
  .grapple-claw {
    position: absolute;
    top: var(--rope-len, 0px);
    left: 0;
    width: 56px;
    height: 56px;
    margin-left: -28px;
    transform: translateY(-5px);
    filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.45));
  }

  /* Cash bundle clamped in the claw. */
  .grapple-money {
    position: absolute;
    top: calc(var(--rope-len, 0px) + 34px);
    left: 0;
    margin-left: -46px;
    width: 92px;
    height: 54px;
    border-radius: 9px;
    background: linear-gradient(160deg, #4caf6a 0%, #2e8b50 55%, #1f6b3b 100%);
    border: 2px solid #1c5c33;
    box-shadow:
      0 3px 6px rgba(0, 0, 0, 0.4),
      inset 0 0 0 2px rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #eafff0;
    font-weight: 800;
    font-size: 24px;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transform: scale(0.4);
    transition: opacity 160ms ease, transform 220ms cubic-bezier(0.2, 1.4, 0.4, 1);
  }

  .grapple-money.is-grabbed {
    opacity: 1;
    transform: scale(1);
  }

  .grapple-money.is-fading {
    opacity: 0;
    transform: scale(0.7);
    transition: opacity 200ms ease, transform 200ms ease;
  }
`;
