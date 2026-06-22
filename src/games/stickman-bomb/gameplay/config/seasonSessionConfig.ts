/**
 * Gameplay season sessions — bird (S1), sheep (S2), micky/mole (S3).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { BirdPhase } from '../birds/config/birdConfig';
import type { SheepPhase } from '../sheep/config/sheepConfig';
import type { MolePhase } from '../moles/config/moleConfig';

export type GameplaySeasonId = 'bird' | 'sheep' | 'micky';

export const GAMEPLAY_SEASON_ORDER: readonly GameplaySeasonId[] = [
  'bird',
  'sheep',
  'micky',
];

export const GAMEPLAY_SEASONS: Record<
  GameplaySeasonId,
  { season: number; label: string; title: string }
> = {
  bird: { season: 1, label: 'Season 1', title: 'Bird flock' },
  sheep: { season: 2, label: 'Season 2', title: 'Sheep herd' },
  micky: { season: 3, label: 'Season 3', title: 'Whack-a-micky' },
};

/** All active sessions — may overlap (bird + micky, etc.). */
export function resolveActiveSeasons(
  birdPhase: BirdPhase,
  sheepPhase: SheepPhase,
  molePhase: MolePhase,
): GameplaySeasonId[] {
  const active: GameplaySeasonId[] = [];
  if (birdPhase === 'crossing') active.push('bird');
  if (sheepPhase === 'crossing') active.push('sheep');
  if (molePhase === 'active') active.push('micky');
  return active;
}
