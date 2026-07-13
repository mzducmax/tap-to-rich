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

/** Live action row — no key badge: these only spawn from a WSS `game_execute_action`
 * event (see `ACTION_REGISTRY` in `gameActionExecutor.ts`), never from a keypress. */
function LiveActionRow({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px] leading-snug">
      <span className="shrink-0 font-black text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/80">
        {name}
      </span>
      <span className="font-bold text-indigo-950/75 pt-0.5">{description}</span>
    </div>
  );
}

/** Reference list of live actions dispatched by `actionId` — kept in sync with
 * `config/defaultActions.json` and `ACTION_REGISTRY` in `gameActionExecutor.ts`. */
const LIVE_ACTIONS: { name: string; description: string }[] = [
  { name: 'System hack', description: 'Full-screen system hack sequence (matrix rain, alert, money drain)' },
  { name: 'Bomb', description: 'Stickman tosses a bomb onto the estate (−$10 on explode)' },
  { name: 'Plinko', description: 'Ball drops through the tower; bet × slot multiplier added to assets' },
  { name: 'Grappling hook heist', description: 'Grappling hook strikes the estate' },
  { name: 'Money train', description: 'Money train drops coins over the estate (+$5 each)' },
  { name: 'Money spinner', description: 'Prize wheel spins; the landed tier is credited to the estate' },
  { name: 'Dice roll', description: 'Rolls a die on the estate; reward equals the face value' },
  { name: 'Vertical lightning', description: 'Lightning bolts strike straight down on the estate' },
  { name: 'Knife drop', description: 'A knife falls from the sky and plants at a random spot' },
  { name: 'Trump spawn', description: 'Trump box spawn with money zigzag + camera zoom (−$10,000)' },
  { name: 'Pig bank', description: 'Golden pig bank descends, money piles up (+$1,000)' },
  { name: 'Gold nugget slam', description: 'Gold nugget arcs in, slams the house, gold burst (+$20)' },
  { name: 'Missile strike', description: 'Missile flies in from off-screen and explodes on the estate (−$20)' },
  { name: '- Win', description: 'Subtracts one win from the match progress' },
  { name: '+ Win', description: 'Adds one win to the match progress' },
  { name: 'Reset', description: 'Resets the current match' },
  { name: 'Tomato throw', description: 'Tomato arcs in and splats the house (−$20)' },
  { name: 'Bird flock', description: 'A flock of birds sweeps the estate (+$10 per hit)' },
];

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
          <ControlRow
            keys="Click"
            action={`Hammer estate (+$${hammerEstateReward} per hit)`}
          />
        )}
        {isGun && <ControlRow keys="Click" action="Shoot (scope view)" />}
        <ControlRow keys={`[${switchLabel}]`} action={isGun ? 'Switch to hammer mode' : 'Switch to gun mode'} />
        <ControlRow
          keyPreview={<MoleControlPreview />}
          action="Whack-a-mole — holes & mice (+$10 per hit)"
        />
        <ControlRow keys="[M]" action="Open / close game market" />
        <ControlRow keys="ESC" action="Open / close settings" />
      </div>

      <span className="mt-1.5 text-xs font-black uppercase text-indigo-950/70 tracking-wider">
        Live Actions
      </span>
      <p className="text-[10px] font-bold text-indigo-900/50 leading-snug">
        Triggered only by a live event (gift / like), never by a keypress.
      </p>
      <div className="flex flex-col gap-1.5 mt-0.5">
        {LIVE_ACTIONS.map((liveAction) => (
          <LiveActionRow key={liveAction.name} name={liveAction.name} description={liveAction.description} />
        ))}
      </div>
    </div>
  );
}
