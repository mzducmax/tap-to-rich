/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useRef, useState } from 'react';
import {
  clampScoreToBounds,
  hasReachedWinTarget,
} from '../../background/config/targetLimits';
import { audioManager } from '../../../../utils/audio';
import { buildStats } from '../logic/buildStats';
import { buildCounterTokens } from '../logic/formatCounterDisplay';
import {
  getSheepHitDelta,
  SHEEP_BLACK_PENALTY,
  type SheepVariant,
} from '../sheep';
import { BIRD_SHOOT_REWARD } from '../birds';
import { MOLE_REWARD } from '../moles';
import { HAMMER_ESTATE_REWARD_DEFAULT } from '../config/hammerConfig';
import type { PenaltyFloat, ScoreFloatSource } from '../types/gameplayTypes';

type UseGameplayScoreOptions = {
  isMuted: boolean;
  onStatsChange: (stats: ReturnType<typeof buildStats>) => void;
  shake: (intensity: number, duration?: number) => Promise<void>;
  targetScore?: number;
  freezeSway?: boolean;
  hammerEstateReward?: number;
};

function clampToScoreBounds(value: number, targetScore: number): number {
  return clampScoreToBounds(value, targetScore);
}

type ScoreDeltaOptions = {
  showPenaltyFloat?: boolean;
  showScoreFloat?: boolean;
  source?: ScoreFloatSource;
  sheepVariant?: SheepVariant;
};

type ScoreFloatMeta = {
  sheepVariant?: SheepVariant;
};

export function useGameplayScore({
  isMuted,
  onStatsChange,
  shake,
  targetScore = Number.POSITIVE_INFINITY,
  freezeSway = false,
  hammerEstateReward = HAMMER_ESTATE_REWARD_DEFAULT,
}: UseGameplayScoreOptions) {
  const [count, setCount] = useState(0);
  const [penaltyFloats, setPenaltyFloats] = useState<PenaltyFloat[]>([]);
  const penaltyFloatIdRef = useRef(0);
  const countRef = useRef(0);
  const targetScoreRef = useRef(targetScore);
  const freezeSwayRef = useRef(freezeSway);
  const hammerEstateRewardRef = useRef(hammerEstateReward);
  targetScoreRef.current = targetScore;
  freezeSwayRef.current = freezeSway;
  hammerEstateRewardRef.current = hammerEstateReward;
  countRef.current = count;

  const isAtTarget = useCallback((value: number) => {
    if (freezeSwayRef.current) return true;
    return hasReachedWinTarget(value, targetScoreRef.current);
  }, []);

  const emitStats = useCallback(
    (nextCount: number) => {
      onStatsChange(buildStats(nextCount));
    },
    [onStatsChange],
  );

  const showScoreFloat = useCallback((
    delta: number,
    source: ScoreFloatSource,
    meta?: ScoreFloatMeta,
  ) => {
    if (delta === 0) return;
    const id = ++penaltyFloatIdRef.current;
    setPenaltyFloats((prev) => [
      ...prev,
      { id, delta, source, sheepVariant: meta?.sheepVariant },
    ]);
  }, []);

  const removePenaltyFloat = useCallback((id: number) => {
    setPenaltyFloats((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const applyDelta = useCallback(
    (
      delta: number,
      shakeIntensity: number,
      shakeDuration = 0.2,
      options?: ScoreDeltaOptions,
    ) => {
      if (delta > 0 && isAtTarget(countRef.current)) return;

      setCount((prev) => {
        if (delta > 0 && isAtTarget(prev)) return prev;
        const next = clampToScoreBounds(prev + delta, targetScoreRef.current);
        if (next === prev) return prev;

        const appliedDelta = next - prev;

        if (
          options?.showScoreFloat !== false &&
          (appliedDelta > 0 || options?.showPenaltyFloat !== false)
        ) {
          showScoreFloat(appliedDelta, options?.source ?? 'system', {
            sheepVariant: options?.sheepVariant,
          });
        }
        emitStats(next);
        return next;
      });
      void shake(shakeIntensity, shakeDuration);
    },
    [emitStats, isAtTarget, shake, showScoreFloat],
  );

  const increment = useCallback((options?: { source?: ScoreFloatSource; showScoreFloat?: boolean }) => {
    if (isAtTarget(countRef.current)) return;

    const reward = hammerEstateRewardRef.current;
    setCount((prev) => {
      const next = clampToScoreBounds(prev + reward, targetScoreRef.current);
      if (next !== prev && options?.showScoreFloat !== false) {
        showScoreFloat(next - prev, options?.source ?? 'hammer');
      }
      emitStats(next);
      return next;
    });
    void shake(5);
    if (!isMuted) audioManager.playPop(reward);
  }, [emitStats, isAtTarget, isMuted, shake, showScoreFloat]);

  const applySheepHit = useCallback((
    variant: SheepVariant,
    source: ScoreFloatSource = 'sheep',
  ) => {
    if (variant === 'black') {
      applyDelta(-SHEEP_BLACK_PENALTY, 10, 0.35, { source, sheepVariant: variant });
      if (!isMuted) audioManager.playMiss();
      return;
    }

    if (isAtTarget(countRef.current)) return;

    const reward = getSheepHitDelta(variant);
    setCount((prev) => {
      const next = clampToScoreBounds(prev + reward, targetScoreRef.current);
      if (next !== prev) {
        showScoreFloat(next - prev, source, { sheepVariant: variant });
        emitStats(next);
      }
      return next;
    });
    const shakeIntensity =
      variant === 'gold' ? 11 : variant === 'pink' ? 9 : 8;
    void shake(shakeIntensity);
    if (!isMuted) audioManager.playPop(reward);
  }, [applyDelta, emitStats, isAtTarget, isMuted, shake, showScoreFloat]);

  const applyBirdBonus = useCallback((source: ScoreFloatSource = 'bird') => {
    if (isAtTarget(countRef.current)) return;

    setCount((prev) => {
      const next = clampToScoreBounds(
        prev + BIRD_SHOOT_REWARD,
        targetScoreRef.current,
      );
      if (next !== prev) {
        showScoreFloat(next - prev, source);
        emitStats(next);
      }
      return next;
    });
    void shake(7);
    if (!isMuted) audioManager.playBirdHit();
  }, [emitStats, isAtTarget, isMuted, shake, showScoreFloat]);

  const applyMoleBonus = useCallback((source: ScoreFloatSource = 'mole') => {
    if (isAtTarget(countRef.current)) return;

    setCount((prev) => {
      const next = clampToScoreBounds(prev + MOLE_REWARD, targetScoreRef.current);
      if (next !== prev) {
        showScoreFloat(next - prev, source);
        emitStats(next);
      }
      return next;
    });
    void shake(9);
    if (!isMuted) audioManager.playPop(MOLE_REWARD);
  }, [emitStats, isAtTarget, isMuted, shake, showScoreFloat]);

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
    applySheepHit,
    applyBirdBonus,
    applyMoleBonus,
    applyDelta,
    resetScore,
    removePenaltyFloat,
    emitStats,
    showScoreFloat,
  };
}
