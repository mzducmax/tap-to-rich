/**
 * Full-screen level-up transition overlay — GPU-optimised.
 *
 * All particle/sparkle/burst VFX are drawn on a **single &lt;canvas&gt;**
 * (1 draw-call) instead of dozens of individual DOM nodes.
 * The only DOM elements are the 4–5 text/badge nodes which use
 * pure `transform` + `opacity` animations (GPU-composited, no
 * layout/paint) and zero `box-shadow`/`filter`/`backdrop-filter`.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import { getLevelTheme } from '../games/stickman-bomb/background/config/levelTheme';
import type { LevelTheme } from '../games/stickman-bomb/background/config/levelTheme';
import type { BackgroundLevel } from '../games/stickman-bomb/background/config/levelConfig';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type LevelUpTransitionProps = {
  currentLevel: BackgroundLevel;
};

type TransitionState = {
  fromLevel: BackgroundLevel;
  toLevel: BackgroundLevel;
  isLevelUp: boolean;
  key: number;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let transitionKeyCounter = 0;

function rand(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

/** Parse "#rrggbb" → [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function formatLevelName(level: BackgroundLevel): string {
  return level === 0 ? 'Level 0' : `Level ${level}`;
}

/**
 * Direction glyph — one inline <svg> instead of an emoji glyph.
 * Single composited layer, no emoji-font decode, colours follow the level theme.
 */
function DirectionGlyph({ isLevelUp, theme }: { isLevelUp: boolean; theme: LevelTheme }) {
  const chevrons = isLevelUp
    ? ['M22 42 L44 24 L66 42', 'M22 58 L44 40 L66 58']
    : ['M22 46 L44 64 L66 46', 'M22 30 L44 48 L66 30'];

  return (
    <svg viewBox="0 0 88 88" className="w-16 h-16 sm:w-20 sm:h-20" aria-hidden="true">
      <defs>
        <linearGradient id="lvl-glyph-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.text} />
          <stop offset="100%" stopColor={theme.accent} />
        </linearGradient>
      </defs>

      {/* Badge disc + ring */}
      <circle cx="44" cy="44" r="40" fill={theme.deep} opacity="0.45" />
      <circle cx="44" cy="44" r="40" fill="none" stroke={theme.accent} strokeWidth="3" opacity="0.7" />

      {/* Stacked double chevron */}
      {chevrons.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="url(#lvl-glyph-fill)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

function getTransitionTitle(isLevelUp: boolean, toLevel: BackgroundLevel): string {
  if (toLevel > 0) return isLevelUp ? 'LEVEL UP!' : 'LEVEL DOWN';
  if (toLevel === 0) return isLevelUp ? 'BACK TO BASE' : 'RESET';
  return isLevelUp ? 'RECOVERING' : 'DEEPER FALL';
}

/* ------------------------------------------------------------------ */
/*  Canvas-based particle system (1 draw-call for ALL VFX)            */
/* ------------------------------------------------------------------ */

interface Particle {
  /** Current position (px from canvas center) */
  x: number;
  y: number;
  /** Velocity */
  vx: number;
  vy: number;
  /** Base radius */
  r: number;
  /** Lifetime: 0 → 1 progress */
  life: number;
  /** How fast life progresses (1/durationMs) */
  speed: number;
  /** Delay before spawning (seconds) */
  delay: number;
  /** RGB tuple */
  color: [number, number, number];
  /** 'burst' flies outward, 'sparkle' fades in-place, 'ring' expands */
  kind: 'burst' | 'sparkle' | 'ring' | 'ray';
  /** Extra data: ring radius target, ray angle, etc. */
  extra: number;
}

function createParticleSystem(theme: LevelTheme, w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  const accentRgb = hexToRgb(theme.accent);
  const textRgb = hexToRgb(theme.text);
  const cx = 0;
  const cy = 0;
  const minDim = Math.min(w, h);

  // --- Burst particles (radial explosion) ---
  for (let i = 0; i < 40; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(minDim * 0.3, minDim * 0.9);
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: rand(2, 7),
      life: 0,
      speed: 1 / rand(800, 1600),
      delay: rand(0, 0.15),
      color: Math.random() > 0.3 ? accentRgb : textRgb,
      kind: 'burst',
      extra: 0,
    });
  }

  // --- Sparkle dots (appear scattered) ---
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: rand(-w * 0.48, w * 0.48),
      y: rand(-h * 0.48, h * 0.48),
      vx: 0,
      vy: rand(-15, -40),
      r: rand(1.5, 4.5),
      life: 0,
      speed: 1 / rand(500, 1200),
      delay: rand(0.1, 0.8),
      color: Math.random() > 0.5 ? accentRgb : textRgb,
      kind: 'sparkle',
      extra: 0,
    });
  }

  // --- Expanding rings ---
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      r: 2,
      life: 0,
      speed: 1 / rand(1200, 2000),
      delay: i * 0.18,
      color: accentRgb,
      kind: 'ring',
      extra: minDim * rand(0.3, 0.55), // target radius
    });
  }

  // --- Light rays (radial lines from center) ---
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + rand(-0.1, 0.1);
    particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      r: rand(1, 2.5),
      life: 0,
      speed: 1 / rand(1000, 1800),
      delay: rand(0, 0.25),
      color: accentRgb,
      kind: 'ray',
      extra: angle,
    });
  }

  return particles;
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number,
  h: number,
  globalAlpha: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.globalAlpha = globalAlpha;

  const minDim = Math.min(w, h);

  for (const p of particles) {
    if (p.life < 0 || p.life >= 1) continue;
    const t = p.life;

    if (p.kind === 'burst') {
      // Ease-out position, fade-out after 60%
      const ease = 1 - (1 - t) * (1 - t);
      const px = p.x + p.vx * ease;
      const py = p.y + p.vy * ease;
      const alpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
      const scale = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) * 0.8;

      ctx.globalAlpha = globalAlpha * Math.max(0, alpha);
      ctx.fillStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.5, p.r * scale), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'sparkle') {
      // Pulse in then out
      const alpha = t < 0.4 ? t / 0.4 : 1 - (t - 0.4) / 0.6;
      const scale = t < 0.3 ? t / 0.3 : 1;
      const px = p.x + p.vx * t;
      const py = p.y + p.vy * t;

      ctx.globalAlpha = globalAlpha * Math.max(0, alpha) * 0.85;
      ctx.fillStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;

      // Draw a 4-point star
      const sr = Math.max(0.5, p.r * scale);
      ctx.beginPath();
      ctx.moveTo(px, py - sr * 2);
      ctx.lineTo(px + sr * 0.4, py - sr * 0.4);
      ctx.lineTo(px + sr * 2, py);
      ctx.lineTo(px + sr * 0.4, py + sr * 0.4);
      ctx.lineTo(px, py + sr * 2);
      ctx.lineTo(px - sr * 0.4, py + sr * 0.4);
      ctx.lineTo(px - sr * 2, py);
      ctx.lineTo(px - sr * 0.4, py - sr * 0.4);
      ctx.closePath();
      ctx.fill();
    } else if (p.kind === 'ring') {
      const ease = 1 - (1 - t) * (1 - t);
      const radius = p.extra * ease;
      const alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;

      ctx.globalAlpha = globalAlpha * Math.max(0, alpha) * 0.5;
      ctx.strokeStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;
      ctx.lineWidth = Math.max(0.5, 3 * (1 - t));
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, radius), 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === 'ray') {
      const angle = p.extra;
      const alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
      const ease = 1 - (1 - t) * (1 - t);
      const len = minDim * 0.6 * ease;

      ctx.globalAlpha = globalAlpha * Math.max(0, alpha) * 0.3;
      ctx.strokeStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;
      ctx.lineWidth = Math.max(0.5, p.r * (1 - t * 0.5));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/* ------------------------------------------------------------------ */
/*  Canvas VFX component (single <canvas>, 1 draw-call per frame)     */
/* ------------------------------------------------------------------ */

function ParticleCanvas({
  theme,
  durationMs,
}: {
  theme: LevelTheme;
  durationMs: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    // Use device pixel ratio for crisp rendering, capped at 2 to save GPU
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cvs.clientWidth;
    const h = cvs.clientHeight;
    cvs.width = w * dpr;
    cvs.height = h * dpr;
    const ctx = cvs.getContext('2d', { alpha: true })!;
    ctx.scale(dpr, dpr);

    const particles = createParticleSystem(theme, w, h);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000; // seconds
      const globalT = Math.min(1, elapsed / (durationMs / 1000));

      // Fade in quickly, hold, then fade out at the end
      let globalAlpha = 1;
      if (globalT < 0.1) globalAlpha = globalT / 0.1;
      else if (globalT > 0.7) globalAlpha = 1 - (globalT - 0.7) / 0.3;

      // Advance each particle's life
      const dtSec = 1 / 60; // approx, we use elapsed-based delay
      for (const p of particles) {
        if (elapsed < p.delay) {
          p.life = -1; // not yet spawned
        } else {
          const age = elapsed - p.delay;
          p.life = Math.min(1, age * p.speed * 1000);
        }
      }

      drawParticles(ctx, particles, w, h, globalAlpha);

      if (globalT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [theme, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        // Promote to own GPU layer without expensive effects
        willChange: 'opacity',
        contain: 'strict',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Root controller                                                    */
/* ------------------------------------------------------------------ */

const TRANSITION_DURATION_MS = 3300;

export default function LevelUpTransition({ currentLevel }: LevelUpTransitionProps) {
  const prevLevelRef = useRef<BackgroundLevel>(currentLevel);
  const [transition, setTransition] = useState<TransitionState | null>(null);

  useEffect(() => {
    const prev = prevLevelRef.current;
    if (prev !== currentLevel) {
      transitionKeyCounter += 1;
      const isLevelUp = currentLevel > prev;
      setTransition({
        fromLevel: prev,
        toLevel: currentLevel,
        isLevelUp,
        key: transitionKeyCounter,
      });
      if (isLevelUp) audioManager.playLevelUp();
      prevLevelRef.current = currentLevel;
    }
  }, [currentLevel]);

  // Auto-dismiss
  useEffect(() => {
    if (!transition) return;
    const t = setTimeout(() => setTransition(null), TRANSITION_DURATION_MS);
    return () => clearTimeout(t);
  }, [transition]);

  return (
    <AnimatePresence>
      {transition && (
        <LevelTransitionOverlay
          key={transition.key}
          fromLevel={transition.fromLevel}
          toLevel={transition.toLevel}
          isLevelUp={transition.isLevelUp}
        />
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Overlay — single canvas + minimal DOM text nodes                   */
/* ------------------------------------------------------------------ */

function LevelTransitionOverlay({
  fromLevel,
  toLevel,
  isLevelUp,
}: {
  fromLevel: BackgroundLevel;
  toLevel: BackgroundLevel;
  isLevelUp: boolean;
}) {
  const theme = getLevelTheme(toLevel);
  const tier = Math.abs(toLevel);
  const title = getTransitionTitle(isLevelUp, toLevel);
  const pipCount = toLevel < 0 ? 6 : 5;
  const filledPips = Math.abs(toLevel);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
      style={{ willChange: 'opacity' }}
    >
      {/* Vignette — simple CSS gradient, no blur */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Single canvas for ALL particle/burst/ring/ray VFX */}
      <ParticleCanvas theme={theme} durationMs={TRANSITION_DURATION_MS} />

      {/* ---- Central text content (minimal DOM nodes, GPU transforms only) ---- */}
      <div
        className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 select-none"
        style={{ willChange: 'transform' }}
      >
        {/* Direction glyph — inline SVG, single GPU layer */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [0, 1.3, 1] }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <DirectionGlyph isLevelUp={isLevelUp} theme={theme} />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.45,
            delay: 0.18,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.15em] text-center"
          style={{
            color: theme.text,
            textShadow: `0 0 24px ${theme.glow}, 0 4px 12px rgba(0,0,0,0.5)`,
            willChange: 'transform, opacity',
          }}
        >
          {title}
        </motion.div>

        {/* Level badge — no backdrop-blur, solid gradient instead */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.55,
            delay: 0.3,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="flex items-center gap-3 rounded-full border-2 px-6 py-2.5 sm:px-8 sm:py-3"
          style={{
            borderColor: theme.accent,
            background: `linear-gradient(135deg, ${theme.deep}ee 0%, ${theme.accent}44 100%)`,
            willChange: 'transform, opacity',
          }}
        >
          {/* Level name with gradient text */}
          <span
            className="text-2xl sm:text-3xl font-black uppercase tracking-widest"
            style={{
              background: `linear-gradient(180deg, ${theme.text} 30%, ${theme.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {formatLevelName(toLevel)}
          </span>

          {/* Tier pips — plain divs, no animations each */}
          <span className="flex items-center gap-1">
            {Array.from({ length: pipCount }, (_, i) => (
              <span
                key={i}
                className="block rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background:
                    i < filledPips
                      ? theme.accent
                      : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </span>
        </motion.div>

        {/* From → To */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.35, delay: 0.55 }}
          className="text-xs sm:text-sm font-bold tracking-wider uppercase"
          style={{
            color: theme.text,
            willChange: 'transform, opacity',
          }}
        >
          Level {fromLevel} → Level {toLevel}
        </motion.div>
      </div>
    </motion.div>
  );
}
