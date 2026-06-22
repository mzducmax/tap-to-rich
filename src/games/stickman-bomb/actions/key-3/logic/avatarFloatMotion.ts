/**
 * Random floating motion for the avatar strike portal.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  AVATAR_STRIKE_FLOAT_BOB_AMPLITUDE,
  AVATAR_STRIKE_FLOAT_MAX_SEGMENT_MS,
  AVATAR_STRIKE_FLOAT_MAX_Y_RATIO,
  AVATAR_STRIKE_FLOAT_MIN_SEGMENT_MS,
  ARCHER_FRAME_CSS_WIDTH,
} from '../config/avatarStrikeConfig';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from './avatarMotionTicker';
import { setPortalWrapPosition } from './gpuPosition';

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomPoint(
  width: number,
  height: number,
  portalSize: number,
  maxYRatio: number,
): Point2 {
  const pad = portalSize * 0.55;
  const maxY = Math.max(pad + 1, height * maxYRatio - pad);
  return {
    x: pad + Math.random() * Math.max(1, width - pad * 2),
    y: pad + Math.random() * Math.max(1, maxY - pad),
  };
}

export type AvatarFloatController = {
  getPosition: () => Point2;
  stop: () => void;
};

export function startAvatarFloat(
  portalWrap: HTMLElement,
  containerWidth: number,
  containerHeight: number,
  portalSize = ARCHER_FRAME_CSS_WIDTH,
): AvatarFloatController {
  let x = 0;
  let y = 0;
  let fromX = 0;
  let fromY = 0;
  let targetX = 0;
  let targetY = 0;
  let segmentStart = 0;
  let segmentDuration = 0;
  let cancelled = false;
  let pauseOffset = 0;
  let pauseAt: number | null = null;

  const start = randomPoint(
    containerWidth,
    containerHeight,
    portalSize,
    AVATAR_STRIKE_FLOAT_MAX_Y_RATIO,
  );
  x = start.x;
  y = start.y;
  setPortalWrapPosition(portalWrap, x, y);

  function pickNextTarget() {
    fromX = x;
    fromY = y;
    const next = randomPoint(
      containerWidth,
      containerHeight,
      portalSize,
      AVATAR_STRIKE_FLOAT_MAX_Y_RATIO,
    );
    targetX = next.x;
    targetY = next.y;
    segmentStart = performance.now();
    segmentDuration = randomBetween(
      AVATAR_STRIKE_FLOAT_MIN_SEGMENT_MS,
      AVATAR_STRIKE_FLOAT_MAX_SEGMENT_MS,
    );
  }

  pickNextTarget();

  function step(now: number) {
    if (cancelled) return;

    if (isGameplayPaused()) {
      if (pauseAt === null) pauseAt = now;
      return;
    }

    if (pauseAt !== null) {
      pauseOffset += now - pauseAt;
      pauseAt = null;
    }

    const elapsed = now - segmentStart - pauseOffset;
    const raw = Math.min(elapsed / segmentDuration, 1);
    const eased = easeInOutSine(raw);
    const glideX = fromX + (targetX - fromX) * eased;
    const glideY = fromY + (targetY - fromY) * eased;
    const bob =
      Math.sin(elapsed * 0.0055) * AVATAR_STRIKE_FLOAT_BOB_AMPLITUDE +
      Math.sin(elapsed * 0.009 + 1.2) * AVATAR_STRIKE_FLOAT_BOB_AMPLITUDE * 0.45;

    x = glideX;
    y = glideY + bob;
    setPortalWrapPosition(portalWrap, x, y);

    if (raw >= 1) {
      pauseOffset = 0;
      pickNextTarget();
    }
  }

  registerAvatarMotionTick(step);

  return {
    getPosition: () => ({ x, y }),
    stop: () => {
      cancelled = true;
      unregisterAvatarMotionTick(step);
    },
  };
}
