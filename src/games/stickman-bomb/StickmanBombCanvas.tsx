/**
 * Root canvas — combines hammer gameplay and key actions (keys 0–9).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAnimation } from 'motion/react';
import { audioManager } from '../../utils/audio';
import {
  HammerCursor,
  NumberDisplay,
  useGameplayScore,
  useEstateHitShake,
  gameLayerClasses,
  gameLayerStyle,
  gamePausedStyles,
  resetGameplayPauseClock,
  setGameplayPaused,
  type HammerImpactPayload,
  isClickInHitZone,
  isStrikeInHitZone,
  type WeaponMode,
  type CounterDisplayStyle,
  EstateScoreFloat,
  SeasonSessionBadge,
  BORROW_MONEY_LOAN,
  AUTO_HAMMER_INTERVAL_MS,
} from './gameplay';
import {
  BirdFlockLayer,
  BirdHitBurst,
  useBirdFlock,
} from './gameplay/birds';
import {
  SheepAimShoot,
  SheepHerd,
  SheepHitBurst,
  scopeViewStyles,
  useSheepHerd,
  SHEEP_WAVE_DURATION_MS,
} from './gameplay/sheep';
import {
  MoleField,
  MoleHitBurst,
  useMoleField,
  MOLE_WAVE_DURATION_MS,
} from './gameplay/moles';
import {
  MoneySpinnerLayer,
  HackerEffectLayer,
  AvatarCoinLayer,
  AvatarStrikeLayer,
  DiceRollLayer,
  VerticalLightningLayer,
  SoccerBallLayer,
  TrumpSpawnLayer,
  BombSequence,
  PlinkoLayer,
  BOW_PENALTY,
  CounterExplosion,
  ExplosionFlash,
  keyActions,
  randomAttackAngle,
  ActionSpawnQueueDock,
  pushActionSpawnQueue,
  resetActionSpawnQueue,
  shiftActionSpawnQueue,
  KEY_0_HACKER,
  KEY_1_BOMB,
  KEY_2_PLINKO,
  KEY_3_AVATAR_STRIKE,
  KEY_4_AVATAR_COIN,
  KEY_5_MONEY_SPINNER,
  KEY_6_DICE_ROLL,
  KEY_7_VERTICAL_LIGHTNING,
  KEY_8_SOCCER_BALL,
  KEY_9_TRUMP_SPAWN,
  KEY_P_PIG_BANK,
  KEY_O_BUTTERFLY,
  KEY_I_MISSILE,
  KEY_U_TOMATO,
  useMoneySpinner,
  useHackerEffect,
  useAvatarCoin,
  useAvatarStrike,
  usePlinko,
  useDiceRoll,
  type DiceLandPayload,
  type PlinkoLandPayload,
  useVerticalLightning,
  useSoccerBallKick,
  useTrumpSpawn,
  PigBankLayer,
  usePigBank,
  PIG_BANK_REWARD_RAMP_MS,
  ButterflyLayer,
  useButterfly,
  MissileStrikeLayer,
  useMissileStrike,
  TomatoLayer,
  useTomato,
  useKeyActions,
  getActionMoneyAmount,
  type AttackAngle,
  type KeyActionContext,
} from './actions';
import {
  type StickmanBombCanvasHandle,
  type StickmanBombCanvasProps,
} from './types';
import type { GameEffectId } from '../../networking/gameActionExecutor';
import { EstateDisplay } from './estate';
import { StaticStyle } from '../../components/StaticStyle';

/**
 * Game-screen shake while the key-P money downpour is on screen. Transform-only
 * keyframes (GPU-composited, no layout) on a short loop.
 */
const moneyRainShakeStyles = `
  .money-rain-shake {
    animation: money-rain-shake 0.32s steps(2, end) infinite;
    will-change: transform;
  }
  @keyframes money-rain-shake {
    0%   { transform: translate3d(0, 0, 0); }
    20%  { transform: translate3d(-7px, 4px, 0); }
    40%  { transform: translate3d(6px, -5px, 0); }
    60%  { transform: translate3d(-5px, -4px, 0); }
    80%  { transform: translate3d(7px, 5px, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }
`;

/** Sheep herd + mouse swarm auto-spawn: the two waves take turns appearing
 *  back-to-back, with this gap between one leaving and the next appearing. */
export const HERD_AUTO_SPAWN_GAP_MS = 3_000;

/**
 * Network effect id → action-queue key shown in the right-edge spawn dock.
 * Effects without an entry (birdFlock) spawn directly and never queue.
 */
const EFFECT_QUEUE_KEYS: Partial<Record<GameEffectId, string>> = {
  hack: KEY_0_HACKER,
  bomb: KEY_1_BOMB,
  plinko: KEY_2_PLINKO,
  grappleHeist: KEY_3_AVATAR_STRIKE,
  moneyTrain: KEY_4_AVATAR_COIN,
  moneySpinner: KEY_5_MONEY_SPINNER,
  diceRoll: KEY_6_DICE_ROLL,
  verticalLightning: KEY_7_VERTICAL_LIGHTNING,
  soccerBall: KEY_8_SOCCER_BALL,
  trumpSpawn: KEY_9_TRUMP_SPAWN,
  pigBank: KEY_P_PIG_BANK,
  goldNugget: KEY_O_BUTTERFLY,
  missile: KEY_I_MISSILE,
  tomato: KEY_U_TOMATO,
};

export const StickmanBombCanvas = forwardRef<StickmanBombCanvasHandle, StickmanBombCanvasProps>(
  (
    {
      timeOfDay,
      onStatsChange,
      onGameReset,
      isMuted,
      targetScore,
      previewEstateLevel = null,
      estateImageOverrides,
      actionMoneyOverrides,
      freezeSway = false,
      counterDisplayStyle = 'classic',
      showCounter = true,
      weaponMode = 'hammer' as WeaponMode,
      weaponSwitchKey = 'Tab',
      onWeaponModeChange,
      hammerEstateReward,
      autoHammer = false,
      autoHerdSpawn = false,
      herdAutoSpawnGapMs = HERD_AUTO_SPAWN_GAP_MS,
      avatarStrikeUrl,
      balancePanelRef,
      balanceDockRef,
    },
    ref,
  ) => {
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const cameraStageRef = useRef<HTMLDivElement>(null);
    // Latest editable per-action money overrides — read inside effect handlers
    // without re-binding their useCallbacks.
    const actionMoneyOverridesRef = useRef(actionMoneyOverrides);
    actionMoneyOverridesRef.current = actionMoneyOverrides;
    const attackIdRef = useRef(0);
    const [activeAttacks, setActiveAttacks] = useState<
      { id: number; angle: AttackAngle }[]
    >([]);
    const [explosionBurstId, setExplosionBurstId] = useState(0);
    const [moneyRainShake, setMoneyRainShake] = useState(false);
    const explosionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const explosionBurstSeqRef = useRef(0);
    const counterRef = useRef<HTMLDivElement>(null);
    const countRef = useRef(0);
    const plinkoPendingFloatRef = useRef<number | null>(null);
    const emptyBalancePanelRef = useRef<HTMLElement | null>(null);
    const emptyBalanceDockRef = useRef<HTMLElement | null>(null);
    const estateTargetRef = useRef<HTMLDivElement>(null);
    const counterControls = useAnimation();
    const { controls: estateHitControls, shake: shakeEstate } = useEstateHitShake();

    const {
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
    } = useGameplayScore({
      isMuted,
      onStatsChange,
      shake: shakeEstate,
      targetScore,
      freezeSway,
      hammerEstateReward,
    });

    const sheepActive = !freezeSway;
    const {
      phase: sheepPhase,
      waveId: sheepWaveId,
      waveDirection: sheepWaveDirection,
      bonusFloats: sheepBonusFloats,
      hitEffects: sheepHitEffects,
      registerSheepRef,
      tryHitSheep,
      removeBonusFloat,
      removeHitEffect,
      resetCycle: resetSheepCycle,
      triggerWave: triggerSheepWave,
    } = useSheepHerd(sheepActive, false);

    const molesActive = !freezeSway;
    const {
      phase: molePhase,
      spawns: moleSpawns,
      visibility: moleVisibility,
      bonusFloats: moleBonusFloats,
      hitEffects: moleHitEffects,
      registerMoleRef,
      tryHitMole,
      removeBonusFloat: removeMoleBonusFloat,
      removeHitEffect: removeMoleHitEffect,
      resetCycle: resetMoleCycle,
      triggerWave: triggerMoleWave,
    } = useMoleField(molesActive);

    const avatarStrikeActive = !freezeSway;
    const {
      activeStrikes: avatarActiveStrikes,
      triggerStrike: triggerAvatarStrike,
      completeStrike: completeAvatarStrike,
      resetCycle: resetAvatarStrikeCycle,
    } = useAvatarStrike(avatarStrikeActive);

    const handleAvatarStrike = useCallback(() => {
      triggerAvatarStrike();
      if (!isMuted) audioManager.playGrappleLaunch();
    }, [triggerAvatarStrike, isMuted]);

    const avatarCoinActive = !freezeSway;
    const {
      activeCoins: avatarActiveCoins,
      triggerCoinShower: triggerAvatarCoin,
      completeCoinShower: completeAvatarCoin,
      resetCycle: resetAvatarCoinCycle,
    } = useAvatarCoin(avatarCoinActive);

    const plinkoActive = !freezeSway;
    const {
      activeRounds: activePlinkoRounds,
      triggerPlinko,
      completePlinko,
      resetCycle: resetPlinkoCycle,
    } = usePlinko(plinkoActive);

    const handlePlinko = useCallback(() => {
      triggerPlinko();
      if (!isMuted) audioManager.playPlinkoSpawn();
    }, [triggerPlinko, isMuted]);

    const moneySpinnerActive = !freezeSway;
    const {
      activeSpins: moneySpinnerSpins,
      triggerMoneySpinner: triggerMoneySpinnerRaw,
      completeMoneySpinner,
      resetCycle: resetMoneySpinnerCycle,
    } = useMoneySpinner(moneySpinnerActive);

    const triggerMoneySpinner = useCallback(() => {
      triggerMoneySpinnerRaw();
      if (!isMuted) audioManager.playSpinnerStart();
    }, [triggerMoneySpinnerRaw, isMuted]);

    const handleMoneySpinnerComplete = useCallback(
      (spinId: number) => {
        completeMoneySpinner(spinId);
        audioManager.stopSpinnerStart();
      },
      [completeMoneySpinner],
    );

    const diceRollActive = !freezeSway;
    const {
      activeRolls: activeDiceRolls,
      triggerDiceRoll,
      completeDiceRoll,
      resetCycle: resetDiceRollCycle,
    } = useDiceRoll(diceRollActive);

    const verticalLightningActive = !freezeSway;
    const {
      activeStorms: activeVerticalLightningStorms,
      triggerVerticalLightning,
      completeVerticalLightning,
      resetCycle: resetVerticalLightningCycle,
    } = useVerticalLightning(verticalLightningActive);

    const soccerBallActive = !freezeSway;
    const {
      activeKicks: activeSoccerBallKicks,
      triggerSoccerBallKick,
      completeSoccerBallKick,
      resetCycle: resetSoccerBallCycle,
    } = useSoccerBallKick(soccerBallActive);

    const trumpSpawnActive = !freezeSway;
    const {
      activeSpawns: activeTrumpSpawns,
      triggerTrumpSpawn,
      completeTrumpSpawn,
      resetCycle: resetTrumpSpawnCycle,
    } = useTrumpSpawn(trumpSpawnActive);

    const pigBankActive = !freezeSway;
    const {
      activeSpawns: activePigBankSpawns,
      triggerPigBank,
      completePigBank,
      resetCycle: resetPigBankCycle,
    } = usePigBank(pigBankActive);

    const butterflyActive = !freezeSway;
    const {
      activeSpawns: activeButterflySpawns,
      triggerButterfly,
      completeButterfly,
      resetCycle: resetButterflyCycle,
    } = useButterfly(butterflyActive);

    const missileActive = !freezeSway;
    const {
      activeMissiles,
      triggerMissileStrike,
      completeMissileStrike,
      resetCycle: resetMissileCycle,
    } = useMissileStrike(missileActive);

    const tomatoActive = !freezeSway;
    const {
      activeSpawns: activeTomatoSpawns,
      triggerTomato,
      completeTomato,
      resetCycle: resetTomatoCycle,
    } = useTomato(tomatoActive);

    const {
      activeEffects: activeHackerEffects,
      triggerHackerEffect,
      completeHackerEffect,
      resetCycle: resetHackerEffectCycle,
    } = useHackerEffect(true);

    countRef.current = count;

    const handleTrumpSpawn = useCallback(() => {
      const accepted = triggerTrumpSpawn();
      if (accepted && !isMuted) audioManager.playTrumpSpawn();
      return accepted;
    }, [triggerTrumpSpawn, isMuted]);

    const handlePigBank = useCallback(() => {
      return triggerPigBank();
    }, [triggerPigBank]);

    // Fired by PigBankInstance right as a queued [P] press actually spawns on
    // screen (not when the key press was merely queued) — see PigBankInstance.
    const handlePigBankStart = useCallback(() => {
      if (!isMuted) audioManager.playSquidGame();
    }, [isMuted]);

    const handlePigBankComplete = useCallback(
      (id: number) => {
        audioManager.stopSquidGame();
        completePigBank(id);
      },
      [completePigBank],
    );

    const handleButterfly = useCallback(() => {
      return triggerButterfly();
    }, [triggerButterfly]);

    const handleTomato = useCallback(() => {
      const accepted = triggerTomato();
      if (accepted && !isMuted) audioManager.playWhoosh();
      return accepted;
    }, [triggerTomato, isMuted]);

    const handleHackerEffect = useCallback(() => {
      return triggerHackerEffect();
    }, [triggerHackerEffect]);

    const handleHackerEffectComplete = useCallback(
      (effectId: number) => {
        completeHackerEffect(effectId);
        showScoreFloat(getActionMoneyAmount('hack', actionMoneyOverridesRef.current), 'key-0');
      },
      [completeHackerEffect, showScoreFloat],
    );

    const getBalance = useCallback(() => countRef.current, []);

    const triggerHackerDrain = useCallback(
      (amount: number) => {
        // `amount` chunks are positive magnitudes; follow the configured sign so
        // a positive Hack setting adds and the default negative one drains.
        const hackAmount = getActionMoneyAmount('hack', actionMoneyOverridesRef.current);
        const direction = hackAmount < 0 ? -1 : 1;
        applyDelta(direction * amount, 5, 0.07, {
          source: 'key-0',
          showScoreFloat: false,
          showPenaltyFloat: false,
        });
      },
      [applyDelta],
    );

    const birdsActive = !freezeSway;
    const handleBirdPoopHit = useCallback(() => {
      applyDelta(getActionMoneyAmount('birdFlock', actionMoneyOverridesRef.current), 8, 0.35, {
        showPenaltyFloat: false,
        showScoreFloat: false,
      });
    }, [applyDelta]);

    const {
      phase: birdPhase,
      waveId: birdWaveId,
      fallingPoops: birdFallingPoops,
      splats: birdSplats,
      bonusFloats: birdBonusFloats,
      poopPenaltyFloats: birdPoopPenaltyFloats,
      hitEffects: birdHitEffects,
      registerBirdRef,
      tryHitBird,
      removeBonusFloat: removeBirdBonusFloat,
      removePoopPenaltyFloat: removeBirdPoopPenaltyFloat,
      removeHitEffect: removeBirdHitEffect,
      resetCycle: resetBirdCycle,
      triggerWave: triggerBirdWave,
    } = useBirdFlock({
      active: birdsActive,
      gameplayTargetRef: estateTargetRef,
      containerRef: gameAreaRef,
      onPoopHitCounter: handleBirdPoopHit,
    });

    const clearExplosionTimer = useCallback(() => {
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
        explosionTimerRef.current = null;
      }
    }, []);

    const triggerExplosion = useCallback(() => {
      applyDelta(getActionMoneyAmount('bomb', actionMoneyOverridesRef.current), 10, 0.5, {
        source: 'key-1',
      });
      const burstId = ++explosionBurstSeqRef.current;
      setExplosionBurstId(burstId);
      if (!isMuted) audioManager.playBomb();
      clearExplosionTimer();
      explosionTimerRef.current = setTimeout(() => {
        setExplosionBurstId(0);
        explosionTimerRef.current = null;
      }, 1000);
    }, [applyDelta, clearExplosionTimer, isMuted]);

    const startBombing = useCallback(() => {
      shiftActionSpawnQueue();
      const id = ++attackIdRef.current;
      setActiveAttacks((prev) => [...prev, { id, angle: randomAttackAngle() }]);
    }, []);

    const finishBombing = useCallback((id: number) => {
      setActiveAttacks((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const triggerPlinkoLand = useCallback(
      (payload: PlinkoLandPayload) => {
        const { reward } = payload;
        plinkoPendingFloatRef.current = reward > 0 ? reward : null;
        const shakeIntensity = Math.min(36, 10 + Math.log10(reward + 1) * 7);
        applyDelta(reward, shakeIntensity, 0.4, {
          source: 'key-2',
          showScoreFloat: false,
        });
        if (!isMuted) {
          audioManager.playPlinkoCheer();
        }
      },
      [applyDelta, isMuted],
    );

    const handlePlinkoComplete = useCallback(
      (roundId: number) => {
        completePlinko(roundId);
        audioManager.stopPlinkoSpawn();
        const pending = plinkoPendingFloatRef.current;
        plinkoPendingFloatRef.current = null;
        if (pending != null && pending > 0) {
          showScoreFloat(pending, 'key-2');
        }
      },
      [completePlinko, showScoreFloat],
    );

    // Key [3] grappling hook hauled a $100 cash bundle out of the house.
    const triggerAvatarArrowHit = useCallback(() => {
      applyDelta(getActionMoneyAmount('grapple', actionMoneyOverridesRef.current), 12, 0.4, {
        source: 'key-3',
      });
      if (!isMuted) audioManager.playWrongSound();
    }, [applyDelta, isMuted]);

    const triggerAvatarCoinHit = useCallback(() => {
      applyDelta(getActionMoneyAmount('moneyTrain', actionMoneyOverridesRef.current), 5, 0.2, {
        source: 'key-4',
        showScoreFloat: false,
      });
    }, [applyDelta]);

    const triggerAvatarCoinShowerStart = useCallback(() => {
      if (!isMuted) audioManager.playTrainSound();
    }, [isMuted]);

    // Key [5] money spinner settled — credit (or dock) the landed tier.
    const triggerMoneySpinnerWin = useCallback(
      (amount: number) => {
        const shakeIntensity = Math.min(28, 8 + Math.log10(Math.abs(amount) + 1) * 6);
        applyDelta(amount, shakeIntensity, 0.35, { source: 'key-5' });
        if (!isMuted) {
          if (amount < 0) audioManager.playWrongSound();
          else audioManager.playGetCoin();
        }
      },
      [applyDelta, isMuted],
    );

    const triggerDiceLand = useCallback(
      (payload: DiceLandPayload) => {
        const { reward } = payload;
        const shakeIntensity = Math.min(32, 9 + Math.log10(reward + 1) * 6.5);
        applyDelta(reward, shakeIntensity, 0.4, { source: 'key-6' });
        if (!isMuted) {
          if (reward >= 250) audioManager.playBuildChime();
          else audioManager.playPop(24 + Math.min(reward, 140));
        }
      },
      [applyDelta, isMuted],
    );

    const triggerVerticalLightningStrike = useCallback(() => {
      applyDelta(-BOW_PENALTY, 7, 0.28, { source: 'key-7' });
      if (!isMuted) audioManager.playThunder();
    }, [applyDelta, isMuted]);

    const triggerSoccerBallHit = useCallback(() => {
      applyDelta(getActionMoneyAmount('knife', actionMoneyOverridesRef.current), 8, 0.32, {
        source: 'key-8',
      });
    }, [applyDelta]);

    const triggerTrumpReward = useCallback(() => {
      applyDelta(getActionMoneyAmount('trump', actionMoneyOverridesRef.current), 18, 0.58, {
        source: 'key-9',
      });
      if (!isMuted) audioManager.playTrumpFanfare();
    }, [applyDelta, isMuted]);

    // When the money-rain effect starts (a while after [P] is pressed), begin
    // adding money gradually, stopwatch-style, over the rain window.
    const handlePigBankRainChange = useCallback(
      (active: boolean) => {
        setMoneyRainShake(active);
        if (!active) return;
        rampDelta(
          getActionMoneyAmount('pigBank', actionMoneyOverridesRef.current),
          PIG_BANK_REWARD_RAMP_MS,
          14,
          0.48,
          {
            source: 'key-p',
            floatAtEnd: true,
          },
        );
        if (!isMuted) audioManager.playBuildChime();
      },
      [rampDelta, isMuted],
    );

    const triggerButterflyReward = useCallback(() => {
      applyDelta(getActionMoneyAmount('goldNugget', actionMoneyOverridesRef.current), 7, 0.28, {
        source: 'key-11',
      });
      if (!isMuted) audioManager.playGetCoin();
    }, [applyDelta, isMuted]);

    const triggerMissileImpact = useCallback(() => {
      applyDelta(getActionMoneyAmount('missile', actionMoneyOverridesRef.current), 16, 0.55, {
        source: 'key-i',
      });
      if (!isMuted) audioManager.playExplosion();
    }, [applyDelta, isMuted]);

    const triggerTomatoReward = useCallback(() => {
      applyDelta(getActionMoneyAmount('tomato', actionMoneyOverridesRef.current), 10, 0.32, {
        source: 'key-u',
      });
      if (!isMuted) audioManager.playSplat();
    }, [applyDelta, isMuted]);

    // Clears every in-flight action effect (birds, sheep, moles, projectiles, …)
    // without touching score — used both by a full reset and by "game over"
    // (defeat) so nothing keeps animating/spawning behind the modal.
    const clearActiveEffects = useCallback(() => {
      clearExplosionTimer();
      setActiveAttacks([]);
      setExplosionBurstId(0);
      resetGameplayPauseClock();
      resetSheepCycle();
      resetBirdCycle();
      resetMoleCycle();
      resetAvatarStrikeCycle();
      resetAvatarCoinCycle();
      resetPlinkoCycle();
      plinkoPendingFloatRef.current = null;
      audioManager.stopPlinkoSpawn();
      resetMoneySpinnerCycle();
      audioManager.stopSpinnerStart();
      resetDiceRollCycle();
      resetVerticalLightningCycle();
      resetSoccerBallCycle();
      resetTrumpSpawnCycle();
      resetPigBankCycle();
      resetButterflyCycle();
      resetMissileCycle();
      resetTomatoCycle();
      resetHackerEffectCycle();
      resetActionSpawnQueue();
    }, [
      clearExplosionTimer,
      resetMoneySpinnerCycle,
      resetDiceRollCycle,
      resetVerticalLightningCycle,
      resetSoccerBallCycle,
      resetTrumpSpawnCycle,
      resetPigBankCycle,
      resetButterflyCycle,
      resetMissileCycle,
      resetTomatoCycle,
      resetHackerEffectCycle,
      resetAvatarCoinCycle,
      resetPlinkoCycle,
      resetAvatarStrikeCycle,
      resetBirdCycle,
      resetMoleCycle,
      resetSheepCycle,
    ]);

    const resetGame = useCallback(() => {
      clearActiveEffects();
      resetScore();
      onGameReset();
    }, [clearActiveEffects, onGameReset, resetScore]);

    const handleHammerImpact = useCallback(
      ({
        impactX,
        impactY,
        pivotX,
        pivotY,
        clickX,
        clickY,
      }: HammerImpactPayload) => {
        const container = gameAreaRef.current;
        const estate = estateTargetRef.current;
        if (!container || !estate) return;

        const hitEstate =
          isStrikeInHitZone(
            impactX,
            impactY,
            pivotX,
            pivotY,
            estate,
            container,
          ) ||
          isClickInHitZone(clickX, clickY, estate, container);

        if (tryHitMole(container, impactX, impactY)) {
          applyMoleBonus('mole');
          return;
        }

        if (hitEstate) increment({ source: 'hammer' });
      },
      [applyMoleBonus, increment, tryHitMole],
    );

    // Auto-earn: while enabled (and the game is running) money accrues on a
    // fixed cadence — no hammer swing, no shake, but the coin sound still plays.
    useEffect(() => {
      if (!autoHammer || freezeSway) return;
      const timer = setInterval(() => {
        increment({ source: 'hammer', silent: true });
      }, AUTO_HAMMER_INTERVAL_MS);
      return () => clearInterval(timer);
    }, [autoHammer, freezeSway, increment]);

    // Auto-spawn: the sheep herd and the mouse swarm take turns appearing
    // back-to-back — sheep, then mouse, then sheep again. Each wave plays out
    // its full on-screen lifetime, then after the configured gap the other wave
    // appears, so the two are never visible at the same time. The gap comes from
    // the settings panel; the effect re-arms whenever it changes. (Birds are
    // unaffected — they only spawn on demand via key [W] / actionId 18.)
    useEffect(() => {
      if (!autoHerdSpawn || freezeSway) return;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let nextIsSheep = true;

      const runWave = () => {
        const durationMs = nextIsSheep ? SHEEP_WAVE_DURATION_MS : MOLE_WAVE_DURATION_MS;
        (nextIsSheep ? triggerSheepWave : triggerMoleWave)();
        nextIsSheep = !nextIsSheep;
        timer = setTimeout(runWave, durationMs + herdAutoSpawnGapMs);
      };

      // Wait one gap before the first wave so editing the value in the settings
      // panel doesn't spawn a wave on every keystroke.
      timer = setTimeout(runWave, herdAutoSpawnGapMs);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [
      autoHerdSpawn,
      freezeSway,
      herdAutoSpawnGapMs,
      triggerMoleWave,
      triggerSheepWave,
    ]);

    const handleGunShot = useCallback(
      (aimX: number, aimY: number) => {
        const container = gameAreaRef.current;
        if (!container) return;

        if (!isMuted) audioManager.playGunShot();

        if (tryHitBird(container, aimX, aimY)) {
          applyBirdBonus('gun');
          return;
        }

        const sheepHit = tryHitSheep(container, aimX, aimY);
        if (sheepHit) {
          applySheepHit(sheepHit, 'gun');
          return;
        }

        if (tryHitMole(container, aimX, aimY)) {
          applyMoleBonus('mole');
        }
      },
      [
        applyBirdBonus,
        applyMoleBonus,
        applySheepHit,
        isMuted,
        tryHitBird,
        tryHitMole,
        tryHitSheep,
      ],
    );

    const isGunMode = weaponMode === 'gun';

    useEffect(() => {
      if (freezeSway || !onWeaponModeChange) return;

      const onKeyDown = (event: KeyboardEvent) => {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) {
          return;
        }

        if (event.code !== weaponSwitchKey) return;
        event.preventDefault();
        onWeaponModeChange(isGunMode ? 'hammer' : 'gun');
        if (!isMuted) audioManager.playPop();
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [freezeSway, isGunMode, isMuted, onWeaponModeChange, weaponSwitchKey]);

    // Keyboard wave spawns for manual testing: Q = sheep, W = bird, E = mole.
    // These run alongside the WSS-driven triggerActionEffect path below.
    useEffect(() => {
      if (freezeSway) return;

      const onKeyDown = (event: KeyboardEvent) => {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) {
          return;
        }

        if (event.code === 'KeyQ') {
          event.preventDefault();
          triggerSheepWave();
          return;
        }

        if (event.code === 'KeyW') {
          event.preventDefault();
          triggerBirdWave();
          return;
        }

        if (event.code === 'KeyE') {
          event.preventDefault();
          triggerMoleWave();
          return;
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [freezeSway, triggerBirdWave, triggerMoleWave, triggerSheepWave]);

    const keyActionContext = useMemo<KeyActionContext>(
      () => ({
        triggerHackerEffect: handleHackerEffect,
        startBombing,
        triggerPlinko: handlePlinko,
        triggerAvatarStrike: handleAvatarStrike,
        triggerAvatarCoin,
        triggerMoneySpinner,
        triggerDiceRoll,
        triggerVerticalLightning,
        triggerSoccerBallKick,
        triggerTrumpSpawn: handleTrumpSpawn,
        triggerPigBank: handlePigBank,
        triggerButterfly: handleButterfly,
        triggerMissileStrike,
        triggerTomato: handleTomato,
        paused: freezeSway,
        hackerEffectRunning: activeHackerEffects.length > 0,
        plinkoRunning: activePlinkoRounds.length > 0,
      }),
      [
        handleHackerEffect,
        startBombing,
        handlePlinko,
        triggerMoneySpinner,
        triggerAvatarCoin,
        handleAvatarStrike,
        triggerDiceRoll,
        triggerVerticalLightning,
        triggerSoccerBallKick,
        handleTrumpSpawn,
        handlePigBank,
        handleButterfly,
        triggerMissileStrike,
        handleTomato,
        freezeSway,
        activeHackerEffects.length,
        activePlinkoRounds.length,
      ],
    );

    // Numeric/letter keys (0-9, P, O, i, U) spawn game actions directly for
    // manual testing, in addition to the WSS-driven triggerActionEffect path.
    useKeyActions(keyActions, keyActionContext);

    useEffect(() => {
      setGameplayPaused(freezeSway);
    }, [freezeSway]);

    const triggerBorrowMoney = useCallback(() => {
      applyDelta(BORROW_MONEY_LOAN, 8, 0.25, {
        source: 'auto',
      });
      if (!isMuted) audioManager.playPop(60);
      return true;
    }, [applyDelta, isMuted]);

    // Network actions (game_execute_action) → the same triggers as the keyboard
    // effects, dispatched by stable id (see ACTION_REGISTRY in gameActionExecutor).
    // Every queued effect is pushed to the visual spawn-queue store first; the
    // per-action useQueuedSpawner then shifts it when the spawn starts (or pops
    // it if the enqueue is rejected), so the right-edge dock mirrors the backlog.
    const triggerActionEffect = useCallback(
      (effectId: GameEffectId) => {
        const queueKey = EFFECT_QUEUE_KEYS[effectId];
        if (queueKey) pushActionSpawnQueue(queueKey);
        switch (effectId) {
          case 'hack': return void handleHackerEffect();
          case 'bomb': return void startBombing();
          case 'plinko': return void handlePlinko();
          case 'grappleHeist': return void handleAvatarStrike();
          case 'moneyTrain': return void triggerAvatarCoin();
          case 'moneySpinner': return void triggerMoneySpinner();
          case 'diceRoll': return void triggerDiceRoll();
          case 'verticalLightning': return void triggerVerticalLightning();
          case 'soccerBall': return void triggerSoccerBallKick();
          case 'trumpSpawn': return void handleTrumpSpawn();
          case 'pigBank': return void handlePigBank();
          case 'goldNugget': return void handleButterfly();
          case 'missile': return void triggerMissileStrike();
          case 'tomato': return void handleTomato();
          case 'birdFlock': return void triggerBirdWave();
          default: return;
        }
      },
      [
        handleHackerEffect,
        startBombing,
        handlePlinko,
        handleAvatarStrike,
        triggerAvatarCoin,
        triggerMoneySpinner,
        triggerDiceRoll,
        triggerVerticalLightning,
        triggerSoccerBallKick,
        handleTrumpSpawn,
        handlePigBank,
        handleButterfly,
        triggerMissileStrike,
        handleTomato,
        triggerBirdWave,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        placeBlock: increment,
        resetGame,
        clearActiveEffects,
        destroyTopBoxes: (n: number) => {
          const amount = Math.max(1, Math.floor(n));
          applyDelta(-amount, Math.min(20, 3 + amount * 0.5), 0.2, {
            source: 'system',
          });
          if (!isMuted) audioManager.playLose();
        },
        autoBuildBoxes: (n: number) => {
          const amount = Math.max(1, Math.floor(n));
          applyDelta(amount, 5, 0.2, { source: 'auto' });
          if (!isMuted) audioManager.playPop(amount);
        },
        triggerAutoBuild50: () => {
          applyDelta(50, 8, 0.2, { source: 'auto' });
          if (!isMuted) audioManager.playPop(80);
        },
        triggerMoleWave: () => triggerMoleWave(),
        triggerBirdWave: () => triggerBirdWave(),
        triggerActionEffect,
        triggerBorrowMoney,
        deductBalance: (amount: number) => {
          if (countRef.current < amount) return false;
          applyDelta(-amount, 8, 0.3, { source: 'market' });
          return true;
        },
      }),
      [
        applyDelta,
        clearActiveEffects,
        increment,
        isMuted,
        resetGame,
        triggerActionEffect,
        triggerBirdWave,
        triggerBorrowMoney,
        triggerMoleWave,
      ],
    );

    useEffect(() => {
      emitStats(0);
      return () => clearExplosionTimer();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearExplosionTimer]);

    const timeOverlayClass =
      timeOfDay === 'night'
        ? 'bg-indigo-950/10 mix-blend-multiply'
        : timeOfDay === 'sunset'
          ? 'bg-orange-500/10 mix-blend-color-burn'
          : 'bg-transparent';

    return (
      <div
        ref={gameAreaRef}
        className={`absolute inset-0 w-full h-full bg-transparent font-sans cursor-none isolate ${isGunMode ? 'gun-scope-stage' : 'overflow-visible'
          }${freezeSway ? ' game-paused' : ''}${moneyRainShake ? ' money-rain-shake' : ''
          }`}
      >
        {isGunMode && <StaticStyle css={scopeViewStyles} />}
        <StaticStyle css={gamePausedStyles} />
        <StaticStyle css={moneyRainShakeStyles} />

        <div
          ref={cameraStageRef}
          className="trump-camera-stage"
          style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
        >
          {/* World — sheep, ambient (below counter) */}
          <div
            className={`${gameLayerClasses.world} ${isGunMode ? 'scope-content-layer' : ''
              }`}
            style={gameLayerStyle('world')}
          >
            <div
              className={`absolute inset-0 pointer-events-none ${timeOverlayClass}`}
              aria-hidden
            />

            {sheepPhase === 'crossing' && (
              <SheepHerd
                waveId={sheepWaveId}
                direction={sheepWaveDirection}
                registerSheepRef={registerSheepRef}
              />
            )}

            <div className="absolute bottom-0 w-full h-32 bg-linear-to-t from-green-900/15 to-transparent pointer-events-none" />
          </div>

          {/* Scope overlay — below counter so money stays bright */}
          {isGunMode && (
            <div className={gameLayerClasses.scope} style={gameLayerStyle('scope')}>
              <SheepAimShoot
                containerRef={gameAreaRef}
                enabled={!freezeSway}
                canShootSheep={isGunMode}
                onFire={handleGunShot}
              />
            </div>
          )}

          {/* Score (left) + estate target (center) */}
          <div className={gameLayerClasses.counter} style={gameLayerStyle('counter')}>
            {showCounter && (
              <NumberDisplay
                score={count}
                counterTokens={counterTokens}
                controls={counterControls}
                freezeSway={freezeSway}
                displayStyle={counterDisplayStyle as CounterDisplayStyle}
                displayRef={counterRef}
                sheepBonusFloats={sheepBonusFloats}
                onSheepBonusFloatDone={removeBonusFloat}
                birdBonusFloats={birdBonusFloats}
                onBirdBonusFloatDone={removeBirdBonusFloat}
                moleBonusFloats={moleBonusFloats}
                onMoleBonusFloatDone={removeMoleBonusFloat}
              />
            )}
            <EstateDisplay
              score={count}
              targetScore={targetScore}
              previewEstateLevel={previewEstateLevel}
              estateImageOverrides={estateImageOverrides}
              freezeSway={freezeSway}
              targetRef={estateTargetRef}
              hitControls={estateHitControls}
              explosionOverlay={<CounterExplosion burstId={explosionBurstId} />}
            />
          </div>

          {/* Gameplay — hammer, stickman attacks (above counter) */}
          <div className={gameLayerClasses.gameplay} style={gameLayerStyle('gameplay')}>
            {molePhase === 'active' && (
              <MoleField
                spawns={moleSpawns}
                visibility={moleVisibility}
                registerMoleRef={registerMoleRef}
              />
            )}

            {birdPhase === 'crossing' && (
              <BirdFlockLayer
                waveId={birdWaveId}
                fallingPoops={birdFallingPoops}
                splats={birdSplats}
                poopPenaltyFloats={birdPoopPenaltyFloats}
                onPoopPenaltyFloatDone={removeBirdPoopPenaltyFloat}
                registerBirdRef={registerBirdRef}
              />
            )}

            <HammerCursor
              containerRef={gameAreaRef}
              onHammerImpact={handleHammerImpact}
              enabled={!freezeSway && !isGunMode}
              visible
            />

            {birdHitEffects.map((effect) => (
              <BirdHitBurst
                key={`bird-hit-${effect.id}`}
                x={effect.x}
                y={effect.y}
                onComplete={() => removeBirdHitEffect(effect.id)}
              />
            ))}

            {sheepHitEffects.map((effect) => (
              <SheepHitBurst
                key={`sheep-hit-${effect.id}`}
                x={effect.x}
                y={effect.y}
                variant={effect.variant}
                onComplete={() => removeHitEffect(effect.id)}
              />
            ))}

            {moleHitEffects.map((effect) => (
              <MoleHitBurst
                key={`mole-hit-${effect.id}`}
                x={effect.x}
                y={effect.y}
                onComplete={() => removeMoleHitEffect(effect.id)}
              />
            ))}

            {activeAttacks.map((attack) => (
              <BombSequence
                key={attack.id}
                angle={attack.angle}
                gameplayTargetRef={estateTargetRef}
                onExplode={triggerExplosion}
                onComplete={() => finishBombing(attack.id)}
              />
            ))}

            <PlinkoLayer
              rounds={activePlinkoRounds}
              onLand={triggerPlinkoLand}
              onComplete={handlePlinkoComplete}
            />

            <AvatarStrikeLayer
              strikes={avatarActiveStrikes}
              avatarUrl={avatarStrikeUrl}
              gameplayTargetRef={estateTargetRef}
              onArrowHit={triggerAvatarArrowHit}
              onComplete={completeAvatarStrike}
            />

            <AvatarCoinLayer
              showers={avatarActiveCoins}
              gameplayTargetRef={estateTargetRef}
              onCoinHit={triggerAvatarCoinHit}
              onShowerStart={triggerAvatarCoinShowerStart}
              onComplete={completeAvatarCoin}
            />

            <DiceRollLayer
              rolls={activeDiceRolls}
              gameplayTargetRef={estateTargetRef}
              onLand={triggerDiceLand}
              onComplete={completeDiceRoll}
            />

            <VerticalLightningLayer
              storms={activeVerticalLightningStorms}
              gameplayTargetRef={estateTargetRef}
              onLightningStrike={triggerVerticalLightningStrike}
              onComplete={completeVerticalLightning}
            />

            <SoccerBallLayer
              kicks={activeSoccerBallKicks}
              gameplayTargetRef={estateTargetRef}
              onEstateHit={triggerSoccerBallHit}
              onComplete={completeSoccerBallKick}
            />

            <ExplosionFlash burstId={explosionBurstId} />

            {penaltyFloats.map((f) => (
              <EstateScoreFloat
                key={f.id}
                delta={f.delta}
                source={f.source}
                sheepVariant={f.sheepVariant}
                gameAreaRef={gameAreaRef}
                estateTargetRef={estateTargetRef}
                onComplete={() => removePenaltyFloat(f.id)}
              />
            ))}
          </div>
        </div>

        <TrumpSpawnLayer
          spawns={activeTrumpSpawns}
          cameraStageRef={cameraStageRef}
          clipRootRef={gameAreaRef}
          gameplayTargetRef={estateTargetRef}
          onReward={triggerTrumpReward}
          onComplete={completeTrumpSpawn}
        />

        <PigBankLayer
          spawns={activePigBankSpawns}
          onStart={handlePigBankStart}
          onReward={() => {}}
          onRainChange={handlePigBankRainChange}
          onComplete={handlePigBankComplete}
        />

        <ButterflyLayer
          spawns={activeButterflySpawns}
          gameplayTargetRef={estateTargetRef}
          onReward={triggerButterflyReward}
          onComplete={completeButterfly}
        />

        <MissileStrikeLayer
          missiles={activeMissiles}
          gameplayTargetRef={estateTargetRef}
          onEstateHit={triggerMissileImpact}
          onComplete={completeMissileStrike}
        />

        <TomatoLayer
          spawns={activeTomatoSpawns}
          gameplayTargetRef={estateTargetRef}
          onImpact={triggerTomatoReward}
          onComplete={completeTomato}
        />

        <HackerEffectLayer
          effects={activeHackerEffects}
          layerHostRef={gameAreaRef}
          clipRootRef={gameAreaRef}
          cameraStageRef={cameraStageRef}
          estateTargetRef={estateTargetRef}
          balancePanelRef={balancePanelRef ?? emptyBalancePanelRef}
          balanceDockRef={balanceDockRef ?? emptyBalanceDockRef}
          getBalance={getBalance}
          drainTotal={Math.abs(getActionMoneyAmount('hack', actionMoneyOverrides))}
          onDrain={triggerHackerDrain}
          onComplete={handleHackerEffectComplete}
        />

        <MoneySpinnerLayer
          spins={moneySpinnerSpins}
          onWin={triggerMoneySpinnerWin}
          onComplete={handleMoneySpinnerComplete}
        />

        <SeasonSessionBadge
          birdPhase={birdPhase}
          sheepPhase={sheepPhase}
          molePhase={molePhase}
          hidden={freezeSway}
        />

        <ActionSpawnQueueDock avatarUrl={avatarStrikeUrl} hidden={freezeSway} />
      </div>
    );
  },
);

StickmanBombCanvas.displayName = 'StickmanBombCanvas';
