/**
 * Downward hammer cursor — raises back, smashes straight down on click.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import {
  HAMMER_HEAD_NORM_X,
  HAMMER_HEAD_NORM_Y,
  HAMMER_IDLE_ANGLE,
  HAMMER_IMPACT_ANGLE,
  HAMMER_PIVOT_NORM_X,
  HAMMER_PIVOT_NORM_Y,
  HAMMER_SMASH_ANGLE,
  HAMMER_SMASH_DROP_Y,
  HAMMER_SPRITE_ANGLE_OFFSET,
  HAMMER_SPRITE_SIZE,
  HAMMER_SPRITE_URL,
  HAMMER_STRIKE_PIVOT_OFFSET_Y,
  HAMMER_WINDUP_ANGLE,
  HAMMER_WINDUP_LIFT_Y,
} from '../config/hammerConfig';

export type HammerImpactPayload = {
  impactX: number;
  impactY: number;
  pivotX: number;
  pivotY: number;
  clickX: number;
  clickY: number;
};

type HammerPhase = 'IDLE' | 'WINDUP' | 'SMASH' | 'RECOVER';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
};

type Shockwave = {
  x: number;
  y: number;
  r: number;
  opacity: number;
};

type HammerState = {
  x: number;
  y: number;
  angle: number;
  targetAngle: number;
  phase: HammerPhase;
};

type HammerCursorProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  onHammerImpact?: (payload: HammerImpactPayload) => void;
  enabled?: boolean;
  visible?: boolean;
};

function getHeadLocalOffset(spriteSize: number) {
  return {
    x: (HAMMER_HEAD_NORM_X - HAMMER_PIVOT_NORM_X) * spriteSize,
    y: (HAMMER_HEAD_NORM_Y - HAMMER_PIVOT_NORM_Y) * spriteSize,
  };
}

function getHeadWorldPosition(hammer: HammerState, spriteSize: number) {
  const { x: localX, y: localY } = getHeadLocalOffset(spriteSize);
  const rad = ((hammer.angle + HAMMER_SPRITE_ANGLE_OFFSET) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: hammer.x + localX * cos - localY * sin,
    y: hammer.y + localX * sin + localY * cos,
  };
}

function createImpact(
  x: number,
  y: number,
  particles: Particle[],
  shockwaves: Shockwave[],
  screenShakeRef: { value: number },
) {
  screenShakeRef.value = 18;
  shockwaves.push({ x, y, r: 0, opacity: 1 });

  for (let i = 0; i < 15; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * 18 + 4,
      size: Math.random() * 3 + 1,
      color: '#ffdd00',
      life: 1,
    });
  }
}

function drawHammer(
  ctx: CanvasRenderingContext2D,
  hammer: HammerState,
  hammerImg: HTMLImageElement,
  particles: Particle[],
  shockwaves: Shockwave[],
  screenShakeRef: { value: number },
  spriteSize: number,
  onImpact?: (impactX: number, impactY: number, pivotX: number, pivotY: number) => void,
) {
  const pivotX = HAMMER_PIVOT_NORM_X * spriteSize;
  const pivotY = HAMMER_PIVOT_NORM_Y * spriteSize;

  ctx.save();
  ctx.translate(hammer.x, hammer.y);
  ctx.rotate(((hammer.angle + HAMMER_SPRITE_ANGLE_OFFSET) * Math.PI) / 180);
  ctx.drawImage(hammerImg, -pivotX, -pivotY, spriteSize, spriteSize);

  if (hammer.phase === 'SMASH' && hammer.angle <= HAMMER_IMPACT_ANGLE) {
    const head = getHeadWorldPosition(hammer, spriteSize);
    createImpact(head.x, head.y, particles, shockwaves, screenShakeRef);
    onImpact?.(head.x, head.y, hammer.x, hammer.y);
    hammer.phase = 'RECOVER';
    hammer.targetAngle = HAMMER_IDLE_ANGLE;
  }

  ctx.restore();
}

function getHammerTarget(
  phase: HammerPhase,
  mouseX: number,
  mouseY: number,
  clickX: number,
  clickY: number,
  strikePivotOffsetY: number,
) {
  if (phase === 'WINDUP' || phase === 'SMASH' || phase === 'RECOVER') {
    // Follow the live cursor during the swing so the hammer never freezes
    // in one spot. Add a phase-based vertical travel so the whole hammer
    // physically lifts on windup then drops on the smash instead of just
    // rotating around a fixed hand point (which reads as frozen).
    let swingLift = 0;
    if (phase === 'WINDUP') swingLift = HAMMER_WINDUP_LIFT_Y;
    else if (phase === 'SMASH') swingLift = HAMMER_SMASH_DROP_Y;
    return {
      x: mouseX,
      y: mouseY - strikePivotOffsetY + swingLift,
    };
  }

  return { x: mouseX, y: mouseY };
}

function updateHammer(
  hammer: HammerState,
  mouseX: number,
  mouseY: number,
  clickX: number,
  clickY: number,
  strikePivotOffsetY: number,
) {
  const target = getHammerTarget(
    hammer.phase,
    mouseX,
    mouseY,
    clickX,
    clickY,
    strikePivotOffsetY,
  );
  hammer.x += (target.x - hammer.x) * 0.45;
  hammer.y += (target.y - hammer.y) * 0.45;

  if (hammer.phase === 'WINDUP') {
    hammer.angle += (hammer.targetAngle - hammer.angle) * 0.5;
    if (Math.abs(hammer.angle - hammer.targetAngle) < 2) {
      hammer.phase = 'SMASH';
      hammer.targetAngle = HAMMER_SMASH_ANGLE;
    }
  } else if (hammer.phase === 'SMASH') {
    hammer.angle += (hammer.targetAngle - hammer.angle) * 0.78;
  } else {
    hammer.angle += (HAMMER_IDLE_ANGLE - hammer.angle) * 0.2;
    if (hammer.phase === 'RECOVER' && Math.abs(hammer.angle - HAMMER_IDLE_ANGLE) < 1) {
      hammer.phase = 'IDLE';
    }
  }
}

function updateParticles(particles: Particle[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.8;
    p.life -= 0.04;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function updateShockwaves(shockwaves: Shockwave[]) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const s = shockwaves[i];
    s.r += 18;
    s.opacity -= 0.08;
    if (s.opacity <= 0) shockwaves.splice(i, 1);
  }
}

export function HammerCursor({
  containerRef,
  onHammerImpact,
  enabled = true,
  visible = true,
}: HammerCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const onHammerImpactRef = useRef(onHammerImpact);
  const visibleRef = useRef(visible);
  onHammerImpactRef.current = onHammerImpact;
  visibleRef.current = visible;

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hammerImg = new Image();
    let hammerReady = false;
    hammerImg.onload = () => {
      hammerReady = true;
    };
    hammerImg.src = HAMMER_SPRITE_URL;

    const mouse = { x: 0, y: 0 };
    const clickPoint = { x: 0, y: 0 };
    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];
    const screenShakeRef = { value: 0 };
    const hammerScaleRef = {
      size: HAMMER_SPRITE_SIZE,
      strikeOffsetY: HAMMER_STRIKE_PIVOT_OFFSET_Y,
    };

    let impactFiredThisSwing = false;

    const hammer: HammerState = {
      x: 0,
      y: 0,
      angle: HAMMER_IDLE_ANGLE,
      targetAngle: HAMMER_IDLE_ANGLE,
      phase: 'IDLE',
    };

    const handleImpact = (
      impactX: number,
      impactY: number,
      pivotX: number,
      pivotY: number,
    ) => {
      if (impactFiredThisSwing || !onHammerImpactRef.current) return;
      impactFiredThisSwing = true;
      onHammerImpactRef.current({
        impactX,
        impactY,
        pivotX,
        pivotY,
        clickX: clickPoint.x,
        clickY: clickPoint.y,
      });
    };

    // Cache the container rect — reading getBoundingClientRect on every
    // mousemove forces a synchronous layout pass, which stutters the whole
    // game at high pointer polling rates.
    let containerRect = container.getBoundingClientRect();

    const resize = () => {
      containerRect = container.getBoundingClientRect();
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;
    };

    const refreshRect = () => {
      containerRect = container.getBoundingClientRect();
    };

    const toLocalCoords = (clientX: number, clientY: number) => ({
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    });

    const handleMouseMove = (event: MouseEvent) => {
      const local = toLocalCoords(event.clientX, event.clientY);
      mouse.x = local.x;
      mouse.y = local.y;
    };

    const resetHammer = () => {
      hammer.phase = 'IDLE';
      hammer.targetAngle = HAMMER_IDLE_ANGLE;
      hammer.angle = HAMMER_IDLE_ANGLE;
      impactFiredThisSwing = false;
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (!visibleRef.current) return;
      const local = toLocalCoords(event.clientX, event.clientY);
      mouse.x = local.x;
      mouse.y = local.y;
      clickPoint.x = local.x;
      clickPoint.y = local.y;
      impactFiredThisSwing = false;
      hammer.phase = 'WINDUP';
      hammer.targetAngle = HAMMER_WINDUP_ANGLE;
    };

    const draw = () => {
      const { width, height } = canvas;

      ctx.save();
      if (screenShakeRef.value > 0) {
        ctx.translate(
          (Math.random() - 0.5) * screenShakeRef.value,
          (Math.random() - 0.5) * screenShakeRef.value,
        );
      }

      ctx.clearRect(0, 0, width, height);

      if (!visibleRef.current) {
        resetHammer();
        hammer.x += (mouse.x - hammer.x) * 0.4;
        hammer.y += (mouse.y - hammer.y) * 0.4;
        ctx.restore();
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      shockwaves.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      particles.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      if (screenShakeRef.value > 0) screenShakeRef.value *= 0.8;

      const targetSize = HAMMER_SPRITE_SIZE;
      const targetOffsetY = HAMMER_STRIKE_PIVOT_OFFSET_Y;
      hammerScaleRef.size += (targetSize - hammerScaleRef.size) * 0.14;
      hammerScaleRef.strikeOffsetY +=
        (targetOffsetY - hammerScaleRef.strikeOffsetY) * 0.14;

      // Keep the impact anchor on the live cursor so the payload matches
      // where the head lands while the hammer tracks the mouse mid-swing.
      clickPoint.x = mouse.x;
      clickPoint.y = mouse.y;

      updateHammer(
        hammer,
        mouse.x,
        mouse.y,
        clickPoint.x,
        clickPoint.y,
        hammerScaleRef.strikeOffsetY,
      );
      updateParticles(particles);
      updateShockwaves(shockwaves);

      if (hammerReady) {
        drawHammer(
          ctx,
          hammer,
          hammerImg,
          particles,
          shockwaves,
          screenShakeRef,
          hammerScaleRef.size,
          handleImpact,
        );
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    mouse.x = containerRect.width / 2;
    mouse.y = containerRect.height / 2;
    hammer.x = mouse.x;
    hammer.y = mouse.y;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', refreshRect, true);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', refreshRect, true);
    };
  }, [containerRef, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
    />
  );
}
