/**
 * Key [4] — money train drops coins over the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { key4AvatarCoinAction } from './action';
export { AvatarCoinLayer } from './components/AvatarCoinLayer';
export { useAvatarCoin } from './hooks/useAvatarCoin';
export type { ActiveAvatarCoin } from './hooks/useAvatarCoin';
export {
  AVATAR_COIN_COUNT,
  AVATAR_COIN_REWARD,
} from './config/avatarCoinConfig';
