/**
 * Public API for the whack-a-mole feature.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { FloatingMoleBonus } from './components/FloatingMoleBonus';
export { MoleField } from './components/MoleField';
export { MoleHitBurst } from './components/MoleHitBurst';

export { useMoleField } from './hooks/useMoleField';

export type { MoleBonusFloat, MoleHitEffect } from './types/moleTypes';
export type { MoleSpawn } from './logic/buildMoleField';

export { MOLE_REWARD, MOLE_WAVE_DURATION_MS } from './config/moleConfig';

export { hitTestMoleAtPoint } from './logic/moleHitTest';
