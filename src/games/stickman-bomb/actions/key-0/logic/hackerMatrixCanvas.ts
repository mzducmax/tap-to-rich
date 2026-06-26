/**
 * Single-canvas matrix rain + terminal scroll — one fillRect trail, batched fillText.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  HACKER_MATRIX_COLUMN_PX,
  HACKER_MATRIX_DPR,
  HACKER_MATRIX_FONT_PX,
  HACKER_MATRIX_TRAIL_ALPHA,
} from '../config/hackerEffectConfig';

const MATRIX_CHARS = '01ABCDEF<>[]{}|\\/:$#@&*Mm9FABCbxC';
const TERMINAL_LINES = [
  "Lord Hol Napult <<<< LHN's ZipHack4 >>>> Build.167",
  'Start Psw: Min Lng: 1 Log freq.: 100 Checkpoint:20000 Target:f.zip',
  'KeyGen Password charset_format: <',
  'Dictionary count Words:0 - Processes:1',
  'Combo Charset:',
  '[MAIN] => [1] => [1] - List of Charset Format Options',
  'M = Uppercase chars | m = Lowercase chars | 9 = Numbers 0-9',
  '>> Insert the Password Charset Format: bbb99',
  'ACCESS GRANTED — routing funds...',
  'DECRYPTING wallet.dat [####################] 100%',
  'TRANSFER OUTBOUND $5000 — CONFIRMED',
];

type MatrixColumn = {
  y: number;
  speed: number;
  head: string;
  tail: string;
};

type ScrollLine = {
  text: string;
  y: number;
  speed: number;
};

let canvasEl: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let columns: MatrixColumn[] = [];
let scrollLines: ScrollLine[] = [];
let cssWidth = 0;
let cssHeight = 0;
let rafId: number | null = null;
let running = false;

function pickChar(): string {
  return MATRIX_CHARS[(Math.random() * MATRIX_CHARS.length) | 0] ?? '0';
}

function buildColumns(width: number, height: number) {
  const count = Math.max(8, Math.ceil(width / HACKER_MATRIX_COLUMN_PX));
  columns = Array.from({ length: count }, () => ({
    y: Math.random() * height,
    speed: 0.35 + Math.random() * 1.15,
    head: pickChar(),
    tail: pickChar(),
  }));

  scrollLines = TERMINAL_LINES.map((text, index) => ({
    text,
    y: height * 0.08 + index * (HACKER_MATRIX_FONT_PX + 5),
    speed: 0.55 + (index % 3) * 0.18,
  }));
}

function syncCanvasSize(width: number, height: number) {
  if (!canvasEl || !ctx) return;
  cssWidth = width;
  cssHeight = height;
  const dpr = HACKER_MATRIX_DPR;
  canvasEl.width = Math.max(1, Math.floor(width * dpr));
  canvasEl.height = Math.max(1, Math.floor(height * dpr));
  canvasEl.style.width = `${width}px`;
  canvasEl.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildColumns(width, height);
}

export function mountHackerMatrixCanvas(
  el: HTMLCanvasElement,
  width: number,
  height: number,
): void {
  canvasEl = el;
  ctx = el.getContext('2d', { alpha: true, desynchronized: true });
  syncCanvasSize(width, height);
}

export function resizeHackerMatrixCanvas(width: number, height: number): void {
  if (!canvasEl || !ctx) return;
  if (width === cssWidth && height === cssHeight) return;
  syncCanvasSize(width, height);
}

export function unmountHackerMatrixCanvas(): void {
  stopHackerMatrixLoop();
  canvasEl = null;
  ctx = null;
  columns = [];
  scrollLines = [];
}

function drawFrame(): void {
  if (!ctx || !canvasEl) return;

  // Fade prior frames toward transparent (keeps the live game visible behind).
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = `rgba(0, 0, 0, ${HACKER_MATRIX_TRAIL_ALPHA})`;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.globalCompositeOperation = 'source-over';

  ctx.font = `${HACKER_MATRIX_FONT_PX}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textBaseline = 'top';

  for (let i = 0; i < columns.length; i += 1) {
    const col = columns[i]!;
    const x = i * HACKER_MATRIX_COLUMN_PX;
    const row = Math.floor(col.y);
    const y = row * HACKER_MATRIX_FONT_PX;

    ctx.fillStyle = 'rgba(0, 255, 65, 0.22)';
    ctx.fillText(col.tail, x, y);

    // Madness: occasional blood-red or blinding-white glitch heads.
    const roll = Math.random();
    if (roll < 0.04) {
      ctx.fillStyle = '#ff2d55';
      ctx.shadowColor = '#ff2d55';
      ctx.shadowBlur = 8;
    } else if (roll < 0.07) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = '#00ff41';
    }
    ctx.fillText(col.head, x, y);
    ctx.shadowBlur = 0;

    // Faster, jittery fall.
    col.y += col.speed * 1.8 + (Math.random() < 0.1 ? 4 : 0);
    if (Math.random() < 0.12) col.head = pickChar();
    if (Math.random() < 0.06) col.tail = pickChar();
    if (y > cssHeight + HACKER_MATRIX_FONT_PX) {
      col.y = -(Math.random() * 12);
      col.head = pickChar();
      col.tail = pickChar();
    }
  }

  // Madness: random horizontal glitch slices — shifted noise bars.
  if (Math.random() < 0.22) {
    const sliceCount = 1 + ((Math.random() * 3) | 0);
    for (let s = 0; s < sliceCount; s += 1) {
      const sy = Math.random() * cssHeight;
      const sh = 4 + Math.random() * 22;
      const shift = (Math.random() - 0.5) * 40;
      ctx.fillStyle =
        Math.random() < 0.5
          ? 'rgba(255, 45, 85, 0.35)'
          : 'rgba(0, 200, 255, 0.30)';
      ctx.fillRect(shift, sy, cssWidth, sh);
    }
  }

  ctx.font = `${HACKER_MATRIX_FONT_PX - 1}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  for (const line of scrollLines) {
    ctx.fillStyle = 'rgba(34, 197, 94, 0.92)';
    ctx.fillText(line.text, 10, line.y);
    line.y += line.speed;
    if (line.y > cssHeight + 20) line.y = -HACKER_MATRIX_FONT_PX * 2;
  }
}

export function startHackerMatrixLoop(): void {
  if (!ctx || running) return;
  running = true;

  const tick = () => {
    if (!running || !ctx) return;
    drawFrame();
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
}

export function stopHackerMatrixLoop(): void {
  running = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export function clearHackerMatrixCanvas(): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, cssWidth, cssHeight);
}
