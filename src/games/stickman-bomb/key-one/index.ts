/**
 * Key action feature exports.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { randomAttackAngle } from './attackGeometry';
export type { AttackAngle } from './attackGeometry';
export { BombSequence } from './BombSequence';
export { BowSequence } from './BowSequence';
export { BOW_PENALTY } from './bowConfig';
export { CounterExplosion } from './CounterExplosion';
export { ExplosionFlash } from './ExplosionFlash';
export { keyActions, key1BombAction, key2BowAction } from './keyActions';
export { useKeyActions } from './useKeyActions';
export { KEY_1_BOMB, KEY_2_BOW } from './types';
export type { KeyActionContext, KeyActionDefinition } from './types';
