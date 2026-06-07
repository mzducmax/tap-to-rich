/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatWeaponSwitchKeyLabel, type WeaponMode } from '../config/weaponSettings';

export function WeaponModeBadge({
  mode,
  switchKeyCode,
}: {
  mode: WeaponMode;
  switchKeyCode: string;
}) {
  const switchLabel = formatWeaponSwitchKeyLabel(switchKeyCode);
  const isGun = mode === 'gun';

  return (
    <div className="weapon-mode-badge" aria-live="polite">
      <span className="weapon-mode-badge-icon" aria-hidden>
        {isGun ? '🔫' : '🔨'}
      </span>
      <span className="weapon-mode-badge-copy">
        <span className="weapon-mode-badge-title">{isGun ? 'Gun' : 'Hammer'}</span>
        <span className="weapon-mode-badge-hint">[{switchLabel}] switch</span>
      </span>
    </div>
  );
}

export const weaponModeBadgeStyles = `
  .weapon-mode-badge {
    --stick: #1a1a1a;
    position: absolute;
    left: 16px;
    bottom: 20px;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px 10px 12px;
    filter: drop-shadow(2px 3px 0 rgba(0, 0, 0, 0.12));
  }

  .weapon-mode-badge::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #fff;
    border: 3px solid var(--stick);
    border-radius: 46% 54% 53% 47% / 50% 46% 54% 50%;
    z-index: 0;
  }

  .weapon-mode-badge-icon {
    position: relative;
    z-index: 1;
    font-size: 1.25rem;
    line-height: 1;
  }

  .weapon-mode-badge-copy {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    color: var(--stick);
    font-family: ui-monospace, 'Courier New', monospace;
    text-transform: uppercase;
  }

  .weapon-mode-badge-title {
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.1em;
  }

  .weapon-mode-badge-hint {
    font-size: 0.58rem;
    font-weight: 700;
    opacity: 0.62;
    letter-spacing: 0.08em;
  }
`;
