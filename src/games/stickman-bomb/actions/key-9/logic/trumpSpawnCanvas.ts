/**
 * Public API for Trump spawn FX (Pixi compositor, 1 draw call).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type { TrumpSpawnSpec } from './trumpSpawnPixiCanvas';
export {
  cancelTrumpSpawnSession,
  computeTrumpSpriteAnchor,
  isTrumpSpawnCanvasReady,
  isTrumpSpawnCanvasSized,
  mountTrumpSpawnCanvas,
  resizeTrumpSpawnCanvas,
  spawnTrumpSession,
  unmountTrumpSpawnCanvas,
} from './trumpSpawnPixiCanvas';
