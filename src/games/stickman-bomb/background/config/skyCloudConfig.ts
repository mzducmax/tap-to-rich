/**
 * Sky cloud parallax layer — atlas regions and render budget.
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** Offscreen buffer scale — caps GPU fill on retina displays. */
export const SKY_CLOUD_RENDER_DPR = 1.25;

/** Feathered individual cloud sprites — no composite banks with hard crop edges. */
export const SKY_CLOUD_ATLAS_REGIONS = [
  { x: 2, y: 2, w: 469, h: 148 },
  { x: 473, y: 2, w: 443, h: 146 },
  { x: 2, y: 152, w: 363, h: 112 },
  { x: 367, y: 152, w: 266, h: 80 },
  { x: 635, y: 152, w: 217, h: 76 },
  { x: 2, y: 266, w: 212, h: 73 },
  { x: 216, y: 266, w: 178, h: 66 },
  { x: 396, y: 266, w: 169, h: 65 },
  { x: 567, y: 266, w: 153, h: 60 },
  { x: 722, y: 266, w: 153, h: 60 },
] as const;

/** Prefer smaller wisps — wide strips read more naturally at lower scale. */
export const SKY_CLOUD_SMALL_REGIONS = SKY_CLOUD_ATLAS_REGIONS.filter((r) => r.w <= 280);

export type SkyCloudAtlasRegion = (typeof SKY_CLOUD_ATLAS_REGIONS)[number];
