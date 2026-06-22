/**
 * Quaternion rotation for natural dice tumble (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type Quat = {
  w: number;
  x: number;
  y: number;
  z: number;
};

const DEG = Math.PI / 180;

export function quatNormalize(q: Quat): Quat {
  const len = Math.hypot(q.w, q.x, q.y, q.z) || 1;
  return { w: q.w / len, x: q.x / len, y: q.y / len, z: q.z / len };
}

export function quatMultiply(a: Quat, b: Quat): Quat {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  };
}

/** Euler matching CSS `rotateX rotateY rotateZ` (degrees). */
export function quatFromEuler(rotX: number, rotY: number, rotZ: number): Quat {
  const hx = rotX * 0.5 * DEG;
  const hy = rotY * 0.5 * DEG;
  const hz = rotZ * 0.5 * DEG;

  const qx: Quat = { w: Math.cos(hx), x: Math.sin(hx), y: 0, z: 0 };
  const qy: Quat = { w: Math.cos(hy), x: 0, y: Math.sin(hy), z: 0 };
  const qz: Quat = { w: Math.cos(hz), x: 0, y: 0, z: Math.sin(hz) };

  return quatNormalize(quatMultiply(quatMultiply(qx, qy), qz));
}

export function integrateQuaternion(
  q: Quat,
  omegaX: number,
  omegaY: number,
  omegaZ: number,
  dt: number,
): Quat {
  const wx = omegaX * DEG;
  const wy = omegaY * DEG;
  const wz = omegaZ * DEG;
  const speed = Math.hypot(wx, wy, wz);
  if (speed < 1e-7) return q;

  const halfAngle = speed * dt * 0.5;
  const sinHalf = Math.sin(halfAngle);
  const cosHalf = Math.cos(halfAngle);
  const dq: Quat = {
    w: cosHalf,
    x: (wx / speed) * sinHalf,
    y: (wy / speed) * sinHalf,
    z: (wz / speed) * sinHalf,
  };

  return quatNormalize(quatMultiply(q, dq));
}

export function slerpQuaternion(from: Quat, to: Quat, t: number): Quat {
  const p = Math.max(0, Math.min(1, t));
  let dot = from.w * to.w + from.x * to.x + from.y * to.y + from.z * to.z;

  let b = { ...to };
  if (dot < 0) {
    dot = -dot;
    b = { w: -b.w, x: -b.x, y: -b.y, z: -b.z };
  }

  if (dot > 0.9995) {
    return quatNormalize({
      w: from.w + (b.w - from.w) * p,
      x: from.x + (b.x - from.x) * p,
      y: from.y + (b.y - from.y) * p,
      z: from.z + (b.z - from.z) * p,
    });
  }

  const theta = Math.acos(Math.min(1, dot));
  const sinTheta = Math.sin(theta);
  const aW = Math.sin((1 - p) * theta) / sinTheta;
  const bW = Math.sin(p * theta) / sinTheta;

  return quatNormalize({
    w: from.w * aW + b.w * bW,
    x: from.x * aW + b.x * bW,
    y: from.y * aW + b.y * bW,
    z: from.z * aW + b.z * bW,
  });
}

/** CSS matrix3d from quaternion (column-major). */
export function quatToMatrix3d(q: Quat): string {
  const { w, x, y, z } = quatNormalize(q);
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;

  return `matrix3d(
    ${1 - (yy + zz)}, ${xy + wz}, ${xz - wy}, 0,
    ${xy - wz}, ${1 - (xx + zz)}, ${yz + wx}, 0,
    ${xz + wy}, ${yz - wx}, ${1 - (xx + yy)}, 0,
    0, 0, 0, 1
  )`;
}

function randomUnitVec3() {
  const u = Math.random();
  const v = Math.random();
  const theta = Math.PI * 2 * u;
  const z = 2 * v - 1;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
    z,
  };
}

/** One stable spin axis + speed — mimics conserved angular momentum. */
export function createThrowAngularVelocity(vx: number, vy: number) {
  const axis = randomUnitVec3();
  axis.y = axis.y * 0.55 + 0.45;
  const len = Math.hypot(axis.x, axis.y, axis.z) || 1;
  axis.x /= len;
  axis.y /= len;
  axis.z /= len;

  const sign = Math.random() < 0.5 ? -1 : 1;
  const speed = sign * (620 + Math.random() * 480 + Math.abs(vx) * 0.35 + vy * 0.2);

  return {
    omegaX: axis.x * speed,
    omegaY: axis.y * speed,
    omegaZ: axis.z * speed,
  };
}

export function randomInitialQuaternion(travelSign: number): Quat {
  const leadY = travelSign > 0 ? 0 : 180;
  return quatFromEuler(
    (Math.random() - 0.5) * 40,
    leadY + (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 28,
  );
}
