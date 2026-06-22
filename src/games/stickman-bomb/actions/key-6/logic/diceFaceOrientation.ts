/**
 * CSS 3D orientations so a given face points up (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { quatFromEuler, type Quat } from './diceQuaternion';

export type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

export type DiceOrientation = {
  rotX: number;
  rotY: number;
  rotZ: number;
};

const FACE_UP: Record<DiceFace, DiceOrientation> = {
  1: { rotX: 0, rotY: 0, rotZ: 0 },
  6: { rotX: 0, rotY: 180, rotZ: 0 },
  2: { rotX: 0, rotY: -90, rotZ: 0 },
  5: { rotX: 0, rotY: 90, rotZ: 0 },
  3: { rotX: -90, rotY: 0, rotZ: 0 },
  4: { rotX: 90, rotY: 0, rotZ: 0 },
};

export function orientationForFace(face: number): DiceOrientation {
  const clamped = Math.max(1, Math.min(6, Math.floor(face))) as DiceFace;
  return FACE_UP[clamped];
}

export function quatForFace(face: number): Quat {
  const orient = orientationForFace(face);
  return quatFromEuler(orient.rotX, orient.rotY, orient.rotZ);
}

/** Shortest-path interpolation between two angles (degrees). */
function lerpAngle(from: number, to: number, t: number): number {
  const delta = ((((to - from) % 360) + 540) % 360) - 180;
  return from + delta * t;
}

export function lerpOrientation(
  from: DiceOrientation,
  to: DiceOrientation,
  t: number,
): DiceOrientation {
  const p = Math.max(0, Math.min(1, t));
  return {
    rotX: lerpAngle(from.rotX, to.rotX, p),
    rotY: lerpAngle(from.rotY, to.rotY, p),
    rotZ: lerpAngle(from.rotZ, to.rotZ, p),
  };
}

/** Ease-out cubic for settle snap. */
export function easeOutCubic(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  return 1 - (1 - p) ** 3;
}
