/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Block {
  id: string;
  x: number;      // Center X coordinate
  z: number;      // Center Z coordinate
  width: number;  // Width along X-axis
  depth: number;  // Depth along Z-axis
  y: number;      // Height index (level)
  hue: number;    // HSL Hue for color shading (0-360) Installs distinct volumetric coloring
  perfectCount?: number; // Tracks streak if perfectly placed
}

export interface Debris {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  y: number;
  hue: number;
  vx: number;     // X velocity
  vy: number;     // Y velocity
  vz: number;     // Z velocity
  alpha: number;  // For fading out
  isSparkle?: boolean;
  sparkleSize?: number;
  sparkleColor?: string;
  sparkleShape?: 'star' | 'circle' | 'ring';
}

export type TimeOfDay = 'sunrise' | 'day' | 'sunset' | 'night';

export interface GameStats {
  score: number;
  highScore: number;
  perfectStreak: number;
  totalBoxesStacked: number;
}
