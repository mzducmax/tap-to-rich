/**
 * One hacker session — matrix rain, alert, estate zoom, panel drain.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { audioManager } from '../../../../../utils/audio';
import { sleepWallClock, waitForRefs } from '../../shared/animationUtils';
import {
  animateTrumpCamera,
  resetTrumpCamera,
} from '../../key-9/logic/trumpCamera';
import {
  HACKER_ALERT_MS,
  HACKER_ENTER_MS,
  HACKER_ESTATE_HOLD_MS,
  HACKER_ESTATE_ZOOM_IN,
  HACKER_ESTATE_ZOOM_IN_MS,
  HACKER_ESTATE_ZOOM_OUT_MS,
  HACKER_EXIT_MS,
  HACKER_MATRIX_MS,
  HACKER_MAX_DURATION_MS,
  HACKER_PENALTY,
} from '../config/hackerEffectConfig';
import { hackerUrl } from '../config/hackerAssets';
import { runHackerMoneyDrain } from '../logic/hackerDrain';
import {
  animateHackerPanelZoomIn,
  animateHackerPanelZoomOut,
  resetHackerPanelZoom,
} from '../logic/hackerPanelCamera';
import {
  animateHackerLayerTransition,
  resetHackerLayerTransition,
} from '../logic/hackerLayerTransition';
import {
  clearHackerMatrixCanvas,
  startHackerMatrixLoop,
  stopHackerMatrixLoop,
} from '../logic/hackerMatrixCanvas';

type HackerEffectInstanceProps = {
  effectId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  cameraStageRef: React.RefObject<HTMLDivElement | null>;
  clipRootRef: React.RefObject<HTMLDivElement | null>;
  estateTargetRef: React.RefObject<HTMLElement | null>;
  balancePanelRef: React.RefObject<HTMLElement | null>;
  balanceDockRef: React.RefObject<HTMLElement | null>;
  getBalance: () => number;
  onDrain: (amount: number) => void;
  onComplete: () => void;
};

function computeStageFocus(
  target: HTMLElement,
  cameraStage: HTMLElement,
): { x: number; y: number } {
  const cameraRect = cameraStage.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  return {
    x: targetRect.left + targetRect.width * 0.5 - cameraRect.left,
    y: targetRect.top + targetRect.height * 0.5 - cameraRect.top,
  };
}

function HackerEffectInstanceInner({
  effectId,
  layerRef,
  cameraStageRef,
  clipRootRef,
  estateTargetRef,
  balancePanelRef,
  balanceDockRef,
  getBalance,
  onDrain,
  onComplete,
}: HackerEffectInstanceProps) {
  const onDrainRef = useRef(onDrain);
  const onCompleteRef = useRef(onComplete);
  const getBalanceRef = useRef(getBalance);
  const sequenceIdRef = useRef(0);
  const [alertVisible, setAlertVisible] = useState(false);

  onDrainRef.current = onDrain;
  onCompleteRef.current = onComplete;
  getBalanceRef.current = getBalance;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;
    let finished = false;
    let started = false;
    let watchdogId: ReturnType<typeof window.setTimeout> | null = null;

    const clearWatchdog = () => {
      if (watchdogId !== null) {
        window.clearTimeout(watchdogId);
        watchdogId = null;
      }
    };

    const resetVisuals = () => {
      audioManager.stopHackerSound();
      setAlertVisible(false);
      stopHackerMatrixLoop();
      clearHackerMatrixCanvas();

      const layer = layerRef.current;
      const cameraStage = cameraStageRef.current;
      const clipRoot = clipRootRef.current;
      const estate = estateTargetRef.current;
      const balancePanel = balancePanelRef.current;
      const balanceDock = balanceDockRef.current;

      estate?.classList.remove('hacker-estate-reveal');
      if (balancePanel && balanceDock) resetHackerPanelZoom(balancePanel, balanceDock);
      else balancePanel?.classList.remove('hacker-counter-hacked');
      if (cameraStage) resetTrumpCamera(cameraStage, clipRoot);
      if (layer) resetHackerLayerTransition(layer);
    };

    const finishEffect = () => {
      if (finished) return;
      finished = true;
      clearWatchdog();
      resetVisuals();
      onCompleteRef.current();
    };

    const shouldAbort = () =>
      cancelled || sequenceId !== sequenceIdRef.current;

    const armWatchdog = () => {
      clearWatchdog();
      watchdogId = window.setTimeout(() => {
        watchdogId = null;
        if (!finished && sequenceId === sequenceIdRef.current) {
          finishEffect();
        }
      }, HACKER_MAX_DURATION_MS);
    };

    async function runEffect() {
      armWatchdog();
      try {
        const ready = await waitForRefs(
          [
            layerRef,
            cameraStageRef,
            clipRootRef,
            estateTargetRef,
            balancePanelRef,
            balanceDockRef,
          ],
          60,
        );
        if (!ready) {
          finishEffect();
          return;
        }
        if (shouldAbort()) return;

        started = true;

        const layer = layerRef.current!;
        const cameraStage = cameraStageRef.current!;
        const clipRoot = clipRootRef.current!;
        const estate = estateTargetRef.current!;
        const balancePanel = balancePanelRef.current!;
        const balanceDock = balanceDockRef.current!;

        layer.classList.add('hacker-effect-layer--entering');
        startHackerMatrixLoop();
        audioManager.startHackerSound();

        await animateHackerLayerTransition(layer, 'in', HACKER_ENTER_MS);
        if (shouldAbort()) return;

        layer.classList.remove('hacker-effect-layer--entering');
        layer.classList.add('hacker-effect-layer--active');
        balancePanel.classList.add('hacker-counter-hacked');

        const drainPromise = runHackerMoneyDrain(HACKER_PENALTY, (chunk) => {
          if (shouldAbort()) return;
          onDrainRef.current(chunk);
        });

        await sleepWallClock(Math.floor(HACKER_MATRIX_MS * 0.55));
        if (shouldAbort()) return;

        setAlertVisible(true);
        await sleepWallClock(HACKER_ALERT_MS);
        if (shouldAbort()) return;

        layer.classList.add('hacker-effect-layer--draining');

        const estateFocus = computeStageFocus(estate, cameraStage);
        estate.classList.add('hacker-estate-reveal');

        await animateTrumpCamera({
          stageEl: cameraStage,
          clipEl: clipRoot,
          focusX: estateFocus.x,
          focusY: estateFocus.y,
          zoom: HACKER_ESTATE_ZOOM_IN,
          durationMs: HACKER_ESTATE_ZOOM_IN_MS,
          ease: 'inOut',
        });
        if (shouldAbort()) return;

        await sleepWallClock(HACKER_ESTATE_HOLD_MS);
        if (shouldAbort()) return;

        await animateTrumpCamera({
          stageEl: cameraStage,
          clipEl: clipRoot,
          focusX: estateFocus.x,
          focusY: estateFocus.y,
          zoom: 1,
          durationMs: HACKER_ESTATE_ZOOM_OUT_MS,
          ease: 'inOut',
        });
        if (shouldAbort()) return;

        estate.classList.remove('hacker-estate-reveal');
        resetTrumpCamera(cameraStage, clipRoot);

        await animateHackerPanelZoomIn({
          shellEl: balancePanel,
          dockEl: balanceDock,
        });
        if (shouldAbort()) return;

        await drainPromise;
        if (shouldAbort()) return;

        await animateHackerPanelZoomOut({
          shellEl: balancePanel,
          dockEl: balanceDock,
        });
        if (shouldAbort()) return;

        layer.classList.remove('hacker-effect-layer--draining');
        layer.classList.add('hacker-effect-layer--exiting');
        await animateHackerLayerTransition(layer, 'out', HACKER_EXIT_MS);
        if (shouldAbort()) return;

        layer.classList.remove('hacker-effect-layer--exiting');
        finishEffect();
      } catch {
        if (!finished && sequenceId === sequenceIdRef.current) {
          finishEffect();
        }
      } finally {
        clearWatchdog();
        if (!finished && started && sequenceId === sequenceIdRef.current) {
          finishEffect();
        }
      }
    }

    void runEffect();

    return () => {
      cancelled = true;
      clearWatchdog();
      resetVisuals();
    };
  }, [
    effectId,
    balanceDockRef,
    balancePanelRef,
    cameraStageRef,
    clipRootRef,
    estateTargetRef,
    layerRef,
  ]);

  return (
    <>
      <div className="hacker-effect-flash" aria-hidden />
      <div className="hacker-effect-scanlines" aria-hidden />
      <div
        className={`hacker-effect-alert${alertVisible ? ' hacker-effect-alert--visible' : ''}`}
        role="alert"
      >
        <img
          src={hackerUrl}
          alt=""
          className="hacker-effect-alert__image"
          draggable={false}
        />
        <p className="hacker-effect-alert__title">You have been hacked</p>
      </div>
    </>
  );
}

export const HackerEffectInstance = memo(HackerEffectInstanceInner);
