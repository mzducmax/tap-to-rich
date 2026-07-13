/**
 * Settings panel section — editable +/- money amount per fixed live action.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  clampActionMoney,
  FIXED_MONEY_ACTIONS,
  getActionMoneyAmount,
  type ActionMoneyOverrides,
  type FixedMoneyAction,
} from '../config/actionMoneyConfig';
import { hasActionMoneyOverride } from '../config/actionMoneySettings';

type ActionMoneySettingsSectionProps = {
  actionMoneyOverrides: ActionMoneyOverrides;
  onActionMoneyChange: (actionId: number, amount: number) => void;
  onActionMoneyReset: (actionId: number) => void;
  onResetAllActionMoney: () => void;
};

function ActionMoneyRow({
  action,
  actionMoneyOverrides,
  onActionMoneyChange,
  onActionMoneyReset,
}: {
  action: FixedMoneyAction;
  actionMoneyOverrides: ActionMoneyOverrides;
  onActionMoneyChange: (actionId: number, amount: number) => void;
  onActionMoneyReset: (actionId: number) => void;
}) {
  const amount = getActionMoneyAmount(action.key, actionMoneyOverrides);
  const isCustom = hasActionMoneyOverride(action.actionId, actionMoneyOverrides);
  const isEnemy = action.side === 'enemy';

  return (
    <div className="flex items-center gap-2 rounded-lg border border-indigo-900/10 bg-white/70 px-2 py-1.5">
      <span className="text-base leading-none">{action.emoji}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[11px] font-black text-indigo-950/80">
          {action.label}
        </span>
        <span className="text-[9px] font-bold text-indigo-900/45">
          <span className={isEnemy ? 'text-rose-600' : 'text-emerald-600'}>
            {isEnemy ? 'Enemy' : 'Helper'}
          </span>
          {` · ${isCustom ? 'custom' : 'default'}`}
          {action.unitLabel ? ` · ${action.unitLabel}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-1 rounded-md bg-indigo-50/70 px-2 py-0.5 border border-indigo-900/10 shadow-inner">
        <span className={`text-[11px] font-black ${isEnemy ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isEnemy ? '−$' : '+$'}
        </span>
        <input
          type="number"
          min={0}
          value={Math.abs(amount)}
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = raw === '' ? 0 : parseInt(raw, 10);
            const magnitude = Math.abs(parsed || 0);
            onActionMoneyChange(
              action.actionId,
              clampActionMoney(isEnemy ? -magnitude : magnitude),
            );
          }}
          className="w-[5.5rem] bg-transparent border-0 outline-none text-right font-black text-[13px] text-indigo-950 focus:outline-none"
        />
      </div>
      {isCustom && (
        <button
          type="button"
          onClick={() => onActionMoneyReset(action.actionId)}
          className="shrink-0 text-[9px] font-black uppercase tracking-wide text-slate-500 hover:text-slate-700"
          title="Reset to default"
        >
          Default
        </button>
      )}
    </div>
  );
}

export function ActionMoneySettingsSection({
  actionMoneyOverrides,
  onActionMoneyChange,
  onActionMoneyReset,
  onResetAllActionMoney,
}: ActionMoneySettingsSectionProps) {
  const customCount = FIXED_MONEY_ACTIONS.filter((a) =>
    hasActionMoneyOverride(a.actionId, actionMoneyOverrides),
  ).length;

  return (
    <div className="mb-5 flex flex-col gap-1.5 rounded-xl border border-indigo-900/10 bg-slate-50/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
          Action Money
        </span>
        {customCount > 0 && (
          <button
            type="button"
            onClick={onResetAllActionMoney}
            className="text-[9px] font-black uppercase tracking-wide text-rose-600 hover:text-rose-800"
          >
            Reset All
          </button>
        )}
      </div>
      <p className="text-[10px] font-bold text-indigo-900/50 leading-snug">
        Money amount each time an action fires — just enter the number, no
        sign needed. Enemy actions subtract, Helper actions add. Random
        actions (dice, plinko, spinner) are not listed.
      </p>
      <div className="mt-0.5 flex flex-col gap-1">
        {FIXED_MONEY_ACTIONS.map((action) => (
          <ActionMoneyRow
            key={action.actionId}
            action={action}
            actionMoneyOverrides={actionMoneyOverrides}
            onActionMoneyChange={onActionMoneyChange}
            onActionMoneyReset={onActionMoneyReset}
          />
        ))}
      </div>
    </div>
  );
}
