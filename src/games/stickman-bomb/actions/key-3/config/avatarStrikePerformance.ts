/**
 * Render budget — salvo-scale throughput via single canvas batch + pooled particles.
 *
 * DOM per avatar (bows only): portal wrap + frame + bow img + avatar img ≈ 4 layers.
 * FX (arrows + bursts): 1 shared canvas — all flights/particles in one draw pass/frame.
 * Motion: 1 shared rAF (float + canvas) instead of N×DOM transforms + N×CSS animations.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** Hard cap — bow portals on screen. */
export const AVATAR_STRIKE_MAX_CONCURRENT = 20;

/** Peak in-flight arrows on the shared canvas. */
export const AVATAR_STRIKE_MAX_FLIGHTS = 144;

/** Particle pool ceiling (launch + stick bursts). */
export const AVATAR_STRIKE_MAX_PARTICLES = 960;
