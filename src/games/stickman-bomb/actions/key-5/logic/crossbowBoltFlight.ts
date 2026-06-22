/**
 * Energy bolt flights from crossbow crystal tip toward the estate.
 * Quadratic Bezier sweep — slight homing arc before impact.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import {
  DIVINE_CROSSBOW_BOLT_CURVE_BIAS,
  DIVINE_CROSSBOW_BOLT_CURVE_RATIO,
  DIVINE_CROSSBOW_BOLT_LEN,
} from '../config/divineCrossbowConfig';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';

type BoltFlight = {
  el: HTMLElement;
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
  resolve: () => void;
};

const flights: BoltFlight[] = [];
let tickRegistered = false;

function flightProgress(raw: number): number {
  return 1 - (1 - raw) ** 2;
}

function buildBoltCurveControl(start: Point2, end: Point2, curveSide: -1 | 1): Point2 {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bias = DIVINE_CROSSBOW_BOLT_CURVE_BIAS;
  const anchorX = start.x + dx * bias;
  const anchorY = start.y + dy * bias;
  const offset = len * DIVINE_CROSSBOW_BOLT_CURVE_RATIO * curveSide;
  return { x: anchorX + nx * offset, y: anchorY + ny * offset };
}

function sampleQuadratic(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  t: number,
): Point2 {
  const u = 1 - t;
  return {
    x: u * u * p0x + 2 * u * t * p1x + t * t * p2x,
    y: u * u * p0y + 2 * u * t * p1y + t * t * p2y,
  };
}

function tangentQuadratic(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  t: number,
): Point2 {
  const u = 1 - t;
  return {
    x: 2 * u * (p1x - p0x) + 2 * t * (p2x - p1x),
    y: 2 * u * (p1y - p0y) + 2 * t * (p2y - p1y),
  };
}

function setBoltTransform(
  el: HTMLElement,
  tipX: number,
  tipY: number,
  angleRad: number,
  scale: number,
) {
  el.style.transform =
    `translate3d(${tipX}px, ${tipY}px, 0) rotate(${angleRad}rad) scale(${scale})`;
}

function syncTicker() {
  if (flights.length > 0 && !tickRegistered) {
    registerAvatarMotionTick(tickFlights);
    tickRegistered = true;
    return;
  }
  if (flights.length === 0 && tickRegistered) {
    unregisterAvatarMotionTick(tickFlights);
    tickRegistered = false;
  }
}

function tickFlights(now: number) {
  for (let i = flights.length - 1; i >= 0; i--) {
    const flight = flights[i];
    const raw = Math.min((now - flight.startTime) / flight.duration, 1);
    const progress = flightProgress(raw);
    const pos = sampleQuadratic(
      flight.startX,
      flight.startY,
      flight.ctrlX,
      flight.ctrlY,
      flight.endX,
      flight.endY,
      progress,
    );
    const tangent = tangentQuadratic(
      flight.startX,
      flight.startY,
      flight.ctrlX,
      flight.ctrlY,
      flight.endX,
      flight.endY,
      Math.min(progress, 0.995),
    );
    const angleRad = Math.atan2(tangent.y, tangent.x);
    const scale = raw < 0.12 ? 0.55 + raw / 0.12 * 0.45 : 1;

    setBoltTransform(flight.el, pos.x, pos.y, angleRad, scale);

    if (raw < 1) continue;

    flight.el.classList.add('divine-crossbow-bolt-landed');
    flight.resolve();
    flights.splice(i, 1);
  }
  syncTicker();
}

export function flyCrossbowBolt(
  el: HTMLElement,
  start: Point2,
  impact: Point2,
  curveSide: -1 | 1,
  duration: number,
): Promise<void> {
  const control = buildBoltCurveControl(start, impact, curveSide);
  const launchTangent = tangentQuadratic(
    start.x,
    start.y,
    control.x,
    control.y,
    impact.x,
    impact.y,
    0,
  );
  const launchAngle = Math.atan2(launchTangent.y, launchTangent.x);

  setBoltTransform(el, start.x, start.y, launchAngle, 0.55);
  el.classList.remove('divine-crossbow-bolt-landed', 'divine-crossbow-bolt-flying');
  el.classList.add('divine-crossbow-bolt-flying');
  el.style.setProperty('--bolt-len', `${DIVINE_CROSSBOW_BOLT_LEN}px`);

  return new Promise((resolve) => {
    const startTime = performance.now();
    flights.push({
      el,
      startX: start.x,
      startY: start.y,
      ctrlX: control.x,
      ctrlY: control.y,
      endX: impact.x,
      endY: impact.y,
      startTime,
      duration,
      resolve,
    });
    syncTicker();
    tickFlights(startTime);
  });
}

export function cancelCrossbowBoltFlightsFor(elements: Iterable<HTMLElement>) {
  const targets = new Set(elements);
  for (let i = flights.length - 1; i >= 0; i--) {
    if (!targets.has(flights[i].el)) continue;
    flights[i].resolve();
    flights.splice(i, 1);
  }
  syncTicker();
}
