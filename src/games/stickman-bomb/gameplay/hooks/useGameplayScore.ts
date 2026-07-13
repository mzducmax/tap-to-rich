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
import {
  HAMMER_COMBO_BONUS,
  HAMMER_COMBO_HIT_TARGET,
  HAMMER_ESTATE_REWARD_DEFAULT,
  HAMMER_MEGA_COMBO_BONUS,
  HAMMER_MEGA_COMBO_HIT_TARGET,
} from '../config/hammerConfig';
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
  /** For ramps: show the floating total only when the ramp finishes. */
  floatAtEnd?: boolean;
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
  const rampFrameRef = useRef<number | null>(null);
  // Consecutive real hammer hits (auto-hammer does not count). Resets on miss/reset.
  const hammerComboRef = useRef(0);

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

      const prev = countRef.current;
      const next = clampToScoreBounds(prev + delta, targetScoreRef.current);
      if (next !== prev) {
        const appliedDelta = next - prev;
        countRef.current = next;
        setCount(next);
        if (
          options?.showScoreFloat !== false &&
          (appliedDelta > 0 || options?.showPenaltyFloat !== false)
        ) {
          showScoreFloat(appliedDelta, options?.source ?? 'system', {
            sheepVariant: options?.sheepVariant,
          });
        }
        emitStats(next);
      }
      void shake(shakeIntensity, shakeDuration);
    },
    [emitStats, isAtTarget, shake, showScoreFloat],
  );

  // Applies `total` gradually, ticking the counter like a stopwatch over
  // `durationMs` instead of jumping in a single step. `total` may be negative
  // to deduct money over time.
  const rampDelta = useCallback(
    (
      total: number,
      durationMs: number,
      shakeIntensity: number,
      shakeDuration = 0.2,
      options?: ScoreDeltaOptions,
    ) => {
      if (total === 0) return;
      if (total > 0 && isAtTarget(countRef.current)) return;

      if (rampFrameRef.current !== null) {
        cancelAnimationFrame(rampFrameRef.current);
        rampFrameRef.current = null;
      }

      const start = countRef.current;
      const startTime = performance.now();
      let lastApplied = 0;

      const showFloat = () => {
        if (options?.showScoreFloat === false) return;
        showScoreFloat(total, options?.source ?? 'system', {
          sheepVariant: options?.sheepVariant,
        });
      };

      if (!options?.floatAtEnd) showFloat();
      void shake(shakeIntensity, shakeDuration);

      let lastCommitTime = startTime;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / durationMs);
        const applied = Math.round(total * progress);
        // Commit at most ~10×/s (plus the final frame) — updating the score
        // state every animation frame re-renders the whole game tree at 60fps
        // and visibly stutters the hammer/cursor.
        const shouldCommit =
          applied !== lastApplied &&
          (progress >= 1 || now - lastCommitTime >= 100);
        if (shouldCommit) {
          lastApplied = applied;
          lastCommitTime = now;
          const next = clampToScoreBounds(start + applied, targetScoreRef.current);
          if (next !== countRef.current) {
            countRef.current = next;
            setCount(next);
            emitStats(next);
          }
        }
        if (progress < 1) {
          rampFrameRef.current = requestAnimationFrame(step);
        } else {
          rampFrameRef.current = null;
          // Show the floating total only once the action has finished.
          if (options?.floatAtEnd) showFloat();
        }
      };

      rampFrameRef.current = requestAnimationFrame(step);
    },
    [emitStats, isAtTarget, shake, showScoreFloat],
  );

  const increment = useCallback((options?: { source?: ScoreFloatSource; showScoreFloat?: boolean; silent?: boolean }) => {
    if (isAtTarget(countRef.current)) return;

    const reward = hammerEstateRewardRef.current;
    const prev = countRef.current;
    const next = clampToScoreBounds(prev + reward, targetScoreRef.current);
    if (next !== prev) {
      countRef.current = next;
      setCount(next);
      if (options?.showScoreFloat !== false) {
        showScoreFloat(next - prev, options?.source ?? 'hammer');
      }
      emitStats(next);
    }

    // Combo bonus: only real hammer clicks count (auto-hammer is `silent` and
    // is ignored here, it neither builds nor breaks the streak). The streak
    // counter never resets on its own — every 20th hit pays a small combo,
    // every 100th hit (also a multiple of 20) pays the bigger mega-combo
    // instead. Shown as its own float, kept separate from the hit reward above.
    let comboBonus = 0;
    let comboSource: ScoreFloatSource | null = null;
    if (!options?.silent) {
      const streak = hammerComboRef.current + 1;
      hammerComboRef.current = streak;
      if (streak % HAMMER_MEGA_COMBO_HIT_TARGET === 0) {
        comboBonus = HAMMER_MEGA_COMBO_BONUS;
        comboSource = 'hammerMegaCombo';
      } else if (streak % HAMMER_COMBO_HIT_TARGET === 0) {
        comboBonus = HAMMER_COMBO_BONUS;
        comboSource = 'hammerCombo';
      }
    }

    if (comboSource && !isAtTarget(countRef.current)) {
      const comboPrev = countRef.current;
      const comboNext = clampToScoreBounds(comboPrev + comboBonus, targetScoreRef.current);
      if (comboNext !== comboPrev) {
        countRef.current = comboNext;
        setCount(comboNext);
        if (options?.showScoreFloat !== false) {
          showScoreFloat(comboNext - comboPrev, comboSource);
        }
        emitStats(comboNext);
      }
    }

    if (!isMuted) {
      audioManager.playAddCoin();
      if (comboSource) audioManager.playComboBonus(comboSource === 'hammerMegaCombo');
    }
    // `silent` mode (auto-earn) skips the swing feedback: no shake.
    if (options?.silent) return;
    void shake(comboSource === 'hammerMegaCombo' ? 14 : comboSource === 'hammerCombo' ? 9 : 5);
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
    const prev = countRef.current;
    const next = clampToScoreBounds(prev + reward, targetScoreRef.current);
    if (next !== prev) {
      countRef.current = next;
      setCount(next);
      showScoreFloat(next - prev, source, { sheepVariant: variant });
      emitStats(next);
    }
    const shakeIntensity =
      variant === 'gold' ? 11 : variant === 'pink' ? 9 : 8;
    void shake(shakeIntensity);
    if (!isMuted) audioManager.playPop(reward);
  }, [applyDelta, emitStats, isAtTarget, isMuted, shake, showScoreFloat]);

  const applyBirdBonus = useCallback((source: ScoreFloatSource = 'bird') => {
    if (isAtTarget(countRef.current)) return;

    const prev = countRef.current;
    const next = clampToScoreBounds(
      prev + BIRD_SHOOT_REWARD,
      targetScoreRef.current,
    );
    if (next !== prev) {
      countRef.current = next;
      setCount(next);
      showScoreFloat(next - prev, source);
      emitStats(next);
    }
    void shake(7);
    if (!isMuted) audioManager.playBirdHit();
  }, [emitStats, isAtTarget, isMuted, shake, showScoreFloat]);

  const applyMoleBonus = useCallback((source: ScoreFloatSource = 'mole') => {
    if (isAtTarget(countRef.current)) return;

    const prev = countRef.current;
    const next = clampToScoreBounds(prev + MOLE_REWARD, targetScoreRef.current);
    if (next !== prev) {
      countRef.current = next;
      setCount(next);
      showScoreFloat(next - prev, source);
      emitStats(next);
    }
    void shake(9);
    if (!isMuted) audioManager.playPop(MOLE_REWARD);
  }, [emitStats, isAtTarget, isMuted, shake, showScoreFloat]);

  const resetScore = useCallback(() => {
    setPenaltyFloats([]);
    countRef.current = 0;
    setCount(0);
    hammerComboRef.current = 0;
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
    rampDelta,
    resetScore,
    removePenaltyFloat,
    emitStats,
    showScoreFloat,
  };
}
