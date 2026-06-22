/**
 * Dice toss physics on the estate roof (key 6).
 * Quaternion rotation — no euler gimbal wobble or forced roll steering.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  DICE_AIR_DRAG,
  DICE_ANGULAR_DAMP_AIR,
  DICE_ANGULAR_DAMP_GROUND,
  DICE_FRICTION,
  DICE_GRAVITY,
  DICE_HALF,
  DICE_MAX_SPIN,
  DICE_RESTITUTION,
  DICE_ROLL_DECAY,
  DICE_SETTLE_FRAMES,
  DICE_SETTLE_SPEED,
  DICE_SETTLE_SPIN,
  DICE_SIZE,
} from '../config/diceRollConfig';
import type { DiceFace } from './diceFaceOrientation';
import {
  createThrowAngularVelocity,
  integrateQuaternion,
  randomInitialQuaternion,
  type Quat,
} from './diceQuaternion';

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type DiceBody = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  quat: Quat;
  omegaX: number;
  omegaY: number;
  omegaZ: number;
};

export type DiceSimState = {
  body: DiceBody;
  face: DiceFace;
  multiplier: number;
  platformY: number;
  minX: number;
  maxX: number;
  onPlatform: boolean;
  airborne: boolean;
  bounceCount: number;
  settleFrames: number;
  stopped: boolean;
};

function capSpin(body: DiceBody, maxMag: number) {
  const mag = Math.hypot(body.omegaX, body.omegaY, body.omegaZ);
  if (mag <= maxMag || mag < 1e-6) return;
  const scale = maxMag / mag;
  body.omegaX *= scale;
  body.omegaY *= scale;
  body.omegaZ *= scale;
}

function dampSpin(body: DiceBody, factor: number) {
  body.omegaX *= factor;
  body.omegaY *= factor;
  body.omegaZ *= factor;
}

function rollTumbleRate(vx: number): number {
  return -(vx / DICE_SIZE) * 285;
}

function transferImpactSpin(body: DiceBody, impact: number, vx: number) {
  const sign = Math.sign(vx || 1);
  body.omegaY += sign * impact * 0.048 + vx * 0.12;
  body.omegaX += sign * impact * 0.018;
  body.omegaZ += impact * 0.008 * (Math.random() < 0.5 ? -1 : 1);
  capSpin(body, DICE_MAX_SPIN);
}

function applyGroundFriction(body: DiceBody) {
  const absVx = Math.abs(body.vx);
  if (absVx < 3) {
    dampSpin(body, 0.9);
    return;
  }

  const rollOmega = rollTumbleRate(body.vx);
  body.omegaY += (rollOmega - body.omegaY) * 0.04;
  body.omegaX *= 0.93;
  body.omegaZ *= 0.91;
  capSpin(body, DICE_MAX_SPIN);
}

export function createDiceSim(estate: Rect, multiplier: number): DiceSimState {
  const face = (Math.floor(Math.random() * 6) + 1) as DiceFace;
  const platformY = estate.top + DICE_HALF + 8;
  const minX = estate.left + DICE_HALF + 6;
  const maxX = estate.right - DICE_HALF - 6;
  const span = Math.max(12, maxX - minX);
  const x = minX + span * 0.25 + Math.random() * span * 0.5;
  const vx = (Math.random() - 0.5) * 220;
  const vy = 20 + Math.random() * 45;
  const travelSign = Math.sign(vx || 1);
  const spin = createThrowAngularVelocity(vx, vy);

  return {
    body: {
      x,
      y: estate.top - DICE_SIZE * (4.5 + Math.random() * 2),
      vx,
      vy,
      quat: randomInitialQuaternion(travelSign),
      ...spin,
    },
    face,
    multiplier,
    platformY,
    minX,
    maxX,
    onPlatform: false,
    airborne: true,
    bounceCount: 0,
    settleFrames: 0,
    stopped: false,
  };
}

export function stepDiceSim(sim: DiceSimState, dt: number): void {
  if (sim.stopped) return;

  const body = sim.body;
  sim.airborne = body.y < sim.platformY - 0.5;

  body.vy += DICE_GRAVITY * dt;
  body.vx *= 1 - DICE_AIR_DRAG * dt * 0.35;
  if (sim.airborne) {
    body.vy *= 1 - DICE_AIR_DRAG * dt * 0.08;
  }

  body.x += body.vx * dt;
  body.y += body.vy * dt;

  body.quat = integrateQuaternion(
    body.quat,
    body.omegaX,
    body.omegaY,
    body.omegaZ,
    dt,
  );

  if (sim.airborne) {
    const airDamp = Math.exp(-DICE_ANGULAR_DAMP_AIR * dt);
    dampSpin(body, airDamp);
    capSpin(body, DICE_MAX_SPIN);
  }

  if (body.x < sim.minX) {
    body.x = sim.minX;
    body.vx = Math.abs(body.vx) * DICE_RESTITUTION;
    if (!sim.airborne) body.omegaY += body.vx * 0.1;
    capSpin(body, DICE_MAX_SPIN);
  } else if (body.x > sim.maxX) {
    body.x = sim.maxX;
    body.vx = -Math.abs(body.vx) * DICE_RESTITUTION;
    if (!sim.airborne) body.omegaY += body.vx * 0.1;
    capSpin(body, DICE_MAX_SPIN);
  }

  if (body.y >= sim.platformY) {
    body.y = sim.platformY;
    const impact = Math.abs(body.vy);

    if (!sim.onPlatform || impact > 28) {
      sim.bounceCount += 1;
      const bounceEnergy =
        sim.bounceCount <= 2
          ? DICE_RESTITUTION
          : sim.bounceCount <= 4
            ? DICE_RESTITUTION * 0.42
            : DICE_RESTITUTION * 0.16;

      body.vy = -impact * bounceEnergy;
      body.vx = body.vx * DICE_FRICTION + (Math.random() - 0.5) * 55;
      transferImpactSpin(body, impact, body.vx);

      if (impact > 75 && sim.bounceCount <= 3) {
        sim.airborne = true;
        const kick = impact * 0.18 * (Math.random() < 0.5 ? -1 : 1);
        body.omegaX += kick * 0.4;
        body.omegaY += kick * 0.5;
        body.omegaZ += kick * 0.35;
        capSpin(body, DICE_MAX_SPIN);
      }
    } else if (impact > 5) {
      body.vy = -impact * 0.12;
      body.vx *= 0.93;
      transferImpactSpin(body, impact * 0.3, body.vx);
    } else {
      body.vy = 0;
    }

    sim.onPlatform = true;
    if (!sim.airborne) {
      dampSpin(body, DICE_ANGULAR_DAMP_GROUND);
    }
  } else {
    sim.onPlatform = false;
    sim.settleFrames = 0;
  }

  if (sim.onPlatform && !sim.airborne) {
    body.vx *= DICE_ROLL_DECAY;
    applyGroundFriction(body);
    const speed = Math.hypot(body.vx, body.vy);
    const spin = Math.hypot(body.omegaX, body.omegaY, body.omegaZ);

    if (sim.bounceCount >= 1 && speed < DICE_SETTLE_SPEED && spin < DICE_SETTLE_SPIN) {
      sim.settleFrames += 1;
    } else {
      sim.settleFrames = 0;
    }

    if (sim.settleFrames >= DICE_SETTLE_FRAMES) {
      sim.stopped = true;
      body.vx = 0;
      body.vy = 0;
      body.omegaX = 0;
      body.omegaY = 0;
      body.omegaZ = 0;
    }
  }
}

export { DICE_SIZE };
