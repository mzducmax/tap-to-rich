/**
 * Money train coin rain — delegated to shared canvas batch renderer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  cancelCoinRainGroup,
  createCoinRainGroup,
  hasActiveCoinRain,
  startMoneyTrainSession,
  type CoinRainGroup,
  type EstateZone,
} from './avatarCoinCanvas';

export type { CoinRainGroup, EstateZone };

export { createCoinRainGroup, cancelCoinRainGroup as cancelCoinRainFor };

export function beginCoinRain(
  groupId: CoinRainGroup,
  zone: EstateZone,
  maxLandings: number,
  onLand: () => void,
) {
  return startMoneyTrainSession(groupId, zone, maxLandings, onLand);
}

export function isCoinRainActive(groupId: CoinRainGroup) {
  return hasActiveCoinRain(groupId);
}
