/**
 * Key [5] — divine crossbow rapid-fires bolts at the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { key5DivineCrossbowAction, key5AvatarBubbleAction } from './action';
export { DivineCrossbowLayer } from './components/DivineCrossbowLayer';
export { useDivineCrossbow } from './hooks/useDivineCrossbow';
export type { ActiveDivineCrossbow } from './hooks/useDivineCrossbow';
export { DIVINE_CROSSBOW_BOLT_COUNT } from './config/divineCrossbowConfig';

/** @deprecated Use DivineCrossbowLayer */
export { DivineCrossbowLayer as AvatarBubbleLayer } from './components/DivineCrossbowLayer';
/** @deprecated Use useDivineCrossbow */
export { useDivineCrossbow as useAvatarBubble } from './hooks/useDivineCrossbow';
/** @deprecated Use ActiveDivineCrossbow */
export type { ActiveDivineCrossbow as ActiveAvatarBubble } from './hooks/useDivineCrossbow';
/** @deprecated Use DIVINE_CROSSBOW_BOLT_COUNT */
export { DIVINE_CROSSBOW_BOLT_COUNT as AVATAR_BUBBLE_SESSION_MS } from './config/divineCrossbowConfig';
