/**
 * Layer for the money spinner prize wheel (key 5).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { ActiveMoneySpinner } from '../hooks/useMoneySpinner';
import { MoneySpinnerInstance } from './MoneySpinnerInstance';
import { moneySpinnerStyles } from '../styles/moneySpinnerStyles';

type MoneySpinnerLayerProps = {
  spins: ActiveMoneySpinner[];
  onWin: (amount: number) => void;
  onComplete: (spinId: number) => void;
};

export function MoneySpinnerLayer({ spins, onWin, onComplete }: MoneySpinnerLayerProps) {
  if (spins.length === 0) return null;

  return (
    <>
      <style>{moneySpinnerStyles}</style>
      <div className="money-spinner-layer" aria-hidden>
        {spins.map((spin) => (
          <MoneySpinnerInstance
            key={spin.id}
            spin={spin}
            onWin={onWin}
            onComplete={() => onComplete(spin.id)}
          />
        ))}
      </div>
    </>
  );
}
