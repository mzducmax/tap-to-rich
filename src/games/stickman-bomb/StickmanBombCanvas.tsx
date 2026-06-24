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
} from './gameplay';
import {
  BirdFlockLayer,
  BirdHitBurst,
  BIRD_POOP_PENALTY,
  useBirdFlock,
} from './gameplay/birds';
import {
  SheepAimShoot,
  SheepHerd,
  SheepHitBurst,
  scopeViewStyles,
  useSheepHerd,
} from './gameplay/sheep';
import {
  MoleField,
  MoleHitBurst,
  useMoleField,
} from './gameplay/moles';
import {
  DivineCrossbowLayer,
  HackerEffectLayer,
  AvatarCoinLayer,
  AvatarStrikeLayer,
  DiceRollLayer,
  VerticalLightningLayer,
  SoccerBallLayer,
  TrumpSpawnLayer,
  AVATAR_COIN_REWARD,
  TRUMP_SPAWN_REWARD,
  BombSequence,
  PlinkoLayer,
  BOW_PENALTY,
  SOCCER_BALL_PENALTY,
  CounterExplosion,
  ExplosionFlash,
  keyActions,
  randomAttackAngle,
  ActionSpawnQueueDock,
  resetActionSpawnQueue,
  shiftActionSpawnQueue,
  useDivineCrossbow,
  useHackerEffect,
  HACKER_PENALTY,
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
  PIG_BANK_REWARD,
  ButterflyLayer,
  useButterfly,
  BUTTERFLY_REWARD,
  useKeyActions,
  type AttackAngle,
  type KeyActionContext,
} from './actions';
import {
  CHEST_REWARD,
  type StickmanBombCanvasHandle,
  type StickmanBombCanvasProps,
} from './types';
import { EstateDisplay } from './estate';

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
      freezeSway = false,
      counterDisplayStyle = 'stick',
      showCounter = true,
      weaponMode = 'hammer' as WeaponMode,
      weaponSwitchKey = 'Tab',
      onWeaponModeChange,
      hammerEstateReward,
      avatarStrikeUrl,
      balancePanelRef,
      balanceDockRef,
    },
    ref,
  ) => {
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const cameraStageRef = useRef<HTMLDivElement>(null);
    const attackIdRef = useRef(0);
    const [activeAttacks, setActiveAttacks] = useState<
      { id: number; angle: AttackAngle }[]
    >([]);
    const [explosionBurstId, setExplosionBurstId] = useState(0);
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
    } = useSheepHerd(sheepActive);

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

    const divineCrossbowActive = !freezeSway;
    const {
      activeSessions: divineCrossbowSessions,
      triggerDivineCrossbow,
      completeDivineCrossbow,
      resetCycle: resetDivineCrossbowCycle,
    } = useDivineCrossbow(divineCrossbowActive);

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

    const handleButterfly = useCallback(() => {
      return triggerButterfly();
    }, [triggerButterfly]);

    const handleHackerEffect = useCallback(() => {
      return triggerHackerEffect();
    }, [triggerHackerEffect]);

    const handleHackerEffectComplete = useCallback(
      (effectId: number) => {
        completeHackerEffect(effectId);
        showScoreFloat(-HACKER_PENALTY, 'key-0');
      },
      [completeHackerEffect, showScoreFloat],
    );

    const getBalance = useCallback(() => countRef.current, []);

    const triggerHackerDrain = useCallback(
      (amount: number) => {
        applyDelta(-amount, 5, 0.07, {
          source: 'key-0',
          showScoreFloat: false,
          showPenaltyFloat: false,
        });
      },
      [applyDelta],
    );

    const birdsActive = !freezeSway;
    const handleBirdPoopHit = useCallback(() => {
      applyDelta(-BIRD_POOP_PENALTY, 8, 0.35, {
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
      applyDelta(CHEST_REWARD, 10, 0.5, { source: 'key-1' });
      const burstId = ++explosionBurstSeqRef.current;
      setExplosionBurstId(burstId);
      if (!isMuted) audioManager.playBuildChime();
      clearExplosionTimer();
      explosionTimerRef.current = setTimeout(() => {
        setExplosionBurstId(0);
        explosionTimerRef.current = null;
      }, 800);
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
          if (reward >= 500) audioManager.playBuildChime();
          else audioManager.playPop(18 + Math.min(reward, 120));
        }
      },
      [applyDelta, isMuted],
    );

    const handlePlinkoComplete = useCallback(
      (roundId: number) => {
        completePlinko(roundId);
        const pending = plinkoPendingFloatRef.current;
        plinkoPendingFloatRef.current = null;
        if (pending != null && pending > 0) {
          showScoreFloat(pending, 'key-2');
        }
      },
      [completePlinko, showScoreFloat],
    );

    const triggerAvatarArrowHit = useCallback(() => {
      applyDelta(-BOW_PENALTY, 6, 0.25, { source: 'key-3' });
      if (!isMuted) audioManager.playGunShot();
    }, [applyDelta, isMuted]);

    const triggerAvatarCoinHit = useCallback(() => {
      applyDelta(AVATAR_COIN_REWARD, 5, 0.2, { source: 'key-4', showScoreFloat: false });
    }, [applyDelta]);

    const triggerAvatarCoinShowerStart = useCallback(() => {
      if (!isMuted) audioManager.playTrainSound();
    }, [isMuted]);

    const triggerDivineCrossbowHit = useCallback(() => {
      applyDelta(-BOW_PENALTY, 6, 0.25, { source: 'key-5' });
      if (!isMuted) audioManager.playGunShot();
    }, [applyDelta, isMuted]);

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
      applyDelta(-SOCCER_BALL_PENALTY, 8, 0.32, { source: 'key-8' });
      if (!isMuted) audioManager.playGunShot();
    }, [applyDelta, isMuted]);

    const triggerTrumpReward = useCallback(() => {
      applyDelta(TRUMP_SPAWN_REWARD, 18, 0.58, { source: 'key-9' });
      if (!isMuted) audioManager.playTrumpFanfare();
    }, [applyDelta, isMuted]);

    const triggerPigBankReward = useCallback(() => {
      applyDelta(PIG_BANK_REWARD, 14, 0.48, { source: 'key-p' });
      if (!isMuted) audioManager.playBuildChime();
    }, [applyDelta, isMuted]);

    const triggerButterflyReward = useCallback(() => {
      applyDelta(BUTTERFLY_REWARD, 7, 0.28, { source: 'key-11' });
      if (!isMuted) audioManager.playBuildChime();
    }, [applyDelta, isMuted]);

    const resetGame = useCallback(() => {
      clearExplosionTimer();
      setActiveAttacks([]);
      setExplosionBurstId(0);
      resetGameplayPauseClock();
      resetScore();
      resetSheepCycle();
      resetBirdCycle();
      resetMoleCycle();
      resetAvatarStrikeCycle();
      resetAvatarCoinCycle();
      resetPlinkoCycle();
      plinkoPendingFloatRef.current = null;
      resetDivineCrossbowCycle();
      resetDiceRollCycle();
      resetVerticalLightningCycle();
      resetSoccerBallCycle();
      resetTrumpSpawnCycle();
      resetPigBankCycle();
      resetButterflyCycle();
      resetHackerEffectCycle();
      resetActionSpawnQueue();
      onGameReset();
    }, [
      clearExplosionTimer,
      onGameReset,
      resetDivineCrossbowCycle,
      resetDiceRollCycle,
      resetVerticalLightningCycle,
      resetSoccerBallCycle,
      resetTrumpSpawnCycle,
      resetPigBankCycle,
      resetButterflyCycle,
      resetHackerEffectCycle,
      resetAvatarCoinCycle,
      resetPlinkoCycle,
      resetAvatarStrikeCycle,
      resetBirdCycle,
      resetMoleCycle,
      resetScore,
      resetSheepCycle,
    ]);

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

        if (molePhase === 'active') return;

        if (hitEstate) increment({ source: 'hammer' });
      },
      [applyMoleBonus, increment, molePhase, tryHitMole],
    );

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
        triggerPlinko,
        triggerAvatarStrike,
        triggerAvatarCoin,
        triggerDivineCrossbow,
        triggerDiceRoll,
        triggerVerticalLightning,
        triggerSoccerBallKick,
        triggerTrumpSpawn: handleTrumpSpawn,
        triggerPigBank: handlePigBank,
        triggerButterfly: handleButterfly,
        paused: freezeSway,
        hackerEffectRunning: activeHackerEffects.length > 0,
        plinkoRunning: activePlinkoRounds.length > 0,
      }),
      [
        handleHackerEffect,
        startBombing,
        triggerPlinko,
        triggerDivineCrossbow,
        triggerAvatarCoin,
        triggerAvatarStrike,
        triggerDiceRoll,
        triggerVerticalLightning,
        triggerSoccerBallKick,
        handleTrumpSpawn,
        handlePigBank,
        handleButterfly,
        freezeSway,
        activeHackerEffects.length,
        activePlinkoRounds.length,
      ],
    );

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

    useImperativeHandle(
      ref,
      () => ({
        placeBlock: increment,
        resetGame,
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
        triggerBorrowMoney,
        deductBalance: (amount: number) => {
          if (countRef.current < amount) return false;
          applyDelta(-amount, 8, 0.3, { source: 'market' });
          return true;
        },
      }),
      [
        applyDelta,
        increment,
        isMuted,
        resetGame,
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
        className={`absolute inset-0 w-full h-full bg-transparent font-sans cursor-none isolate ${
          isGunMode ? 'gun-scope-stage' : 'overflow-visible'
        }${freezeSway ? ' game-paused' : ''}`}
      >
        {isGunMode && <style>{scopeViewStyles}</style>}
        <style>{gamePausedStyles}</style>

        <div
          ref={cameraStageRef}
          className="trump-camera-stage"
          style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
        >
        {/* World — sheep, ambient (below counter) */}
        <div
          className={`${gameLayerClasses.world} ${
            isGunMode ? 'scope-content-layer' : ''
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
            moleMode={molePhase === 'active'}
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
          onReward={triggerPigBankReward}
          onComplete={completePigBank}
        />

        <ButterflyLayer
          spawns={activeButterflySpawns}
          gameplayTargetRef={estateTargetRef}
          onReward={triggerButterflyReward}
          onComplete={completeButterfly}
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
          onDrain={triggerHackerDrain}
          onComplete={handleHackerEffectComplete}
        />

        <DivineCrossbowLayer
          sessions={divineCrossbowSessions}
          clipRootRef={gameAreaRef}
          gameplayTargetRef={estateTargetRef}
          onBoltHit={triggerDivineCrossbowHit}
          onComplete={completeDivineCrossbow}
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
