/**
 * Keyboard / mouse controls reference for the settings panel.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { formatWeaponSwitchKeyLabel, type WeaponMode } from '../config/weaponSettings';

type GameplayControlsSectionProps = {
  weaponMode: WeaponMode;
  weaponSwitchKey: string;
};

function ControlRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px] leading-snug">
      <span className="shrink-0 font-mono font-black text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/80 min-w-[4.5rem] text-center">
        {keys}
      </span>
      <span className="font-bold text-indigo-950/75 pt-0.5">{action}</span>
    </div>
  );
}

export function GameplayControlsSection({
  weaponMode,
  weaponSwitchKey,
}: GameplayControlsSectionProps) {
  const switchLabel = formatWeaponSwitchKeyLabel(weaponSwitchKey);
  const isGun = weaponMode === 'gun';

  return (
    <div className="mb-5 flex flex-col gap-2 rounded-xl border border-indigo-900/10 bg-slate-50/80 p-3">
      <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
        Game Controls
      </span>
      <p className="text-[10px] font-bold text-indigo-900/50 leading-snug">
        {isGun
          ? 'Gun mode — scope view active'
          : 'Hammer mode — click the estate to score'}
      </p>
      <div className="flex flex-col gap-1.5 mt-0.5">
        {!isGun && (
          <>
            <ControlRow keys="[1]" action="Bomb attack" />
            <ControlRow keys="[2]" action="Bow attack" />
            <ControlRow keys="Click" action="Increase score (estate)" />
            <ControlRow keys={`[${switchLabel}]`} action="Switch to gun mode" />
          </>
        )}
        {isGun && (
          <>
            <ControlRow keys="Click" action="Shoot (scope view)" />
            <ControlRow keys={`[${switchLabel}]`} action="Switch to hammer mode" />
          </>
        )}
        <ControlRow keys="ESC" action="Open / close settings" />
      </div>
    </div>
  );
}
