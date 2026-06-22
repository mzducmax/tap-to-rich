/**
 * Key [2] — Plinko mini-game.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { key2PlinkoAction, key2GiantGoldAction, key2BowAction } from './action';
export { PlinkoLayer } from './components/PlinkoLayer';
export { usePlinko } from './hooks/usePlinko';
export {
  PLINKO_BET,
  PLINKO_MULTIPLIERS,
  plinkoReward,
} from './config/plinkoConfig';
export type { PlinkoLandPayload } from './types';
