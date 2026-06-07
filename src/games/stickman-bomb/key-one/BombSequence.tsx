/**
 * Action sequence: 360° → counter edge → drop/toss → roll → explode.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { getAngleGeometry, type AttackAngle } from './attackGeometry';
import { CurvyStickman, type StickmanPose } from './CurvyStickman';
import {
  gentleDrop,
  gentleTossUp,
  move2d,
  rollOnGround,
  sleep,
  waitForRefs,
} from './animationUtils';

export type { AttackAngle } from './attackGeometry';
export { randomAttackAngle } from './attackGeometry';

type BombSequenceProps = {
  angle: AttackAngle;
  counterBoxRef: React.RefObject<HTMLElement | null>;
  onExplode: () => void;
  onComplete: () => void;
};

export function BombSequence({ angle, counterBoxRef, onExplode, onComplete }: BombSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickmanRef = useRef<HTMLDivElement>(null);
  const bombRef = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<StickmanPose>('run');
  const [showHandBomb, setShowHandBomb] = useState(false);
  const [flyingBombVisible, setFlyingBombVisible] = useState(false);
  const onExplodeRef = useRef(onExplode);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);

  onExplodeRef.current = onExplode;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function attack() {
      const ready = await waitForRefs([containerRef, stickmanRef, bombRef, counterBoxRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const man = stickmanRef.current!;
      const bomb = bombRef.current!;
      const container = containerRef.current!;
      const box = counterBoxRef.current!;

      const containerRect = container.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      const geo = getAngleGeometry(angle, boxRect, containerRect);

      const bx = boxRect.left - containerRect.left;
      const by = boxRect.top - containerRect.top;
      const bh = boxRect.height;
      const cx = bx + boxRect.width / 2;

      man.style.cssText = `position:absolute;left:${geo.start.x}px;top:${geo.start.y}px;bottom:auto;z-index:20;display:block;transform:scaleX(${geo.facingIn})`;

      setPose('run');
      setShowHandBomb(true);
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
        man.querySelector('.sb-hand-bomb') ??
        man.querySelector('.sb-arm-f .sb-hand') ??
        man;

      const handRect = handEl.getBoundingClientRect();

      const bombStartX = handRect.left - containerRect.left + handRect.width / 2 - 18;
      const bombStartY = handRect.top - containerRect.top;
      const bombLandX = cx - 18;
      const groundY = by + bh - 8;
      const bombLandY = geo.tossUp ? by + bh - 32 : by + bh * 0.55;
      const rollStartX = bombLandX;
      const rollEndX = bombLandX + geo.rollDir * 22;

      setShowHandBomb(false);
      setFlyingBombVisible(true);
      bomb.style.display = 'block';
      bomb.style.left = `${bombStartX}px`;
      bomb.style.top = `${bombStartY}px`;

      setPose('run');
      const exitPromise = move2d(man, geo.end, geo.exit, 460, 'easeIn', {
        bob: 5,
        facing: geo.facingOut,
        verticalRun: geo.verticalRun,
      });

      const bombPromise = (async () => {
        if (geo.tossUp) {
          await gentleTossUp(bomb, bombStartX, bombStartY, bombLandX, bombLandY, 400);
        } else {
          await gentleDrop(bomb, bombStartX, bombStartY, bombLandX, bombLandY, 320);
        }
        await rollOnGround(bomb, rollStartX, rollEndX, groundY, 340);
      })();

      await exitPromise;
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await bombPromise;
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await sleep(80);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      onExplodeRef.current();

      bomb.style.display = 'none';
      setFlyingBombVisible(false);
      man.style.display = 'none';

      onCompleteRef.current();
    }

    void attack();

    return () => {
      cancelled = true;
    };
  }, [angle, counterBoxRef]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      <div ref={stickmanRef} className="absolute" style={{ display: 'none' }}>
        <CurvyStickman pose={pose} showHandBomb={showHandBomb} />
      </div>

      <div
        ref={bombRef}
        className="absolute text-4xl z-[25]"
        style={{
          display: flyingBombVisible ? 'block' : 'none',
          filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.25))',
        }}
      >
        💣
      </div>
    </div>
  );
}
