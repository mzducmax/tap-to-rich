/**
 * Action sequence: 360° → estate edge → drop/toss gift box → roll → open reward (+$10).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { getAngleGeometry, type AttackAngle } from '../shared/attackGeometry';
import { CurvyStickman, type StickmanPose } from './CurvyStickman';
import { TreasureChest } from './TreasureChest';
import {
  gentleDrop,
  gentleTossUp,
  move2d,
  rollOnGround,
  sleep,
  waitForRefs,
} from '../shared/animationUtils';

export type { AttackAngle } from '../shared/attackGeometry';
export { randomAttackAngle } from '../shared/attackGeometry';

type BombSequenceProps = {
  angle: AttackAngle;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onExplode: () => void;
  onComplete: () => void;
};

export function BombSequence({ angle, gameplayTargetRef, onExplode, onComplete }: BombSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickmanRef = useRef<HTMLDivElement>(null);
  const chestRef = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<StickmanPose>('run');
  const [showHandChest, setShowHandChest] = useState(false);
  const [flyingChestVisible, setFlyingChestVisible] = useState(false);
  const onExplodeRef = useRef(onExplode);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);

  onExplodeRef.current = onExplode;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function attack() {
      const ready = await waitForRefs([containerRef, stickmanRef, chestRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const man = stickmanRef.current!;
      const chest = chestRef.current!;
      const container = containerRef.current!;
      const box = gameplayTargetRef.current!;

      const containerRect = container.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      const geo = getAngleGeometry(angle, boxRect, containerRect);

      const bx = boxRect.left - containerRect.left;
      const by = boxRect.top - containerRect.top;
      const bh = boxRect.height;
      const cx = bx + boxRect.width / 2;

      man.style.cssText = `position:absolute;left:${geo.start.x}px;top:${geo.start.y}px;bottom:auto;z-index:20;display:block;transform:scaleX(${geo.facingIn})`;

      setPose('run');
      setShowHandChest(true);
      await move2d(man, geo.start, geo.end, geo.tossUp ? 640 : 580, 'easeInOut', {
        bob: 4,
        facing: geo.facingIn,
        verticalRun: geo.verticalRun,
      });
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      setPose(geo.tossUp ? 'toss-up' : 'drop');
      await sleep(geo.tossUp ? 160 : 100);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const handEl =
        man.querySelector('.sb-hand-chest') ??
        man.querySelector('.sb-arm-f .sb-hand') ??
        man;

      const handRect = handEl.getBoundingClientRect();

      const chestHalfW = 24;
      const chestStartX = handRect.left - containerRect.left + handRect.width / 2 - chestHalfW;
      const chestStartY = handRect.top - containerRect.top;
      const chestLandX = cx - chestHalfW;
      const groundY = by + bh - 8;
      const chestLandY = geo.tossUp ? by + bh - 32 : by + bh * 0.55;
      const rollStartX = chestLandX;
      const rollEndX = chestLandX + geo.rollDir * 22;

      setShowHandChest(false);
      setFlyingChestVisible(true);
      chest.style.display = 'block';
      chest.style.left = `${chestStartX}px`;
      chest.style.top = `${chestStartY}px`;

      setPose('run');
      const exitPromise = move2d(man, geo.end, geo.exit, 460, 'easeIn', {
        bob: 5,
        facing: geo.facingOut,
        verticalRun: geo.verticalRun,
      });

      const chestPromise = (async () => {
        if (geo.tossUp) {
          await gentleTossUp(chest, chestStartX, chestStartY, chestLandX, chestLandY, 400);
        } else {
          await gentleDrop(chest, chestStartX, chestStartY, chestLandX, chestLandY, 320);
        }
        await rollOnGround(chest, rollStartX, rollEndX, groundY, 340);
      })();

      await exitPromise;
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await chestPromise;
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await sleep(80);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      onExplodeRef.current();

      chest.style.display = 'none';
      setFlyingChestVisible(false);
      man.style.display = 'none';

      onCompleteRef.current();
    }

    void attack();

    return () => {
      cancelled = true;
    };
  }, [angle, gameplayTargetRef]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      <div ref={stickmanRef} className="absolute" style={{ display: 'none' }}>
        <CurvyStickman pose={pose} showHandChest={showHandChest} />
      </div>

      <div
        ref={chestRef}
        className="absolute z-[25]"
        style={{ display: flyingChestVisible ? 'block' : 'none' }}
      >
        <TreasureChest />
      </div>
    </div>
  );
}
