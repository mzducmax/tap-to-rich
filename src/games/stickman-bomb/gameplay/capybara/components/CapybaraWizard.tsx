/**
 * Decorative capybara wizard casting spells on the gameplay layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useEffect, useState } from 'react';
import {
  WIZARD_AURA_FRAMES,
  WIZARD_CAST_FRAMES,
  WIZARD_IDLE_FRAMES,
} from '../config/wizardSpriteConfig';
import { wizardStyles } from '../styles/wizardStyles';
import { WizardSprite } from './WizardSprite';

type WizardPhase = 'cast' | 'aura' | 'idle';

type CapybaraWizardProps = {
  active?: boolean;
};

const PHASE_FRAMES: Record<WizardPhase, readonly number[]> = {
  cast: WIZARD_CAST_FRAMES,
  aura: WIZARD_AURA_FRAMES,
  idle: WIZARD_IDLE_FRAMES,
};

const PHASE_MS: Record<WizardPhase, number> = {
  cast: 180,
  aura: 320,
  idle: 900,
};

const PHASE_DURATION_MS: Record<WizardPhase, number> = {
  cast: 900,
  aura: 1200,
  idle: 2400,
};

const PHASE_ORDER: WizardPhase[] = ['cast', 'aura', 'idle'];

export const CapybaraWizard = memo(function CapybaraWizard({
  active = true,
}: CapybaraWizardProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASE_ORDER[phaseIndex];

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASE_ORDER.length);
    }, PHASE_DURATION_MS[phase]);
    return () => window.clearTimeout(timer);
  }, [active, phase]);

  if (!active) return null;

  return (
    <div className="wizard-layer" aria-hidden>
      <style>{wizardStyles}</style>
      <div className="wizard-anchor">
        <span className="wizard-body">
          <WizardSprite
            frameIndices={PHASE_FRAMES[phase]}
            frameMs={PHASE_MS[phase]}
          />
        </span>
      </div>
    </div>
  );
});
