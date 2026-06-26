/**
 * Keyboard / mouse controls reference for the settings panel.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatWeaponSwitchKeyLabel, type WeaponMode } from '../config/weaponSettings';
import { MoleControlPreview } from '../moles/components/MoleField';

type GameplayControlsSectionProps = {
  weaponMode: WeaponMode;
  weaponSwitchKey: string;
  hammerEstateReward: number;
};

function ControlRow({
  keys,
  action,
  keyPreview,
}: {
  keys?: string;
  action: string;
  keyPreview?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-[11px] leading-snug">
      {keyPreview ?? (
        <span className="shrink-0 font-mono font-black text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/80 min-w-[4.5rem] text-center">
          {keys}
        </span>
      )}
      <span className="font-bold text-indigo-950/75 pt-0.5">{action}</span>
    </div>
  );
}

export function GameplayControlsSection({
  weaponMode,
  weaponSwitchKey,
  hammerEstateReward,
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
            <ControlRow keys="[1]" action="Bomb — stickman tosses bomb on estate (−$10 on explode)" />
            <ControlRow keys="[2]" action="Plinko — drag ball on top rail, release to drop; $50 bet × slot multiplier added to assets" />
            <ControlRow keys="[3]" action="Avatar strike — arrows rain on estate (−$5 each)" />
            <ControlRow keys="[4]" action="Avatar coin shower — toss coins into estate (+$5 each)" />
            <ControlRow keys="[5]" action="Avatar energy blast — rapid palm strikes on estate (−$5 each)" />
            <ControlRow keys="[6]" action="Dice roll — ×10–×100 multiplier; face × multiplier added (+$10–$600)" />
            <ControlRow keys="[7]" action="Vertical lightning — bolts drop straight down on estate (−$5 each hit)" />
            <ControlRow keys="[8]" action="Soccer ball — fast shots; −$5 only when the ball hits the estate" />
            <ControlRow
              keys="Click"
              action={`Hammer estate (+$${hammerEstateReward} per hit)`}
            />
            <ControlRow keys={`[${switchLabel}]`} action="Switch to gun mode" />
          </>
        )}
        {isGun && (
          <>
            <ControlRow keys="Click" action="Shoot (scope view)" />
            <ControlRow keys={`[${switchLabel}]`} action="Switch to hammer mode" />
          </>
        )}
        <ControlRow
          keyPreview={<MoleControlPreview />}
          action="Whack-a-mole — holes & mice (+$10 per hit)"
        />
        <ControlRow keys="[Q]" action="Sheep herd (+$5 white, +$10×4 pink, +$30×2 gold, −$10 black, auto 10s)" />
        <ControlRow keys="[W]" action="Bird flock wave (+$10 per hit)" />
        <ControlRow keys="[M]" action="Open / close game market" />
        <ControlRow keys="ESC" action="Open / close settings" />
      </div>
    </div>
  );
}
