/**
 * Root canvas — combines hammer gameplay and key-one (key [1]).
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
  SheepWarningBanner,
  scopeViewStyles,
  useSheepHerd,
} from './gameplay/sheep';
import {
  BombSequence,
  BowSequence,
  BOW_PENALTY,
  CounterExplosion,
  ExplosionFlash,
  keyActions,
  randomAttackAngle,
  useKeyActions,
  type AttackAngle,
  type KeyActionContext,
} from './key-one';
import {
  BOMB_PENALTY,
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
    },
    ref,
  ) => {
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const attackIdRef = useRef(0);
    const bowAttackIdRef = useRef(0);
    const [activeAttacks, setActiveAttacks] = useState<
      { id: number; angle: AttackAngle }[]
    >([]);
    const [activeBowAttacks, setActiveBowAttacks] = useState<
      { id: number; angle: AttackAngle }[]
    >([]);
    const [explosionBurstId, setExplosionBurstId] = useState(0);
    const explosionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const explosionBurstSeqRef = useRef(0);
    const counterRef = useRef<HTMLDivElement>(null);
    const estateTargetRef = useRef<HTMLDivElement>(null);
    const counterControls = useAnimation();
    const { controls: estateHitControls, shake: shakeEstate } = useEstateHitShake();

    const {
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
    } = useGameplayScore({
      isMuted,
      onStatsChange,
      shake: shakeEstate,
      targetScore,
      freezeSway,
    });

    const sheepActive = !freezeSway;
    const {
      phase: sheepPhase,
      waveId: sheepWaveId,
      bonusFloats: sheepBonusFloats,
      hitEffects: sheepHitEffects,
      registerSheepRef,
      tryHitSheep,
      removeBonusFloat,
      removeHitEffect,
      resetCycle: resetSheepCycle,
    } = useSheepHerd(sheepActive);

    const birdsActive = !freezeSway;
    const handleBirdPoopHit = useCallback(() => {
      applyDelta(-BIRD_POOP_PENALTY, 8, 0.35, { showPenaltyFloat: false });
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
      triggerTestWave: triggerBirdTestWave,
    } = useBirdFlock({
      active: birdsActive,
      gameplayTargetRef: estateTargetRef,
      containerRef: gameAreaRef,
      onPoopHitCounter: handleBirdPoopHit,
      sheepCrossing: sheepPhase === 'crossing',
    });

    const clearExplosionTimer = useCallback(() => {
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
        explosionTimerRef.current = null;
      }
    }, []);

    const triggerExplosion = useCallback(() => {
      applyDelta(-BOMB_PENALTY, 10, 0.5);
      const burstId = ++explosionBurstSeqRef.current;
      setExplosionBurstId(burstId);
      if (!isMuted) audioManager.playExplosion();
      clearExplosionTimer();
      explosionTimerRef.current = setTimeout(() => {
        setExplosionBurstId(0);
        explosionTimerRef.current = null;
      }, 800);
    }, [applyDelta, clearExplosionTimer, isMuted]);

    const startBombing = useCallback(() => {
      const id = ++attackIdRef.current;
      setActiveAttacks((prev) => [...prev, { id, angle: randomAttackAngle() }]);
    }, []);

    const finishBombing = useCallback((id: number) => {
      setActiveAttacks((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const triggerBowHit = useCallback(() => {
      applyDelta(-BOW_PENALTY, 6, 0.25);
      if (!isMuted) audioManager.playGunShot();
    }, [applyDelta, isMuted]);

    const startBowAttack = useCallback(() => {
      const id = ++bowAttackIdRef.current;
      setActiveBowAttacks((prev) => [...prev, { id, angle: randomAttackAngle() }]);
    }, []);

    const finishBowAttack = useCallback((id: number) => {
      setActiveBowAttacks((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const resetGame = useCallback(() => {
      clearExplosionTimer();
      setActiveAttacks([]);
      setActiveBowAttacks([]);
      setExplosionBurstId(0);
      resetGameplayPauseClock();
      resetScore();
      resetSheepCycle();
      resetBirdCycle();
      onGameReset();
    }, [clearExplosionTimer, onGameReset, resetBirdCycle, resetScore, resetSheepCycle]);

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

        if (hitEstate) increment();
      },
      [increment],
    );

    const handleGunShot = useCallback(
      (aimX: number, aimY: number) => {
        const container = gameAreaRef.current;
        if (!container) return;

        if (!isMuted) audioManager.playGunShot();

        if (tryHitBird(container, aimX, aimY)) {
          applyBirdBonus();
          return;
        }

        if (tryHitSheep(container, aimX, aimY)) {
          applySheepBonus();
        }
      },
      [applyBirdBonus, applySheepBonus, isMuted, tryHitBird, tryHitSheep],
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

    const keyActionContext = useMemo<KeyActionContext>(
      () => ({ startBombing, startBowAttack, paused: freezeSway }),
      [startBombing, startBowAttack, freezeSway],
    );

    useKeyActions(keyActions, keyActionContext);

    useEffect(() => {
      setGameplayPaused(freezeSway);
    }, [freezeSway]);

    useImperativeHandle(
      ref,
      () => ({
        placeBlock: increment,
        resetGame,
        destroyTopBoxes: (n: number) => {
          const amount = Math.max(1, Math.floor(n));
          applyDelta(-amount, Math.min(20, 3 + amount * 0.5));
          if (!isMuted) audioManager.playLose();
        },
        autoBuildBoxes: (n: number) => {
          const amount = Math.max(1, Math.floor(n));
          applyDelta(amount, 5);
          if (!isMuted) audioManager.playPop(amount);
        },
        triggerAutoBuild50: () => {
          applyDelta(50, 8);
          if (!isMuted) audioManager.playPop(80);
        },
      }),
      [applyDelta, increment, isMuted, resetGame],
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
              registerSheepRef={registerSheepRef}
            />
          )}

          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-green-900/15 to-transparent pointer-events-none" />
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
              displayStyle={counterDisplayStyle}
              displayRef={counterRef}
              penaltyFloats={penaltyFloats}
              onPenaltyFloatDone={removePenaltyFloat}
              sheepBonusFloats={sheepBonusFloats}
              onSheepBonusFloatDone={removeBonusFloat}
              birdBonusFloats={birdBonusFloats}
              onBirdBonusFloatDone={removeBirdBonusFloat}
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

        {/* Gameplay — hammer, alerts, stickman attacks (above counter) */}
        <div className={gameLayerClasses.gameplay} style={gameLayerStyle('gameplay')}>
          {birdPhase === 'crossing' && sheepPhase !== 'crossing' && (
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

          {sheepPhase === 'warning' && <SheepWarningBanner />}

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
              onComplete={() => removeHitEffect(effect.id)}
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

          {activeBowAttacks.map((attack) => (
            <BowSequence
              key={`bow-${attack.id}`}
              angle={attack.angle}
              gameplayTargetRef={estateTargetRef}
              onHit={triggerBowHit}
              onComplete={() => finishBowAttack(attack.id)}
            />
          ))}

          <ExplosionFlash burstId={explosionBurstId} />
        </div>
      </div>
    );
  },
);

StickmanBombCanvas.displayName = 'StickmanBombCanvas';
