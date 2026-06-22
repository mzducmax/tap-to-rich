/**
 * Gun mode — scope view, click to fire.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import {
  SCOPE_LENS_EDGE_ALPHA,
  SCOPE_LENS_RATIO,
  SCOPE_OUTER_DIM_COLOR,
  SHEEP_SHOT_COOLDOWN_MS,
  SHEEP_SHOT_TRAVEL_MS,
} from '../styles/scopeStyles';

const STICK = '#1a1a1a';

type ActiveShot = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startMs: number;
  fired: boolean;
};

type SheepAimShootProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
  canShootSheep?: boolean;
  onFire: (x: number, y: number) => void;
};

function lensRadius(width: number, height: number) {
  return Math.min(width, height) * SCOPE_LENS_RATIO;
}

function drawScopeLens(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
) {
  const radius = lensRadius(width, height);

  ctx.save();

  ctx.fillStyle = SCOPE_OUTER_DIM_COLOR;
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
  ctx.fill('evenodd');

  const lensGrad = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius);
  lensGrad.addColorStop(0, 'rgba(180, 210, 170, 0.04)');
  lensGrad.addColorStop(0.72, 'rgba(40, 70, 45, 0.06)');
  lensGrad.addColorStop(1, `rgba(0, 0, 0, ${SCOPE_LENS_EDGE_ALPHA})`);
  ctx.fillStyle = lensGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = STICK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
  return radius;
}

function drawReticle(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = STICK;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  const gap = 7;
  const arm = 34;

  ctx.beginPath();
  ctx.moveTo(cx - arm, cy);
  ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy);
  ctx.lineTo(cx + arm, cy);
  ctx.moveTo(cx, cy - arm);
  ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap);
  ctx.lineTo(cx, cy + arm);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy);
  ctx.lineTo(cx - 10, cy);
  ctx.moveTo(cx + 10, cy);
  ctx.lineTo(cx + 18, cy);
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx, cy - 10);
  ctx.moveTo(cx, cy + 10);
  ctx.lineTo(cx, cy + 18);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = STICK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (const offset of [-22, 22]) {
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + offset, cy - 4);
    ctx.lineTo(cx + offset, cy + 4);
    ctx.stroke();
  }

  ctx.restore();
}

function drawProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = STICK;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function SheepAimShoot({
  containerRef,
  enabled = true,
  canShootSheep = false,
  onFire,
}: SheepAimShootProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const onFireRef = useRef(onFire);
  const canShootSheepRef = useRef(canShootSheep);
  onFireRef.current = onFire;
  canShootSheepRef.current = canShootSheep;

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mouse = { x: 0, y: 0 };
    const lastFireMsRef = { value: 0 };
    const activeShots: ActiveShot[] = [];

    const updateScopeOrigin = (x: number, y: number) => {
      container.style.setProperty('--scope-x', `${x}px`);
      container.style.setProperty('--scope-y', `${y}px`);
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

    const queueShot = (toX: number, toY: number) => {
      if (!canShootSheepRef.current) return;

      const now = performance.now();
      if (now - lastFireMsRef.value < SHEEP_SHOT_COOLDOWN_MS) return;
      lastFireMsRef.value = now;

      activeShots.push({
        fromX: toX,
        fromY: toY,
        toX,
        toY,
        startMs: now,
        fired: false,
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const local = toLocalCoords(event.clientX, event.clientY);
      mouse.x = local.x;
      mouse.y = local.y;
      updateScopeOrigin(local.x, local.y);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const local = toLocalCoords(event.clientX, event.clientY);
      mouse.x = local.x;
      mouse.y = local.y;
      updateScopeOrigin(local.x, local.y);
      queueShot(local.x, local.y);
    };

    const draw = (now: number) => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      drawScopeLens(ctx, width, height, mouse.x, mouse.y);
      drawReticle(ctx, mouse.x, mouse.y);

      for (let i = activeShots.length - 1; i >= 0; i--) {
        const shot = activeShots[i];
        const elapsed = now - shot.startMs;

        if (!shot.fired && elapsed >= SHEEP_SHOT_TRAVEL_MS * 0.35) {
          shot.fired = true;
          onFireRef.current(shot.toX, shot.toY);
        }

        if (elapsed > 120) {
          activeShots.splice(i, 1);
          continue;
        }

        const t = Math.min(1, elapsed / SHEEP_SHOT_TRAVEL_MS);
        const flashAlpha = 1 - t;
        ctx.save();
        ctx.globalAlpha = flashAlpha * 0.85;
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(shot.toX, shot.toY, 8 + t * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        drawProjectile(ctx, shot.toX, shot.toY - t * 28, -Math.PI / 2);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    const rect = container.getBoundingClientRect();
    mouse.x = rect.width / 2;
    mouse.y = rect.height / 2;
    updateScopeOrigin(mouse.x, mouse.y);

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
