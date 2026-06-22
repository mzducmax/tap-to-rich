/**
 * Prewarm hook — DOM arrow/burst pools replaced by avatarStrikeCanvas batch renderer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { prewarmAvatarStrikeCanvas } from './avatarStrikeCanvas';

export function prewarmAvatarStrikePool() {
  prewarmAvatarStrikeCanvas();
}
