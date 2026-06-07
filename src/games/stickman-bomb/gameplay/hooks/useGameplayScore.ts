/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useRef, useState } from 'react';
import { audioManager } from '../../../../utils/audio';
import { buildStats } from '../logic/buildStats';
import { buildCounterTokens } from '../logic/formatCounterDisplay';
import { SHEEP_REWARD } from '../sheep';
import { BIRD_SHOOT_REWARD } from '../birds';
import type { PenaltyFloat } from '../types/gameplayTypes';

type UseGameplayScoreOptions = {
  isMuted: boolean;
  onStatsChange: (stats: ReturnType<typeof buildStats>) => void;
  shake: (intensity: number, duration?: number) => Promise<void>;
  targetScore?: number;
  freezeSway?: boolean;
};

export function useGameplayScore({
  isMuted,
  onStatsChange,
  shake,
  targetScore = Number.POSITIVE_INFINITY,
  freezeSway = false,
}: UseGameplayScoreOptions) {
  const [count, setCount] = useState(0);
  const [penaltyFloats, setPenaltyFloats] = useState<PenaltyFloat[]>([]);
  const penaltyFloatIdRef = useRef(0);
  const countRef = useRef(0);
  const targetScoreRef = useRef(targetScore);
  const freezeSwayRef = useRef(freezeSway);
  targetScoreRef.current = targetScore;
  freezeSwayRef.current = freezeSway;
  countRef.current = count;

  const isAtTarget = useCallback(
    (value: number) => value >= targetScoreRef.current || freezeSwayRef.current,
    [],
  );

  const emitStats = useCallback(
    (nextCount: number) => {
      onStatsChange(buildStats(nextCount));
    },
    [onStatsChange],
  );

  const showPenaltyFloat = useCallback((amount: number) => {
    const id = ++penaltyFloatIdRef.current;
    setPenaltyFloats((prev) => [...prev, { id, amount }]);
  }, []);

  const removePenaltyFloat = useCallback((id: number) => {
    setPenaltyFloats((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const applyDelta = useCallback(
    (
      delta: number,
      shakeIntensity: number,
      shakeDuration = 0.2,
      options?: { showPenaltyFloat?: boolean },
    ) => {
      if (delta > 0 && isAtTarget(countRef.current)) return;

      if (delta < 0 && options?.showPenaltyFloat !== false) {
        showPenaltyFloat(Math.abs(delta));
      }
      setCount((prev) => {
        if (delta > 0 && isAtTarget(prev)) return prev;
        const raw = Math.max(0, prev + delta);
        const next =
          delta > 0 ? Math.min(raw, targetScoreRef.current) : raw;
        if (next !== prev) emitStats(next);
        return next;
      });
      void shake(shakeIntensity, shakeDuration);
    },
    [emitStats, isAtTarget, shake, showPenaltyFloat],
  );

  const increment = useCallback(() => {
    if (isAtTarget(countRef.current)) return;

    setCount((prev) => {
      const next = Math.min(prev + 1, targetScoreRef.current);
      emitStats(next);
      return next;
    });
    void shake(5);
    if (!isMuted) audioManager.playPop();
  }, [emitStats, isAtTarget, isMuted, shake]);

  const applySheepBonus = useCallback(() => {
    if (isAtTarget(countRef.current)) return;

    setCount((prev) => {
      const next = Math.min(prev + SHEEP_REWARD, targetScoreRef.current);
      if (next !== prev) emitStats(next);
      return next;
    });
    void shake(8);
    if (!isMuted) audioManager.playPop(SHEEP_REWARD);
  }, [emitStats, isAtTarget, isMuted, shake]);

  const applyBirdBonus = useCallback(() => {
    if (isAtTarget(countRef.current)) return;

    setCount((prev) => {
      const next = Math.min(prev + BIRD_SHOOT_REWARD, targetScoreRef.current);
      if (next !== prev) emitStats(next);
      return next;
    });
    void shake(7);
    if (!isMuted) audioManager.playBirdHit();
  }, [emitStats, isAtTarget, isMuted, shake]);

  const resetScore = useCallback(() => {
    setPenaltyFloats([]);
    setCount(0);
    emitStats(0);
  }, [emitStats]);

  const counterTokens = buildCounterTokens(count);

  return {
    count,
    counterTokens,
    penaltyFloats,
    increment,
    applySheepBonus,
    applyBirdBonus,
    applyDelta,
    resetScore,
    removePenaltyFloat,
    emitStats,
  };
}
