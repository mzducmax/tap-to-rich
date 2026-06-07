/**
 * Lightweight bird splat — fewer SVG nodes, GPU transform positioning.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useMemo } from 'react';

type BirdSplatProps = {
  x: number;
  y: number;
  seed: number;
  scale: number;
};

function createRng(seed: number) {
  let state = Math.abs(Math.floor(seed)) % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export const BirdSplat = memo(function BirdSplat({ x, y, seed, scale }: BirdSplatProps) {
  const splat = useMemo(() => {
    const rng = createRng(seed);
    const canvasSize = 120 * scale;
    const cx = 50;
    const cy = 50;

    const urates = Array.from({ length: 4 }, (_, i) => ({
      key: `u-${i}`,
      cx: cx + (rng() * 16 - 8),
      cy: cy + (rng() * 16 - 8),
      r: 5 + rng() * 8,
    }));

    const streaks = Array.from({ length: 3 + Math.floor(rng() * 2) }, (_, i) => ({
      key: `s-${i}`,
      height: 8 + rng() * 14,
      width: 1 + rng() * 1.5,
      rotate: rng() * 360,
    }));

    const droplets = Array.from({ length: 8 + Math.floor(rng() * 6) }, (_, i) => {
      const angle = rng() * Math.PI * 2;
      const dist = 8 + rng() * 32;
      return {
        key: `d-${i}`,
        cx: cx + Math.cos(angle) * dist,
        cy: cy + Math.sin(angle) * dist,
        r: 0.4 + rng() * 1.6,
        fill: rng() > 0.35 ? '#ffffff' : '#A1887F',
      };
    });

    return {
      canvasSize,
      offsetX: x - canvasSize / 2,
      offsetY: y - canvasSize / 2,
      coreR: 4 + rng() * 4,
      urates,
      streaks,
      droplets,
    };
  }, [scale, seed, x, y]);

  return (
    <svg
      className="bird-splat-root"
      width={splat.canvasSize}
      height={splat.canvasSize}
      viewBox="0 0 100 100"
      style={{
        ['--splat-x' as string]: `${splat.offsetX}px`,
        ['--splat-y' as string]: `${splat.offsetY}px`,
      }}
      aria-hidden
    >
      {splat.urates.map((u) => (
        <circle key={u.key} cx={u.cx} cy={u.cy} r={u.r} fill="#ffffff" />
      ))}
      <circle cx={50} cy={50} r={splat.coreR} fill="#8D6E63" fillOpacity={0.55} />
      {splat.streaks.map((s) => (
        <rect
          key={s.key}
          x={49}
          y={50}
          width={s.width}
          height={s.height}
          fill="#ffffff"
          transform={`rotate(${s.rotate} 50 50)`}
        />
      ))}
      {splat.droplets.map((d) => (
        <circle
          key={d.key}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill={d.fill}
          fillOpacity={0.75}
        />
      ))}
    </svg>
  );
});
