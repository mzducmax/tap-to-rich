/**
 * On-screen "×N COMBO" badge for key-7 vertical lightning — climbs while the
 * player keeps pressing 7, escalating tier/shout with the streak.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useSyncExternalStore } from 'react';
import {
  getVerticalLightningComboSnapshot,
  subscribeVerticalLightningCombo,
} from '../logic/verticalLightningComboStore';

/** Streak thresholds → tier styling, highest-first. */
const COMBO_TIERS = [
  { min: 24, tier: 'godlike', shout: 'THUNDERGOD!!' },
  { min: 16, tier: 'rampage', shout: 'STORM RAGE!' },
  { min: 9, tier: 'fire', shout: 'CHARGED!' },
  { min: 4, tier: 'hot', shout: 'COMBO!' },
  { min: 1, tier: 'base', shout: 'STRIKE!' },
] as const;

function resolveTier(count: number) {
  return COMBO_TIERS.find((t) => count >= t.min) ?? COMBO_TIERS[COMBO_TIERS.length - 1];
}

export function VerticalLightningComboBadge() {
  const snapshot = useSyncExternalStore(
    subscribeVerticalLightningCombo,
    getVerticalLightningComboSnapshot,
    getVerticalLightningComboSnapshot,
  );

  if (snapshot.count <= 0) return null;

  const { tier, shout } = resolveTier(snapshot.count);

  return (
    <div className="vertical-lightning-combo-wrap" aria-hidden>
      <div
        key={snapshot.pulse}
        className={`vertical-lightning-combo vertical-lightning-combo-${tier}`}
      >
        <span className="vertical-lightning-combo-count">×{snapshot.count}</span>
        <span className="vertical-lightning-combo-shout">{shout}</span>
      </div>
    </div>
  );
}
