/**
 * One divine crossbow session — bottom edge, fires one volley at the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import { divineCrossbowUrl } from '../config/divineCrossbowAssets';
import {
  DIVINE_CROSSBOW_BOLT_COUNT,
  DIVINE_CROSSBOW_BOLT_FLIGHT_MS,
  DIVINE_CROSSBOW_FADE_MS,
  DIVINE_CROSSBOW_RECOIL_MS,
  DIVINE_CROSSBOW_TIP_X_RATIO,
  DIVINE_CROSSBOW_TIP_Y_RATIO,
  DIVINE_CROSSBOW_VOLLEY_FLIGHT_JITTER_MS,
  DIVINE_CROSSBOW_VOLLEY_STAGGER_MS,
} from '../config/divineCrossbowConfig';
import { cancelCrossbowBoltFlightsFor, flyCrossbowBolt } from '../logic/crossbowBoltFlight';
import {
  getCrossbowLayout,
  pickVolleyTarget,
  resolveBoltShot,
  spreadVolleyLaunch,
} from '../logic/crossbowGeometry';
import { acquireBolt, releaseBolt } from '../logic/divineCrossbowPool';
import { spawnBoltHitEffect, spawnVolleyLaunchEffect } from '../logic/spawnCrossbowEffects';

type DivineCrossbowInstanceProps = {
  sessionId: number;
  spawnXRatio: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  fxLayerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onBoltHit: () => void;
  onComplete: () => void;
};

function DivineCrossbowInstanceInner({
  sessionId,
  spawnXRatio,
  layerRef,
  fxLayerRef,
  gameplayTargetRef,
  onBoltHit,
  onComplete,
}: DivineCrossbowInstanceProps) {
  const rigRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const onBoltHitRef = useRef(onBoltHit);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);

  onBoltHitRef.current = onBoltHit;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;
    const boltEls: HTMLDivElement[] = [];
    const rig = rigRef.current;

    rig?.classList.remove('divine-crossbow-rig-fade');
    rig?.classList.add('divine-crossbow-rig-spawn');

    async function fireVolley(
      rigEl: HTMLDivElement,
      layer: HTMLDivElement,
      fxLayer: HTMLDivElement,
      estate: HTMLElement,
    ) {
      const estateRect = estate.getBoundingClientRect();
      const containerRect = layer.getBoundingClientRect();
      const tipRect = tipRef.current!.getBoundingClientRect();
      const launch = {
        x: tipRect.left - containerRect.left + tipRect.width * 0.5,
        y: tipRect.top - containerRect.top + tipRect.height * 0.5,
      };

      rigEl.classList.remove('divine-crossbow-rig-recoil');
      void rigEl.offsetWidth;
      rigEl.classList.add('divine-crossbow-rig-recoil');
      spawnVolleyLaunchEffect(fxLayer, launch);

      const boltFlights: Promise<void>[] = [];

      for (let boltIndex = 0; boltIndex < DIVINE_CROSSBOW_BOLT_COUNT; boltIndex++) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;

        const target = pickVolleyTarget(
          estateRect,
          containerRect,
          boltIndex,
          DIVINE_CROSSBOW_BOLT_COUNT,
        );
        const boltLaunch = spreadVolleyLaunch(launch, boltIndex, DIVINE_CROSSBOW_BOLT_COUNT);
        const shot = resolveBoltShot(boltLaunch, target, boltIndex);
        const flightMs =
          DIVINE_CROSSBOW_BOLT_FLIGHT_MS +
          (boltIndex % 3) * DIVINE_CROSSBOW_VOLLEY_FLIGHT_JITTER_MS;

        const bolt = acquireBolt(fxLayer);
        boltEls.push(bolt);

        const flight = sleep(boltIndex * DIVINE_CROSSBOW_VOLLEY_STAGGER_MS)
          .then(() => {
            if (cancelled || sequenceId !== sequenceIdRef.current) return;
            return flyCrossbowBolt(
              bolt,
              boltLaunch,
              shot.impact,
              shot.curveSide,
              flightMs,
            );
          })
          .then(() => {
            if (cancelled || sequenceId !== sequenceIdRef.current) return;
            spawnBoltHitEffect(fxLayer, shot.impact);
            onBoltHitRef.current();
            window.setTimeout(() => {
              const idx = boltEls.indexOf(bolt);
              if (idx >= 0) boltEls.splice(idx, 1);
              releaseBolt(bolt);
            }, 180);
          });

        boltFlights.push(flight);
      }

      await Promise.all(boltFlights);
    }

    async function runSession() {
      const ready = await waitForRefs([layerRef, fxLayerRef, rigRef, tipRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const layer = layerRef.current!;
      const fxLayer = fxLayerRef.current!;
      const rigEl = rigRef.current!;
      const estate = gameplayTargetRef.current!;
      const layerRect = layer.getBoundingClientRect();
      const layout = getCrossbowLayout(layerRect.width, spawnXRatio);

      rigEl.classList.remove(
        'divine-crossbow-rig-side-left',
        'divine-crossbow-rig-side-right',
      );
      rigEl.classList.add('divine-crossbow-rig-side-bottom');
      rigEl.style.left = `${layout.left}px`;
      rigEl.style.width = `${layout.width}px`;
      rigEl.style.height = `${layout.height}px`;
      rigEl.style.bottom = `${layout.bottom}px`;
      rigEl.style.top = 'auto';
      rigEl.style.setProperty('--crossbow-rot', `${layout.rotationDeg}deg`);
      rigEl.style.setProperty('--tip-x-ratio', `${DIVINE_CROSSBOW_TIP_X_RATIO * 100}%`);
      rigEl.style.setProperty('--tip-y-ratio', `${DIVINE_CROSSBOW_TIP_Y_RATIO * 100}%`);
      rigEl.style.setProperty('--recoil-ms', `${DIVINE_CROSSBOW_RECOIL_MS}ms`);

      await fireVolley(rigEl, layer, fxLayer, estate);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      rigEl.classList.remove('divine-crossbow-rig-spawn', 'divine-crossbow-rig-recoil');
      rigEl.classList.add('divine-crossbow-rig-fade');
      await sleep(DIVINE_CROSSBOW_FADE_MS);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      boltEls.forEach((el) => releaseBolt(el));
      rigEl.classList.remove('divine-crossbow-rig-fade');
      onCompleteRef.current();
    }

    void runSession();

    return () => {
      cancelled = true;
      cancelCrossbowBoltFlightsFor(boltEls);
      boltEls.forEach((el) => releaseBolt(el));
      rigRef.current?.classList.remove(
        'divine-crossbow-rig-spawn',
        'divine-crossbow-rig-fade',
        'divine-crossbow-rig-recoil',
        'divine-crossbow-rig-side-bottom',
        'divine-crossbow-rig-side-left',
        'divine-crossbow-rig-side-right',
      );
    };
  }, [sessionId, spawnXRatio, gameplayTargetRef, layerRef, fxLayerRef]);

  return (
    <div
      ref={rigRef}
      className="divine-crossbow-rig"
      style={{ zIndex: 33 + (sessionId % 4) }}
      aria-hidden
    >
      <img
        src={divineCrossbowUrl}
        alt=""
        className="divine-crossbow-img"
        draggable={false}
        loading="eager"
        decoding="async"
      />
      <span ref={tipRef} className="divine-crossbow-tip-anchor" />
    </div>
  );
}

export const DivineCrossbowInstance = memo(DivineCrossbowInstanceInner);
