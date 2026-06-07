/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  BIRD_FLOCK_DURATION_MS,
  getBirdPhase,
  SPLAT_LIFETIME_MS,
  type BirdPhase,
} from '../config/birdConfig';
import { buildBirdFlock, type BirdSpawn } from '../logic/buildBirdFlock';
import { hitTestBirdAtPoint, isDuckAboveCounterWidth } from '../logic/birdHitTest';
import {
  computeBirdCrossProgress,
  computeBirdScreenRect,
  computeDuckButtPoint,
} from '../logic/birdPosition';
import { buildPoopDrop } from '../logic/buildPoopDrop';
import { computeRoastFallPx } from '../logic/computeRoastFall';
import { mountRoastPlate } from '../logic/mountRoastPlate';
import type {
  BirdBonusFloat,
  BirdHitEffect,
  BirdPoopDrop,
  BirdPoopPenaltyFloat,
  BirdSplatMark,
} from '../types/birdTypes';

export type {
  BirdBonusFloat,
  BirdHitEffect,
  BirdPoopDrop,
  BirdPoopPenaltyFloat,
  BirdSplatMark,
} from '../types/birdTypes';

type UseBirdFlockOptions = {
  active: boolean;
  counterBoxRef: RefObject<HTMLElement | null>;
  containerRef: RefObject<HTMLElement | null>;
  onPoopHitCounter: () => void;
  sheepCrossing: boolean;
};

export function useBirdFlock({
  active,
  counterBoxRef,
  containerRef,
  onPoopHitCounter,
  sheepCrossing,
}: UseBirdFlockOptions) {
  const [phase, setPhase] = useState<BirdPhase>('idle');
  const [waveId, setWaveId] = useState(0);
  const [fallingPoops, setFallingPoops] = useState<BirdPoopDrop[]>([]);
  const [splats, setSplats] = useState<BirdSplatMark[]>([]);
  const [bonusFloats, setBonusFloats] = useState<BirdBonusFloat[]>([]);
  const [poopPenaltyFloats, setPoopPenaltyFloats] = useState<BirdPoopPenaltyFloat[]>([]);
  const [hitEffects, setHitEffects] = useState<BirdHitEffect[]>([]);

  const cycleStartRef = useRef(Date.now());
  const prevPhaseRef = useRef<BirdPhase>('idle');
  const waveStartMsRef = useRef(0);
  const waveIdRef = useRef(0);
  const flockRef = useRef<BirdSpawn[]>([]);
  const layerSizeRef = useRef({ width: 800, height: 600 });
  const birdRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hitIdsRef = useRef<Set<number>>(new Set());
  const poopedBirdIdsRef = useRef<Set<number>>(new Set());
  const poopDropIdRef = useRef(0);
  const splatIdRef = useRef(0);
  const bonusFloatIdRef = useRef(0);
  const poopPenaltyFloatIdRef = useRef(0);
  const hitEffectIdRef = useRef(0);
  const onPoopHitCounterRef = useRef(onPoopHitCounter);
  onPoopHitCounterRef.current = onPoopHitCounter;
  const forcedCrossingUntilRef = useRef(0);

  const beginCrossingWave = useCallback(() => {
    const nextWave = waveIdRef.current + 1;
    waveIdRef.current = nextWave;
    waveStartMsRef.current = Date.now();
    flockRef.current = buildBirdFlock(nextWave);
    setWaveId(nextWave);
    setPhase('crossing');
    prevPhaseRef.current = 'crossing';
    hitIdsRef.current = new Set();
    setFallingPoops([]);
    setSplats([]);
    setBonusFloats([]);
    setPoopPenaltyFloats([]);
    setHitEffects([]);
    poopedBirdIdsRef.current.clear();
    birdRefs.current.clear();
  }, []);

  const resetCycle = useCallback(() => {
    cycleStartRef.current = Date.now();
    prevPhaseRef.current = 'idle';
    waveStartMsRef.current = 0;
    waveIdRef.current = 0;
    flockRef.current = [];
    forcedCrossingUntilRef.current = 0;
    setPhase('idle');
    setWaveId(0);
    hitIdsRef.current = new Set();
    setFallingPoops([]);
    setSplats([]);
    setBonusFloats([]);
    setPoopPenaltyFloats([]);
    setHitEffects([]);
    poopedBirdIdsRef.current.clear();
    birdRefs.current.clear();
  }, []);

  const triggerTestWave = useCallback(() => {
    if (!active || sheepCrossing) return false;
    forcedCrossingUntilRef.current = Date.now() + BIRD_FLOCK_DURATION_MS;
    beginCrossingWave();
    return true;
  }, [active, beginCrossingWave, sheepCrossing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;

    const syncSize = () => {
      layerSizeRef.current = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [active, containerRef]);

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const now = Date.now();
      const forced = now < forcedCrossingUntilRef.current;
      const cyclePhase = getBirdPhase(now - cycleStartRef.current);
      const nextPhase = forced ? 'crossing' : cyclePhase;

      if (nextPhase === 'crossing' && prevPhaseRef.current !== 'crossing') {
        beginCrossingWave();
      } else if (nextPhase !== 'crossing') {
        setPhase('idle');
        prevPhaseRef.current = 'idle';
        return;
      }

      prevPhaseRef.current = nextPhase;
    };

    tick();
    const intervalId = window.setInterval(tick, 80);
    return () => window.clearInterval(intervalId);
  }, [active, beginCrossingWave]);

  useEffect(() => {
    if (!active || phase !== 'crossing' || sheepCrossing) return;

    const tryDropPoops = () => {
      const counter = counterBoxRef.current;
      const flock = flockRef.current;
      if (!counter || flock.length === 0) return;

      const { width, height } = layerSizeRef.current;
      if (width <= 0 || height <= 0) return;

      const elapsedSinceWave = Date.now() - waveStartMsRef.current;

      for (const bird of flock) {
        if (poopedBirdIdsRef.current.has(bird.id) || hitIdsRef.current.has(bird.id)) continue;

        const progress = computeBirdCrossProgress(bird, elapsedSinceWave);
        if (progress === null) continue;

        const rect = computeBirdScreenRect(bird, progress, width, height);
        const container = containerRef.current;
        if (!container) continue;

        if (!isDuckAboveCounterWidth(rect, counter, container)) continue;

        poopedBirdIdsRef.current.add(bird.id);

        const butt = computeDuckButtPoint(rect);
        const dropId = ++poopDropIdRef.current;
        const drop = buildPoopDrop({
          id: dropId,
          buttY: butt.y,
          counter,
          container,
        });

        setFallingPoops((prev) => [...prev, drop]);

        window.setTimeout(() => {
          const penaltyFloatId = ++poopPenaltyFloatIdRef.current;
          setPoopPenaltyFloats((prev) => [
            ...prev,
            { id: penaltyFloatId, x: drop.hitX, y: drop.hitY },
          ]);
          onPoopHitCounterRef.current();
        }, drop.fallMs + Math.round(drop.stickMs * 0.65));

        window.setTimeout(() => {
          setFallingPoops((prev) => prev.filter((item) => item.id !== dropId));
        }, drop.totalMs);
      }
    };

    const poopIntervalId = window.setInterval(tryDropPoops, 120);
    return () => window.clearInterval(poopIntervalId);
  }, [active, counterBoxRef, containerRef, phase, sheepCrossing]);

  const registerBirdRef = useCallback((id: number, node: HTMLDivElement | null) => {
    if (node) birdRefs.current.set(id, node);
    else birdRefs.current.delete(id);
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

  const removePoopPenaltyFloat = useCallback((id: number) => {
    setPoopPenaltyFloats((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const tryHitBird = useCallback(
    (container: HTMLElement, x: number, y: number): boolean => {
      if (phase !== 'crossing' || sheepCrossing) return false;

      const flock = flockRef.current;
      if (flock.length === 0) return false;

      const { width, height } = layerSizeRef.current;
      const elapsedSinceWave = Date.now() - waveStartMsRef.current;

      const birdId = hitTestBirdAtPoint(
        flock,
        hitIdsRef.current,
        elapsedSinceWave,
        width,
        height,
        x,
        y,
      );

      if (birdId === null) return false;

      const bird = flock.find((item) => item.id === birdId);
      const progress = bird ? computeBirdCrossProgress(bird, elapsedSinceWave) : null;

      if (bird && progress !== null) {
        const rect = computeBirdScreenRect(bird, progress, width, height);
        const effectId = ++hitEffectIdRef.current;
        setHitEffects((prev) => [...prev, { id: effectId, x: rect.centerX, y: rect.centerY }]);
      }

      hitIdsRef.current.add(birdId);
      const track = birdRefs.current.get(birdId);
      track?.classList.add('bird-pigeon-track-hit');

      if (bird && progress !== null) {
        const rect = computeBirdScreenRect(bird, progress, width, height);
        const container = containerRef.current;
        const counter = counterBoxRef.current;
        const drop = track?.querySelector<HTMLElement>('.bird-pigeon-drop');
        const pigeon = drop?.querySelector<HTMLElement>('.bird-pigeon');

        if (drop && pigeon && container && counter) {
          mountRoastPlate(pigeon);
          const { fallPx, fallMs } = computeRoastFallPx(
            rect.topY,
            bird.scale,
            container,
            counter,
          );
          drop.style.setProperty('--bird-fall-px', `${fallPx}px`);
          drop.style.setProperty('--bird-fall-ms', `${fallMs}ms`);
          drop.classList.add('bird-pigeon-drop-hit');
        }
      }

      poopedBirdIdsRef.current.add(birdId);
      showBonusFloat();
      return true;
    },
    [phase, sheepCrossing, showBonusFloat, containerRef, counterBoxRef],
  );

  return {
    phase,
    waveId,
    fallingPoops,
    splats,
    bonusFloats,
    poopPenaltyFloats,
    hitEffects,
    flockDurationMs: BIRD_FLOCK_DURATION_MS,
    registerBirdRef,
    tryHitBird,
    removeBonusFloat,
    removePoopPenaltyFloat,
    removeHitEffect,
    resetCycle,
    triggerTestWave,
  };
}
