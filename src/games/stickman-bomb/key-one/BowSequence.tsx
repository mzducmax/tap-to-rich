/**
 * Bow attack: archer stands far away, shoots; arrow sticks in the counter (−5).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { getBowAttackGeometry, type AttackAngle } from './attackGeometry';
import { sleep, waitForRefs, type Point2 } from './animationUtils';
import { BOW_SPAWN_DIST, BOW_STICK_DURATION_MS } from './bowConfig';
import { BowStickman, type BowStickmanPose } from './BowStickman';
import { bowStickmanStyles } from './bowStickmanStyles';

const ARROW_LEN = 34;

function flyArrow(
  el: HTMLElement,
  start: Point2,
  tipTarget: Point2,
  duration: number,
) {
  const angleRad = Math.atan2(tipTarget.y - start.y, tipTarget.x - start.x);
  const endLeft = tipTarget.x - Math.cos(angleRad) * ARROW_LEN;
  const endTop = tipTarget.y - Math.sin(angleRad) * ARROW_LEN;
  const angleVar = `${angleRad}rad`;

  el.style.setProperty('--arrow-angle', angleVar);

  return new Promise<void>((resolve) => {
    let startT: number | null = null;

    function step(t: number) {
      if (startT === null) startT = t;
      const raw = Math.min((t - startT) / duration, 1);
      const p = 1 - (1 - raw) ** 2;
      const x = start.x + (endLeft - start.x) * p;
      const y = start.y + (endTop - start.y) * p;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `rotate(${angleVar})`;

      if (raw < 1) {
        requestAnimationFrame(step);
      } else {
        el.classList.add('sb-arrow-stuck');
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

type BowSequenceProps = {
  angle: AttackAngle;
  counterBoxRef: React.RefObject<HTMLElement | null>;
  onHit: () => void;
  onComplete: () => void;
};

export function BowSequence({ angle, counterBoxRef, onHit, onComplete }: BowSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickmanRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<BowStickmanPose>('stand');
  const onHitRef = useRef(onHit);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);

  onHitRef.current = onHit;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function attack() {
      const ready = await waitForRefs([containerRef, stickmanRef, arrowRef, counterBoxRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const man = stickmanRef.current!;
      const arrow = arrowRef.current!;
      const container = containerRef.current!;
      const box = counterBoxRef.current!;

      const containerRect = container.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      const geo = getBowAttackGeometry(angle, boxRect, containerRect, BOW_SPAWN_DIST);

      man.style.cssText = `position:absolute;left:${geo.stand.x}px;top:${geo.stand.y}px;bottom:auto;z-index:20;display:block;opacity:1;transform:scaleX(${geo.facing})`;
      man.classList.remove('sb-bow-archer-fade-out');

      setPose('stand');
      await sleep(180);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      setPose('aim');
      await sleep(520);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const nockPoint =
        man.querySelector('.sb-bow-nock-point') ??
        man.querySelector('.sb-bow-hand-dot') ??
        man;
      const nockRect = nockPoint.getBoundingClientRect();
      const arrowStartX = nockRect.left - containerRect.left + nockRect.width * 0.5;
      const arrowStartY = nockRect.top - containerRect.top + nockRect.height * 0.5;

      setPose('release');
      arrow.style.display = 'block';
      arrow.classList.remove('sb-arrow-stuck');
      arrow.style.left = `${arrowStartX}px`;
      arrow.style.top = `${arrowStartY}px`;

      await flyArrow(
        arrow,
        { x: arrowStartX, y: arrowStartY },
        geo.arrowTarget,
        340,
      );
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      onHitRef.current();
      man.classList.add('sb-bow-archer-fade-out');

      await sleep(BOW_STICK_DURATION_MS);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      arrow.style.display = 'none';
      arrow.classList.remove('sb-arrow-stuck');
      man.style.display = 'none';
      man.classList.remove('sb-bow-archer-fade-out');
      onCompleteRef.current();
    }

    void attack();

    return () => {
      cancelled = true;
    };
  }, [angle, counterBoxRef]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      <style>{bowStickmanStyles}</style>
      <div ref={stickmanRef} className="absolute" style={{ display: 'none' }}>
        <BowStickman pose={pose} />
      </div>
      <div ref={arrowRef} className="sb-arrow-projectile" style={{ display: 'none' }} aria-hidden>
        <span className="sb-arrow-fletch" />
        <span className="sb-arrow-shaft" />
        <span className="sb-arrow-head" />
      </div>
    </div>
  );
}
