/**
 * Public API for vertical lightning FX (Pixi compositor, 1 draw call).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type { VerticalBoltSpawn } from './verticalLightningPixiCanvas';
export {
  cancelAllVerticalBolts,
  isVerticalLightningCanvasReady,
  isVerticalLightningCanvasSized,
  mountVerticalLightningCanvas,
  resizeVerticalLightningCanvas,
  spawnVerticalBolt,
  unmountVerticalLightningCanvas,
} from './verticalLightningPixiCanvas';
