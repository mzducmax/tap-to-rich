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
import { audioManager } from '../../utils/audio';
import {
  HammerCursor,
  NumberDisplay,
  useGameplayScore,
  useShake,
  WeaponModeBadge,
  weaponModeBadgeStyles,
  formatWeaponSwitchKeyLabel,
  gameLayerClasses,
  gameLayerStyle,
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

export const StickmanBombCanvas = forwardRef<StickmanBombCanvasHandle, StickmanBombCanvasProps>(
  (
    {
      timeOfDay,
      onStatsChange,
      onGameReset,
      isMuted,
      targetScore,
      freezeSway = false,
      counterDisplayStyle = 'stick',
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
    const counterBoxRef = useRef<HTMLDivElement>(null);
    const { controls, shake } = useShake();

    const {
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
      shake,
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
      counterBoxRef,
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
        const counter = counterBoxRef.current;
        if (!container || !counter) return;

        const hitCounter =
          isStrikeInHitZone(
            impactX,
            impactY,
            pivotX,
            pivotY,
            counter,
            container,
          ) ||
          isClickInHitZone(clickX, clickY, counter, container);

        if (hitCounter) increment();
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
    const switchKeyLabel = formatWeaponSwitchKeyLabel(weaponSwitchKey);

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
      () => ({ startBombing, startBowAttack }),
      [startBombing, startBowAttack],
    );

    useKeyActions(keyActions, keyActionContext);

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
        }`}
      >
        {isGunMode && <style>{scopeViewStyles}</style>}
        <style>{weaponModeBadgeStyles}</style>

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

        {/* Counter — readable, not darkened by scope */}
        <div className={gameLayerClasses.counter} style={gameLayerStyle('counter')}>
          <NumberDisplay
            counterTokens={counterTokens}
            controls={controls}
            freezeSway={freezeSway}
            displayStyle={counterDisplayStyle}
            displayRef={counterRef}
            counterBoxRef={counterBoxRef}
            penaltyFloats={penaltyFloats}
            onPenaltyFloatDone={removePenaltyFloat}
            sheepBonusFloats={sheepBonusFloats}
            onSheepBonusFloatDone={removeBonusFloat}
            birdBonusFloats={birdBonusFloats}
            onBirdBonusFloatDone={removeBirdBonusFloat}
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
              counterBoxRef={counterBoxRef}
              onExplode={triggerExplosion}
              onComplete={() => finishBombing(attack.id)}
            />
          ))}

          {activeBowAttacks.map((attack) => (
            <BowSequence
              key={`bow-${attack.id}`}
              angle={attack.angle}
              counterBoxRef={counterBoxRef}
              onHit={triggerBowHit}
              onComplete={() => finishBowAttack(attack.id)}
            />
          ))}

          <ExplosionFlash burstId={explosionBurstId} />
        </div>

        {/* HUD */}
        <div className={gameLayerClasses.hud} style={gameLayerStyle('hud')}>
          <div className="absolute top-24 left-0 right-0 font-mono text-white/80 text-xs text-center px-4 animate-pulse drop-shadow-md">
            {isGunMode
              ? `CLICK TO SHOOT | SCOPE VIEW | [${switchKeyLabel}] HAMMER`
              : `PRESS [1] BOMB | [2] BOW | CLICK TO INCREASE | [${switchKeyLabel}] GUN`}
          </div>

          <WeaponModeBadge mode={weaponMode} switchKeyCode={weaponSwitchKey} />

          {!freezeSway && (
            <button
              type="button"
              className="absolute bottom-6 left-4 z-50 pointer-events-auto rounded-lg border border-white/25 bg-black/45 px-3 py-1.5 font-mono text-[11px] text-white/90 shadow-md backdrop-blur-sm transition hover:bg-black/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={sheepPhase === 'crossing'}
              onClick={() => {
                triggerBirdTestWave();
              }}
              aria-label="Test đàn vịt bay qua"
            >
              🦆 Test vịt
            </button>
          )}
        </div>
      </div>
    );
  },
);

StickmanBombCanvas.displayName = 'StickmanBombCanvas';
