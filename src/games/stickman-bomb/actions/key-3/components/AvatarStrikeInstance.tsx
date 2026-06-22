/**
 * One avatar archer frame instance inside the shared strike layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs, type Point2 } from '../../shared/animationUtils';
import { avatarStrikeFrameUrl } from '../config/avatarStrikeAssets';
import {
  ARCHER_FRAME_CSS_WIDTH,
  AVATAR_STRIKE_ARROW_COUNT,
  AVATAR_STRIKE_ARROW_FLIGHT_MS,
  AVATAR_STRIKE_ARROW_INTERVAL_MS,
  AVATAR_STRIKE_BOW_AIM_MS,
  AVATAR_STRIKE_FADE_MS,
  AVATAR_STRIKE_FLOAT_ENTITY_SIZE,
} from '../config/avatarStrikeConfig';
import {
  cancelArrowFlightsFor,
  createFlightGroup,
  flyArrow,
} from '../logic/arrowFlightMotion';
import {
  aimAngle,
  ARCHER_FRAME_AVATAR_LAYOUT,
  ARCHER_FRAME_CSS_HEIGHT,
  ARCHER_FRAME_LAUNCH_LAYOUT,
  bowAimRotation,
  nockFromPortal,
} from '../logic/avatarStrikeGeometry';
import { startAvatarFloat } from '../logic/avatarFloatMotion';
import {
  spawnArrowLaunchEffect,
  spawnArrowStickEffect,
} from '../logic/spawnArrowEffects';

const ESTATE_TARGET_MARGIN_X = { min: 0.18, max: 0.82 };
const ESTATE_TARGET_MARGIN_Y = { min: 0.22, max: 0.46 };

function randomEstateTarget(
  bx: number,
  by: number,
  bw: number,
  bh: number,
): Point2 {
  const xRatio =
    ESTATE_TARGET_MARGIN_X.min +
    Math.random() * (ESTATE_TARGET_MARGIN_X.max - ESTATE_TARGET_MARGIN_X.min);
  const yRatio =
    ESTATE_TARGET_MARGIN_Y.min +
    Math.random() * (ESTATE_TARGET_MARGIN_Y.max - ESTATE_TARGET_MARGIN_Y.min);
  return { x: bx + bw * xRatio, y: by + bh * yRatio };
}

function buildArrowTargets(
  estateRect: DOMRect,
  containerRect: DOMRect,
  count: number,
): Point2[] {
  const bx = estateRect.left - containerRect.left;
  const by = estateRect.top - containerRect.top;
  const bw = estateRect.width;
  const bh = estateRect.height;
  const targets: Point2[] = [];

  for (let i = 0; i < count; i++) {
    targets.push(randomEstateTarget(bx, by, bw, bh));
  }

  return targets;
}

function resolveShotAim(
  portalPos: Point2,
  target: Point2,
): { nockStart: Point2; angleRad: number } {
  const nockStart = nockFromPortal(portalPos.x, portalPos.y);
  return { nockStart, angleRad: aimAngle(nockStart, target) };
}

function setBowAim(bowAimEl: HTMLElement, aimAngleRad: number) {
  bowAimEl.style.setProperty('--bow-aim-rot', `${bowAimRotation(aimAngleRad)}rad`);
}

async function aimBowAtTarget(
  bowAimEl: HTMLElement,
  getPortalPos: () => Point2,
  target: Point2,
): Promise<{ nockStart: Point2; angleRad: number }> {
  const portalPos = getPortalPos();
  const preview = resolveShotAim(portalPos, target);
  setBowAim(bowAimEl, preview.angleRad);
  if (AVATAR_STRIKE_BOW_AIM_MS > 0) {
    await sleep(AVATAR_STRIKE_BOW_AIM_MS);
  }
  return resolveShotAim(getPortalPos(), target);
}

type AvatarStrikeInstanceProps = {
  strikeId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  avatarUrl?: string;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onArrowHit: () => void;
  onComplete: () => void;
};

function AvatarStrikeInstanceInner({
  strikeId,
  layerRef,
  avatarUrl,
  gameplayTargetRef,
  onArrowHit,
  onComplete,
}: AvatarStrikeInstanceProps) {
  const portalWrapRef = useRef<HTMLDivElement>(null);
  const frameUnitRef = useRef<HTMLDivElement>(null);
  const bowAimRef = useRef<HTMLDivElement>(null);
  const onArrowHitRef = useRef(onArrowHit);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onArrowHitRef.current = onArrowHit;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;
    let floatController: ReturnType<typeof startAvatarFloat> | null = null;
    const flightGroup = createFlightGroup();
    const frameUnit = frameUnitRef.current;
    const portalWrap = portalWrapRef.current;

    frameUnit?.classList.remove('avatar-strike-frame-fade', 'avatar-strike-frame-drifting');
    portalWrap?.classList.remove('avatar-strike-portal-fade');

    async function runStrike() {
      const ready = await waitForRefs([
        layerRef,
        portalWrapRef,
        frameUnitRef,
        bowAimRef,
        gameplayTargetRef,
      ]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const layer = layerRef.current!;
      const portalWrap = portalWrapRef.current!;
      const frameEl = frameUnitRef.current!;
      const estate = gameplayTargetRef.current!;
      const layerRect = layer.getBoundingClientRect();
      const estateRect = estate.getBoundingClientRect();

      frameEl.style.setProperty('--archer-frame-w', `${ARCHER_FRAME_CSS_WIDTH}px`);
      frameEl.style.setProperty('--archer-frame-h', `${ARCHER_FRAME_CSS_HEIGHT}px`);
      frameEl.style.setProperty('--avatar-hole-cx-w', String(ARCHER_FRAME_AVATAR_LAYOUT.cxW));
      frameEl.style.setProperty('--avatar-hole-cy-h', String(ARCHER_FRAME_AVATAR_LAYOUT.cyH));
      frameEl.style.setProperty('--avatar-hole-size-px', `${ARCHER_FRAME_AVATAR_LAYOUT.sizePx}px`);
      frameEl.style.setProperty('--launch-left-w', String(ARCHER_FRAME_LAUNCH_LAYOUT.leftW));
      frameEl.style.setProperty('--launch-top-h', String(ARCHER_FRAME_LAUNCH_LAYOUT.topH));
      frameEl.classList.remove('avatar-strike-frame-fade');
      portalWrap.classList.remove('avatar-strike-portal-fade');
      frameEl.classList.add('avatar-strike-frame-drifting');
      floatController = startAvatarFloat(
        portalWrap,
        layerRect.width,
        layerRect.height,
        AVATAR_STRIKE_FLOAT_ENTITY_SIZE,
      );

      const getPortalPos = () => floatController?.getPosition() ?? { x: 0, y: 0 };
      const targets = buildArrowTargets(estateRect, layerRect, AVATAR_STRIKE_ARROW_COUNT);
      const bowAimEl = bowAimRef.current!;

      for (let i = 0; i < AVATAR_STRIKE_ARROW_COUNT; i++) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;

        const target = targets[i];
        const { nockStart, angleRad } = await aimBowAtTarget(
          bowAimEl,
          getPortalPos,
          target,
        );
        if (cancelled || sequenceId !== sequenceIdRef.current) return;

        spawnArrowLaunchEffect(layer, nockStart, angleRad);

        await flyArrow(flightGroup, nockStart, target, AVATAR_STRIKE_ARROW_FLIGHT_MS);
        if (cancelled || sequenceId !== sequenceIdRef.current) return;

        spawnArrowStickEffect(layer, target, angleRad);
        onArrowHitRef.current();

        if (i < AVATAR_STRIKE_ARROW_COUNT - 1) {
          await sleep(AVATAR_STRIKE_ARROW_INTERVAL_MS);
        }
      }

      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      floatController?.stop();
      floatController = null;
      frameEl.classList.remove('avatar-strike-frame-drifting');
      frameEl.classList.add('avatar-strike-frame-fade');
      portalWrap.classList.add('avatar-strike-portal-fade');
      await sleep(AVATAR_STRIKE_FADE_MS);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      frameEl.classList.remove('avatar-strike-frame-fade');
      portalWrap.classList.remove('avatar-strike-portal-fade');
      onCompleteRef.current();
    }

    void runStrike();

    return () => {
      cancelled = true;
      floatController?.stop();
      cancelArrowFlightsFor(flightGroup);
      frameUnitRef.current?.classList.remove('avatar-strike-frame-drifting', 'avatar-strike-frame-fade');
      bowAimRef.current?.style.removeProperty('--bow-aim-rot');
      portalWrapRef.current?.classList.remove('avatar-strike-portal-fade');
    };
  }, [strikeId, gameplayTargetRef, layerRef]);

  const showFallback = !avatarUrl?.trim();

  return (
    <div
      ref={portalWrapRef}
      className="avatar-strike-portal-wrap"
      style={{ zIndex: 32 + (strikeId % 20) }}
    >
      <div
        ref={frameUnitRef}
        className="avatar-strike-archer-frame"
        style={{
          ['--avatar-hole-cx-w' as string]: ARCHER_FRAME_AVATAR_LAYOUT.cxW,
          ['--avatar-hole-cy-h' as string]: ARCHER_FRAME_AVATAR_LAYOUT.cyH,
          ['--avatar-hole-size-px' as string]: `${ARCHER_FRAME_AVATAR_LAYOUT.sizePx}px`,
          ['--launch-left-w' as string]: ARCHER_FRAME_LAUNCH_LAYOUT.leftW,
          ['--launch-top-h' as string]: ARCHER_FRAME_LAUNCH_LAYOUT.topH,
        }}
        aria-hidden
      >
        <div ref={bowAimRef} className="avatar-strike-bow-aim">
          <div className="avatar-strike-avatar-hole">
            {showFallback ? (
              <span className="avatar-strike-fallback" aria-hidden>
                ☺
              </span>
            ) : (
              <img
                src={avatarUrl}
                alt=""
                className="avatar-strike-img"
                draggable={false}
                loading="eager"
                decoding="async"
              />
            )}
          </div>
          <img
            src={avatarStrikeFrameUrl}
            alt=""
            className="avatar-strike-frame-img"
            draggable={false}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export const AvatarStrikeInstance = memo(AvatarStrikeInstanceInner);
