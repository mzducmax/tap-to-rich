/**
 * One grappling hook: a slow swinging drop from the top, a cash grab at the
 * house, then a slow haul back up while the balance is docked.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  GRAPPLE_CASH_LABEL,
  GRAPPLE_DESCEND_MS,
  GRAPPLE_FADE_MS,
  GRAPPLE_GRAB_MS,
  GRAPPLE_PULL_MS,
  GRAPPLE_REACH_RATIO,
  GRAPPLE_SWAY_DAMP,
  GRAPPLE_SWAY_DEG,
  GRAPPLE_SWAY_SPEED,
} from '../config/grappleHookConfig';

/** Pause-aware rAF tween. Calls onFrame(rawProgress, elapsedMs). */
function animate(
  durationMs: number,
  onFrame: (raw: number, elapsed: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let startT: number | null = null;
    let pauseFrame: number | null = null;

    const step = (t: number) => {
      if (isGameplayPaused()) {
        if (pauseFrame === null) pauseFrame = t;
        requestAnimationFrame(step);
        return;
      }
      if (pauseFrame !== null) {
        if (startT !== null) startT += t - pauseFrame;
        pauseFrame = null;
      }
      if (startT === null) startT = t;
      const elapsed = t - startT;
      const raw = Math.min(elapsed / durationMs, 1);
      onFrame(raw, elapsed);
      if (raw < 1) requestAnimationFrame(step);
      else resolve();
    };

    requestAnimationFrame(step);
  });
}

const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/** Damped pendulum angle (deg) at a given elapsed time. */
function swayDeg(elapsed: number, amp: number) {
  const decay = Math.exp(-GRAPPLE_SWAY_DAMP * elapsed);
  return amp * decay * Math.sin(elapsed * GRAPPLE_SWAY_SPEED);
}

type GrappleHookInstanceProps = {
  strikeId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  /** Fires once when the haul-up begins — host docks the balance + plays sound. */
  onGrab: () => void;
  onComplete: () => void;
};

function GrappleHookInstanceInner({
  strikeId,
  layerRef,
  gameplayTargetRef,
  onGrab,
  onComplete,
}: GrappleHookInstanceProps) {
  const unitRef = useRef<HTMLDivElement>(null);
  const moneyRef = useRef<HTMLDivElement>(null);
  const onGrabRef = useRef(onGrab);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onGrabRef.current = onGrab;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;
    const stale = () => cancelled || sequenceId !== sequenceIdRef.current;

    async function run() {
      const ready = await waitForRefs([layerRef, unitRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (stale()) return;

      const layer = layerRef.current!;
      const unit = unitRef.current!;
      const money = moneyRef.current!;
      const estate = gameplayTargetRef.current!;

      const layerRect = layer.getBoundingClientRect();
      const estateRect = estate.getBoundingClientRect();

      // Anchor on the top edge, above the house. Slight random offset for variety.
      const estateCx = estateRect.left - layerRect.left + estateRect.width / 2;
      const jitter = (Math.random() - 0.5) * estateRect.width * 0.18;
      const anchorX = Math.max(40, Math.min(layerRect.width - 40, estateCx + jitter));
      // Rope length needed for the claw to dip into the roof of the house.
      const reachY =
        estateRect.top - layerRect.top + estateRect.height * GRAPPLE_REACH_RATIO;
      const targetLen = Math.max(60, reachY);

      unit.style.left = `${anchorX}px`;
      unit.style.setProperty('--rope-len', '0px');
      unit.style.setProperty('--sway-deg', '0deg');

      // 1) Slow swinging descent (~1s).
      await animate(GRAPPLE_DESCEND_MS, (raw, elapsed) => {
        const len = targetLen * easeInOut(raw);
        unit.style.setProperty('--rope-len', `${len}px`);
        unit.style.setProperty('--sway-deg', `${swayDeg(elapsed, GRAPPLE_SWAY_DEG)}deg`);
      });
      if (stale()) return;

      // 2) Clamp the cash bundle.
      unit.style.setProperty('--rope-len', `${targetLen}px`);
      unit.style.setProperty('--sway-deg', '0deg');
      money.classList.add('is-grabbed');
      await sleep(GRAPPLE_GRAB_MS);
      if (stale()) return;

      // Begin the haul — this is when money leaves the balance.
      onGrabRef.current();

      // 3) Slow haul back up (~1s), residual settling sway.
      await animate(GRAPPLE_PULL_MS, (raw, elapsed) => {
        const len = targetLen * (1 - easeInOut(raw));
        unit.style.setProperty('--rope-len', `${len}px`);
        unit.style.setProperty(
          '--sway-deg',
          `${swayDeg(elapsed, GRAPPLE_SWAY_DEG * 0.45)}deg`,
        );
      });
      if (stale()) return;

      money.classList.remove('is-grabbed');
      money.classList.add('is-fading');
      await sleep(GRAPPLE_FADE_MS);
      if (stale()) return;

      onCompleteRef.current();
    }

    void run();

    return () => {
      cancelled = true;
      moneyRef.current?.classList.remove('is-grabbed', 'is-fading');
    };
  }, [strikeId, gameplayTargetRef, layerRef]);

  return (
    <div ref={unitRef} className="grapple-unit" style={{ zIndex: 32 + (strikeId % 16) }} aria-hidden>
      <div className="grapple-rope" />
      <svg className="grapple-claw" viewBox="0 0 40 40" aria-hidden>
        {/* shank */}
        <rect x="18" y="0" width="4" height="16" rx="2" fill="#8a7048" />
        <circle cx="20" cy="15" r="4" fill="#6b5535" stroke="#3d3120" strokeWidth="1.5" />
        {/* claw prongs */}
        <path
          d="M20 16 C 12 20, 8 30, 12 38 C 14 32, 16 28, 20 26 C 24 28, 26 32, 28 38 C 32 30, 28 20, 20 16 Z"
          fill="#b9b9c2"
          stroke="#5d5d68"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M20 18 C 16 22, 15 28, 17 33" stroke="#7d7d88" strokeWidth="1.2" fill="none" />
      </svg>
      <div ref={moneyRef} className="grapple-money">
        {GRAPPLE_CASH_LABEL}
      </div>
    </div>
  );
}

export const GrappleHookInstance = memo(GrappleHookInstanceInner);
