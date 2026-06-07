/**
 * Short right-to-left hammer cursor with shockwave, sparks, and screen shake.
 * Ported from ai_studio_code (Short Stroke Right-to-Left Hammer).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import {
  HAMMER_HEAD_H,
  HAMMER_HEAD_W,
  HAMMER_LENGTH,
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
  length: number;
  headW: number;
  headH: number;
};

type HammerCursorProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  onHammerImpact?: (payload: HammerImpactPayload) => void;
  enabled?: boolean;
  visible?: boolean;
};

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.rect(x, y, w, h);
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
      vx: -Math.random() * 25 - 5,
      vy: (Math.random() - 0.5) * 10,
      size: Math.random() * 3 + 1,
      color: '#ffdd00',
      life: 1,
    });
  }
}

function drawHammer(
  ctx: CanvasRenderingContext2D,
  hammer: HammerState,
  particles: Particle[],
  shockwaves: Shockwave[],
  screenShakeRef: { value: number },
  onImpact?: (impactX: number, impactY: number, pivotX: number, pivotY: number) => void,
) {
  ctx.save();
  ctx.translate(hammer.x, hammer.y);
  ctx.rotate((hammer.angle * Math.PI) / 180);

  const handleGrad = ctx.createLinearGradient(-5, 0, 5, 0);
  handleGrad.addColorStop(0, '#3e2723');
  handleGrad.addColorStop(0.5, '#795548');
  handleGrad.addColorStop(1, '#3e2723');
  ctx.fillStyle = handleGrad;
  ctx.beginPath();
  roundRectPath(ctx, -5, -hammer.length, 10, hammer.length, 5);
  ctx.fill();

  ctx.translate(0, -hammer.length);

  ctx.shadowBlur = 15;
  ctx.shadowColor = 'black';

  const headGrad = ctx.createLinearGradient(-35, -20, 35, 20);
  headGrad.addColorStop(0, '#333');
  headGrad.addColorStop(0.4, '#fff');
  headGrad.addColorStop(1, '#111');

  ctx.fillStyle = headGrad;
  ctx.beginPath();
  roundRectPath(ctx, -hammer.headW / 2, -hammer.headH / 2, hammer.headW, hammer.headH, 5);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(-hammer.headW / 2, -hammer.headH / 2 + 3, 6, hammer.headH - 6);
  ctx.globalAlpha = 1;

  if (hammer.phase === 'SMASH' && hammer.angle <= -10) {
    const matrix = ctx.getTransform();
    createImpact(matrix.e, matrix.f, particles, shockwaves, screenShakeRef);
    onImpact?.(matrix.e, matrix.f, hammer.x, hammer.y);
    hammer.phase = 'RECOVER';
    hammer.targetAngle = 15;
  }

  ctx.restore();
}

function updateHammer(hammer: HammerState, mouseX: number, mouseY: number) {
  hammer.x += (mouseX - hammer.x) * 0.4;
  hammer.y += (mouseY - hammer.y) * 0.4;

  if (hammer.phase === 'WINDUP') {
    hammer.angle += (hammer.targetAngle - hammer.angle) * 0.5;
    if (Math.abs(hammer.angle - hammer.targetAngle) < 2) {
      hammer.phase = 'SMASH';
      hammer.targetAngle = -25;
    }
  } else if (hammer.phase === 'SMASH') {
    hammer.angle += (hammer.targetAngle - hammer.angle) * 0.75;
  } else {
    hammer.angle += (15 - hammer.angle) * 0.2;
    if (hammer.phase === 'RECOVER' && Math.abs(hammer.angle - 15) < 1) {
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

    const mouse = { x: 0, y: 0 };
    const clickPoint = { x: 0, y: 0 };
    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];
    const screenShakeRef = { value: 0 };

    let impactFiredThisSwing = false;

    const hammer: HammerState = {
      x: 0,
      y: 0,
      angle: 15,
      targetAngle: 15,
      phase: 'IDLE',
      length: HAMMER_LENGTH,
      headW: HAMMER_HEAD_W,
      headH: HAMMER_HEAD_H,
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

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const toLocalCoords = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      const local = toLocalCoords(event.clientX, event.clientY);
      mouse.x = local.x;
      mouse.y = local.y;
    };

    const resetHammer = () => {
      hammer.phase = 'IDLE';
      hammer.targetAngle = 15;
      hammer.angle = 15;
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
      hammer.targetAngle = 45;
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

      updateHammer(hammer, mouse.x, mouse.y);
      updateParticles(particles);
      updateShockwaves(shockwaves);
      drawHammer(ctx, hammer, particles, shockwaves, screenShakeRef, handleImpact);

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    const rect = container.getBoundingClientRect();
    mouse.x = rect.width / 2;
    mouse.y = rect.height / 2;
    hammer.x = mouse.x;
    hammer.y = mouse.y;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
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
