/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SHEEP_CROSSING_MS,
  SHEEP_WAVE_DURATION_MS,
  SHEEP_WAVE_INTERVAL_MS,
  type SheepDirection,
  type SheepPhase,
} from '../config/sheepConfig';
import { hitTestSheepAtPoint } from '../logic/sheepHitTest';
import { pickSheepDirection } from '../logic/sheepFormation';
import { scheduleWhenGameplayActive, shiftAnchorsForPause } from '../../logic/gameplayPause';
import type { SheepBonusFloat, SheepHitEffect, SheepHitOutcome } from '../types/sheepTypes';

export type { SheepBonusFloat, SheepHitEffect, SheepHitOutcome } from '../types/sheepTypes';

export function useSheepHerd(active: boolean, autoSpawn = true) {
  const [phase, setPhase] = useState<SheepPhase>('idle');
  const [waveId, setWaveId] = useState(0);
  const [waveDirection, setWaveDirection] = useState<SheepDirection>('ltr');
  const [bonusFloats, setBonusFloats] = useState<SheepBonusFloat[]>([]);
  const [hitEffects, setHitEffects] = useState<SheepHitEffect[]>([]);

  const pausedAtRef = useRef<number | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const waveIdRef = useRef(0);
  const crossingUntilRef = useRef(0);
  const bonusFloatIdRef = useRef(0);
  const hitEffectIdRef = useRef(0);
  const sheepRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hitIdsRef = useRef<Set<number>>(new Set());
  const cancelAutoSpawnRef = useRef<(() => void) | null>(null);

  const beginCrossingWave = useCallback(() => {
    const nextWave = waveIdRef.current + 1;
    waveIdRef.current = nextWave;
    crossingUntilRef.current = Date.now() + SHEEP_WAVE_DURATION_MS;
    setWaveDirection(pickSheepDirection(nextWave));
    setWaveId(nextWave);
    setPhase('crossing');
    hitIdsRef.current = new Set();
    sheepRefs.current.clear();
  }, []);

  const resetCycle = useCallback(() => {
    pausedAtRef.current = null;
    waveIdRef.current = 0;
    crossingUntilRef.current = 0;
    cancelAutoSpawnRef.current?.();
    cancelAutoSpawnRef.current = null;
    setPhase('idle');
    setWaveId(0);
    setWaveDirection('ltr');
    hitIdsRef.current = new Set();
    setBonusFloats([]);
    setHitEffects([]);
    sheepRefs.current.clear();
  }, []);

  const triggerWave = useCallback(() => {
    if (!activeRef.current || Date.now() < crossingUntilRef.current) return false;
    beginCrossingWave();
    return true;
  }, [beginCrossingWave]);

  const scheduleAutoSpawn = useCallback(() => {
    cancelAutoSpawnRef.current?.();
    cancelAutoSpawnRef.current = scheduleWhenGameplayActive(
      () => activeRef.current,
      () => {
        triggerWave();
        scheduleAutoSpawn();
      },
      SHEEP_WAVE_INTERVAL_MS,
    );
  }, [triggerWave]);

  useEffect(() => {
    if (!active) {
      if (pausedAtRef.current === null) pausedAtRef.current = Date.now();
      cancelAutoSpawnRef.current?.();
      cancelAutoSpawnRef.current = null;
      return;
    }

    if (pausedAtRef.current !== null) {
      shiftAnchorsForPause([crossingUntilRef], pausedAtRef.current, Date.now());
      pausedAtRef.current = null;
    }

    if (autoSpawn) scheduleAutoSpawn();

    const tick = () => {
      if (crossingUntilRef.current > 0 && Date.now() >= crossingUntilRef.current) {
        crossingUntilRef.current = 0;
        setPhase('idle');
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 80);
    return () => {
      window.clearInterval(intervalId);
      cancelAutoSpawnRef.current?.();
      cancelAutoSpawnRef.current = null;
    };
  }, [active, autoSpawn, scheduleAutoSpawn]);

  const registerSheepRef = useCallback((id: number, node: HTMLDivElement | null) => {
    if (node) sheepRefs.current.set(id, node);
    else sheepRefs.current.delete(id);
  }, []);

  const showBonusFloat = useCallback((variant: Exclude<SheepHitOutcome, 'black'>) => {
    const id = ++bonusFloatIdRef.current;
    setBonusFloats((prev) => [...prev, { id, variant }]);
  }, []);

  const removeBonusFloat = useCallback((id: number) => {
    setBonusFloats((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const removeHitEffect = useCallback((id: number) => {
    setHitEffects((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const tryHitSheep = useCallback(
    (container: HTMLElement, impactX: number, impactY: number): SheepHitOutcome | false => {
      if (phase !== 'crossing') return false;

      const sheepId = hitTestSheepAtPoint(
        container,
        sheepRefs.current,
        hitIdsRef.current,
        impactX,
        impactY,
      );

      if (sheepId === null) return false;

      const element = sheepRefs.current.get(sheepId);
      const variant = (element?.dataset.sheepVariant ?? 'white') as SheepHitOutcome;
      if (element) {
        element.classList.add('sheep-unit-hit');
        const containerRect = container.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.top + rect.height / 2 - containerRect.top;
        const effectId = ++hitEffectIdRef.current;
        setHitEffects((prev) => [...prev, { id: effectId, x, y, variant }]);
      }

      hitIdsRef.current.add(sheepId);
      if (variant !== 'black') showBonusFloat(variant);
      return variant;
    },
    [phase, showBonusFloat],
  );

  return {
    phase,
    waveId,
    waveDirection,
    bonusFloats,
    hitEffects,
    crossingMs: SHEEP_CROSSING_MS,
    registerSheepRef,
    tryHitSheep,
    removeBonusFloat,
    removeHitEffect,
    resetCycle,
    triggerWave,
  };
}
