/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MOLE_DOWN_MS,
  MOLE_IDLE_MAX_MS,
  MOLE_IDLE_MIN_MS,
  MOLE_RISE_MS,
  MOLE_UP_MS,
  MOLE_WAVE_DURATION_MS,
  type MolePhase,
} from '../config/moleConfig';
import { buildMoleField, type MoleSpawn } from '../logic/buildMoleField';
import { hitTestMoleAtPoint } from '../logic/moleHitTest';
import { shiftAnchorsForPause } from '../../logic/gameplayPause';
import type { MoleBonusFloat, MoleHitEffect, MoleVisibility } from '../types/moleTypes';

export type { MoleBonusFloat, MoleHitEffect } from '../types/moleTypes';

type MoleTimer = ReturnType<typeof setTimeout>;

function randomIdleMs() {
  return MOLE_IDLE_MIN_MS + Math.floor(Math.random() * (MOLE_IDLE_MAX_MS - MOLE_IDLE_MIN_MS));
}

export function useMoleField(active: boolean) {
  const [phase, setPhase] = useState<MolePhase>('idle');
  const [waveId, setWaveId] = useState(0);
  const [spawns, setSpawns] = useState<MoleSpawn[]>([]);
  const [visibility, setVisibility] = useState<Map<number, MoleVisibility>>(new Map());
  const [bonusFloats, setBonusFloats] = useState<MoleBonusFloat[]>([]);
  const [hitEffects, setHitEffects] = useState<MoleHitEffect[]>([]);

  const pausedAtRef = useRef<number | null>(null);
  const waveIdRef = useRef(0);
  const activeUntilRef = useRef(0);
  const bonusFloatIdRef = useRef(0);
  const hitEffectIdRef = useRef(0);
  const moleRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hitIdsRef = useRef<Set<number>>(new Set());
  const moleTimersRef = useRef<Map<number, MoleTimer[]>>(new Map());
  const visibilityRef = useRef<Map<number, MoleVisibility>>(new Map());

  const clearMoleTimers = useCallback((moleId?: number) => {
    if (moleId === undefined) {
      for (const timers of moleTimersRef.current.values()) {
        timers.forEach((timer) => clearTimeout(timer));
      }
      moleTimersRef.current.clear();
      return;
    }

    const timers = moleTimersRef.current.get(moleId);
    if (!timers) return;
    timers.forEach((timer) => clearTimeout(timer));
    moleTimersRef.current.delete(moleId);
  }, []);

  const setMoleVisibility = useCallback((moleId: number, next: MoleVisibility) => {
    visibilityRef.current.set(moleId, next);
    setVisibility(new Map(visibilityRef.current));
  }, []);

  const scheduleMolePop = useCallback(
    (moleId: number, delayMs: number) => {
      clearMoleTimers(moleId);

      const startTimer = setTimeout(() => {
        if (Date.now() >= activeUntilRef.current) return;
        if (hitIdsRef.current.has(moleId)) return;

        setMoleVisibility(moleId, 'rising');

        const upTimer = setTimeout(() => {
          if (Date.now() >= activeUntilRef.current) return;
          if (hitIdsRef.current.has(moleId)) return;
          setMoleVisibility(moleId, 'up');
        }, MOLE_RISE_MS);

        const downTimer = setTimeout(() => {
          if (hitIdsRef.current.has(moleId)) return;
          setMoleVisibility(moleId, 'down');
        }, MOLE_RISE_MS + MOLE_UP_MS);

        const hiddenTimer = setTimeout(() => {
          if (hitIdsRef.current.has(moleId)) return;
          setMoleVisibility(moleId, 'hidden');
          scheduleMolePop(moleId, randomIdleMs());
        }, MOLE_RISE_MS + MOLE_UP_MS + MOLE_DOWN_MS);

        moleTimersRef.current.set(moleId, [upTimer, downTimer, hiddenTimer]);
      }, delayMs);

      moleTimersRef.current.set(moleId, [startTimer]);
    },
    [clearMoleTimers, setMoleVisibility],
  );

  const startMoleCycles = useCallback(
    (field: MoleSpawn[]) => {
      clearMoleTimers();
      visibilityRef.current = new Map(field.map((mole) => [mole.id, 'hidden']));
      setVisibility(new Map(visibilityRef.current));

      field.forEach((mole) => {
        scheduleMolePop(mole.id, mole.firstPopDelayMs);
      });
    },
    [clearMoleTimers, scheduleMolePop],
  );

  const beginWave = useCallback(() => {
    const nextWave = waveIdRef.current + 1;
    waveIdRef.current = nextWave;
    activeUntilRef.current = Date.now() + MOLE_WAVE_DURATION_MS;
    const field = buildMoleField(nextWave);

    hitIdsRef.current = new Set();
    moleRefs.current.clear();
    setWaveId(nextWave);
    setSpawns(field);
    setPhase('active');
    startMoleCycles(field);
  }, [startMoleCycles]);

  const resetCycle = useCallback(() => {
    pausedAtRef.current = null;
    waveIdRef.current = 0;
    activeUntilRef.current = 0;
    clearMoleTimers();
    hitIdsRef.current = new Set();
    moleRefs.current.clear();
    visibilityRef.current = new Map();
    setPhase('idle');
    setWaveId(0);
    setSpawns([]);
    setVisibility(new Map());
    setBonusFloats([]);
    setHitEffects([]);
  }, [clearMoleTimers]);

  const triggerWave = useCallback(() => {
    if (!active || Date.now() < activeUntilRef.current) return false;
    beginWave();
    return true;
  }, [active, beginWave]);

  useEffect(() => {
    if (!active) {
      if (pausedAtRef.current === null) pausedAtRef.current = Date.now();
      return;
    }

    if (pausedAtRef.current !== null) {
      shiftAnchorsForPause([activeUntilRef], pausedAtRef.current, Date.now());
      pausedAtRef.current = null;
    }

    const tick = () => {
      if (activeUntilRef.current > 0 && Date.now() >= activeUntilRef.current) {
        activeUntilRef.current = 0;
        clearMoleTimers();
        setPhase('idle');
        setSpawns([]);
        visibilityRef.current = new Map();
        setVisibility(new Map());
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 80);
    return () => window.clearInterval(intervalId);
  }, [active, clearMoleTimers]);

  const registerMoleRef = useCallback((id: number, node: HTMLDivElement | null) => {
    if (node) moleRefs.current.set(id, node);
    else moleRefs.current.delete(id);
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

  const tryHitMole = useCallback(
    (container: HTMLElement, impactX: number, impactY: number): boolean => {
      if (phase !== 'active') return false;

      const moleId = hitTestMoleAtPoint(
        container,
        moleRefs.current,
        hitIdsRef.current,
        visibilityRef.current,
        impactX,
        impactY,
      );

      if (moleId === null) return false;

      clearMoleTimers(moleId);
      hitIdsRef.current.add(moleId);
      setMoleVisibility(moleId, 'hit');

      const element = moleRefs.current.get(moleId);
      if (element) {
        const containerRect = container.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.top + rect.height / 2 - containerRect.top;
        const effectId = ++hitEffectIdRef.current;
        setHitEffects((prev) => [...prev, { id: effectId, x, y }]);
      }

      showBonusFloat();
      return true;
    },
    [clearMoleTimers, phase, setMoleVisibility, showBonusFloat],
  );

  return {
    phase,
    waveId,
    spawns,
    visibility,
    bonusFloats,
    hitEffects,
    registerMoleRef,
    tryHitMole,
    removeBonusFloat,
    removeHitEffect,
    resetCycle,
    triggerWave,
  };
}
