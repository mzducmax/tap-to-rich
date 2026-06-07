/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSheepPhase,
  SHEEP_CROSSING_MS,
  type SheepPhase,
} from '../config/sheepConfig';
import { hitTestSheepAtPoint } from '../logic/sheepHitTest';
import type { SheepBonusFloat, SheepHitEffect } from '../types/sheepTypes';

export type { SheepBonusFloat, SheepHitEffect } from '../types/sheepTypes';

export function useSheepHerd(active: boolean) {
  const [phase, setPhase] = useState<SheepPhase>('idle');
  const [waveId, setWaveId] = useState(0);
  const [bonusFloats, setBonusFloats] = useState<SheepBonusFloat[]>([]);
  const [hitEffects, setHitEffects] = useState<SheepHitEffect[]>([]);

  const cycleStartRef = useRef(Date.now());
  const prevPhaseRef = useRef<SheepPhase>('idle');
  const bonusFloatIdRef = useRef(0);
  const hitEffectIdRef = useRef(0);
  const sheepRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hitIdsRef = useRef<Set<number>>(new Set());

  const resetCycle = useCallback(() => {
    cycleStartRef.current = Date.now();
    prevPhaseRef.current = 'idle';
    setPhase('idle');
    setWaveId(0);
    hitIdsRef.current = new Set();
    setBonusFloats([]);
    setHitEffects([]);
    sheepRefs.current.clear();
  }, []);

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const elapsed = Date.now() - cycleStartRef.current;
      const nextPhase = getSheepPhase(elapsed);
      setPhase(nextPhase);

      if (nextPhase === 'crossing' && prevPhaseRef.current !== 'crossing') {
        setWaveId((value) => value + 1);
        hitIdsRef.current = new Set();
        sheepRefs.current.clear();
      }

      prevPhaseRef.current = nextPhase;
    };

    tick();
    const intervalId = window.setInterval(tick, 80);
    return () => window.clearInterval(intervalId);
  }, [active]);

  const registerSheepRef = useCallback((id: number, node: HTMLDivElement | null) => {
    if (node) sheepRefs.current.set(id, node);
    else sheepRefs.current.delete(id);
  }, []);

  const showBonusFloat = useCallback(() => {
    const id = ++bonusFloatIdRef.current;
    setBonusFloats((prev) => [...prev, { id }]);
  }, []);

  const removeBonusFloat = useCallback((id: number) => {
    setBonusFloats((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const removeHitEffect = useCallback((id: number) => {
    setHitEffects((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const tryHitSheep = useCallback(
    (container: HTMLElement, impactX: number, impactY: number): boolean => {
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
      if (element) {
        element.classList.add('sheep-unit-hit');
        const containerRect = container.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.top + rect.height / 2 - containerRect.top;
        const effectId = ++hitEffectIdRef.current;
        setHitEffects((prev) => [...prev, { id: effectId, x, y }]);
      }

      hitIdsRef.current.add(sheepId);
      showBonusFloat();
      return true;
    },
    [phase, showBonusFloat],
  );

  return {
    phase,
    waveId,
    bonusFloats,
    hitEffects,
    crossingMs: SHEEP_CROSSING_MS,
    registerSheepRef,
    tryHitSheep,
    removeBonusFloat,
    removeHitEffect,
    resetCycle,
  };
}
