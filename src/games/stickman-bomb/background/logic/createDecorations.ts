/**
 * Procedural decoration data for classic atmosphere backgrounds.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type StarDecoration = {
  id: number;
  left: string;
  top: string;
  delay: string;
  scale: number;
};

export type GrassTuft = {
  id: number;
  left: string;
  height: number;
  rotate: number;
  shade: number;
};

export function createStarsConstellation(count = 48): StarDecoration[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 65}%`,
    delay: `${Math.random() * 3}s`,
    scale: 0.4 + Math.random() * 0.8,
  }));
}

export function createGrassTufts(count = 32): GrassTuft[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i / count) * 100 + (Math.random() * 4 - 2)}%`,
    height: 10 + Math.random() * 16,
    rotate: -10 + Math.random() * 20,
    shade: i % 3,
  }));
}
