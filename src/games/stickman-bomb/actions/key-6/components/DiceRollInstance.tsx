/**
 * One tumbling die on the estate roof (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { waitForRefs } from '../../shared/animationUtils';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import { estateRectFromDom } from '../../key-8/logic/soccerBallSpawn';
import {
  DICE_LAND_HOLD_MS,
  DICE_SETTLE_LERP_MS,
  DICE_STOP_HOLD_MS,
  diceTotalReward,
} from '../config/diceRollConfig';
import {
  easeOutCubic,
  quatForFace,
} from '../logic/diceFaceOrientation';
import { createDiceSim, stepDiceSim } from '../logic/diceRollPhysics';
import { quatToMatrix3d, slerpQuaternion } from '../logic/diceQuaternion';
import type { DiceLandPayload } from '../types';
import { DiceCube } from './DiceCube';
import { DiceRewardBurst } from './DiceRewardBurst';

type DiceRollInstanceProps = {
  rollId: number;
  multiplier: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onLand: (payload: DiceLandPayload) => void;
  onComplete: () => void;
};

type BurstState = {
  x: number;
  y: number;
  reward: number;
  multiplier: number;
  face: number;
};

function DiceRollInstanceInner({
  rollId,
  multiplier,
  layerRef,
  gameplayTargetRef,
  onLand,
  onComplete,
}: DiceRollInstanceProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<HTMLDivElement>(null);
  const onLandRef = useRef(onLand);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  const [burst, setBurst] = useState<BurstState | null>(null);
  onLandRef.current = onLand;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;
    let rafId = 0;

    async function runRoll() {
      const ready = await waitForRefs([layerRef, gameplayTargetRef, itemRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const layer = layerRef.current!;
      const estate = gameplayTargetRef.current!;
      const item = itemRef.current!;
      const cube = cubeRef.current!;
      const layerRect = layer.getBoundingClientRect();
      const estateRect = estate.getBoundingClientRect();
      const estateBox = estateRectFromDom(estateRect, layerRect, 2);

      const sim = createDiceSim(estateBox, multiplier);
      const finalQuat = quatForFace(sim.face);
      let rewarded = false;
      let stopHoldMs = 0;
      let settleLerpMs = 0;
      let endHoldMs = 0;
      let lastT = 0;
      let settleFrom = { ...sim.body.quat };

      const applyQuaternion = (q: typeof sim.body.quat) => {
        cube.style.transform = quatToMatrix3d(q);
      };

      const applyCubeTransform = () => {
        applyQuaternion(sim.body.quat);
      };

      const syncClubSpotlight = () => {
        layer.style.setProperty('--dice-spot-x', `${sim.body.x}px`);
        layer.style.setProperty('--dice-spot-y', `${sim.body.y}px`);
      };

      syncClubSpotlight();

      const applyFaceOrientation = (t: number) => {
        const q = slerpQuaternion(settleFrom, finalQuat, easeOutCubic(t));
        applyQuaternion(q);
      };

      await new Promise<void>((resolve) => {
        const finish = () => {
          if (cancelled || sequenceId !== sequenceIdRef.current) return;
          resolve();
        };

        const frame = (t: number) => {
          if (cancelled || sequenceId !== sequenceIdRef.current) {
            finish();
            return;
          }

          if (isGameplayPaused()) {
            lastT = t;
            rafId = requestAnimationFrame(frame);
            return;
          }

          const dt = lastT ? Math.min(0.032, (t - lastT) / 1000) : 0.016;
          lastT = t;

          if (!sim.stopped) {
            stepDiceSim(sim, dt);
            item.style.left = `${sim.body.x}px`;
            item.style.top = `${sim.body.y}px`;
            syncClubSpotlight();
            applyCubeTransform();
          } else if (!rewarded) {
            stopHoldMs += dt * 1000;
            syncClubSpotlight();
            if (settleLerpMs === 0) {
              settleFrom = { ...sim.body.quat };
            }
            settleLerpMs = Math.min(DICE_SETTLE_LERP_MS, settleLerpMs + dt * 1000);
            applyFaceOrientation(settleLerpMs / DICE_SETTLE_LERP_MS);

            if (stopHoldMs >= DICE_STOP_HOLD_MS) {
              rewarded = true;
              endHoldMs = DICE_LAND_HOLD_MS;
              applyFaceOrientation(1);

              const reward = diceTotalReward(sim.face, sim.multiplier);
              const payload: DiceLandPayload = {
                face: sim.face,
                multiplier: sim.multiplier,
                reward,
                x: sim.body.x,
                y: sim.body.y,
              };

              if (multiplierRef.current) {
                multiplierRef.current.style.opacity = '0';
                multiplierRef.current.style.transform =
                  'translateX(-50%) scale(1.35)';
              }

              setBurst({
                x: sim.body.x,
                y: sim.body.y,
                reward,
                multiplier: sim.multiplier,
                face: sim.face,
              });
              onLandRef.current(payload);
            }
          } else {
            endHoldMs -= dt * 1000;
            if (endHoldMs <= 0) {
              finish();
              return;
            }
          }

          rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);
      });

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void runRoll();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [gameplayTargetRef, layerRef, multiplier, rollId]);

  return (
    <>
      <div ref={itemRef} className="dice-roll-item">
        <div ref={multiplierRef} className="dice-roll-multiplier">
          ×{multiplier}
        </div>
        <DiceCube cubeRef={cubeRef} />
      </div>
      {burst && (
        <DiceRewardBurst
          x={burst.x}
          y={burst.y}
          reward={burst.reward}
          multiplier={burst.multiplier}
          face={burst.face}
        />
      )}
    </>
  );
}

export const DiceRollInstance = memo(DiceRollInstanceInner);
