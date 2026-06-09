/**
 * Estate display styles — centered gameplay target.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const estateSceneStyles = `
  .estate-scene {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    pointer-events: none;
    overflow: visible;
  }

  .estate-stack {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .estate-island {
    position: absolute;
    left: 50%;
    top: 93%;
    width: clamp(343px, 66vw, 595px);
    max-width: none;
    height: auto;
    transform: translate(-50%, -38%);
    object-fit: contain;
    pointer-events: none;
    z-index: 0;
    filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.35));
  }
`;

export const estateIconStyles = `
  .estate-sway {
    position: relative;
    z-index: 1;
    margin-top: clamp(36px, 5.5vh, 60px);
    transform-origin: bottom center;
    will-change: transform;
  }

  .estate-icon {
    position: relative;
    width: clamp(200px, 38vw, 340px);
    height: clamp(200px, 38vw, 340px);
    filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.42));
    overflow: visible;
    transform-origin: bottom center;
    will-change: transform;
  }

  .estate-building-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: bottom center;
    pointer-events: none;
  }

  @media (max-width: 520px) {
    .estate-icon {
      width: clamp(148px, 40vw, 220px);
      height: clamp(148px, 40vw, 220px);
    }
  }
`;

/** @deprecated use estateSceneStyles + estateIconStyles */
export const estateStyles = `${estateSceneStyles}\n${estateIconStyles}`;
