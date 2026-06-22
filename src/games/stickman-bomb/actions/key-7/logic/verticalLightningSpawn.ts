/**
 * Vertical bolts from the top of the screen down onto the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import {
  VERTICAL_LIGHTNING_ESTATE_PADDING_RATIO,
  VERTICAL_LIGHTNING_LENGTH_BOOST,
  VERTICAL_LIGHTNING_MAX_BOLT_LENGTH,
} from '../config/verticalLightningConfig';

export type VerticalStrikeBolt = {
  strikeRatio: { rx: number; ry: number };
  origin: Point2;
  tip: Point2;
  cloudX: number;
  angleRad: number;
  lengthPx: number;
};

type LocalRect = { x: number; y: number; w: number; h: number };

function estateLocalRect(estateRect: DOMRect, containerRect: DOMRect): LocalRect {
  return {
    x: estateRect.left - containerRect.left,
    y: estateRect.top - containerRect.top,
    w: estateRect.width,
    h: estateRect.height,
  };
}

export function resolveStrikePoint(
  estateRect: DOMRect,
  containerRect: DOMRect,
  strikeRatio: { rx: number; ry: number },
): Point2 {
  const er = estateLocalRect(estateRect, containerRect);
  return {
    x: er.x + er.w * strikeRatio.rx,
    y: er.y + er.h * strikeRatio.ry,
  };
}

/**
 * Estate-targeting bolt whose cloud origin is spread across the full sky width.
 * All bolts land on the estate but arrive from different angles — visually
 * looks like lightning converging on the house from all directions.
 */
export function pickVerticalEstateStrikeBolt(
  layerWidth: number,
  layerHeight: number,
  estateRect: DOMRect,
  containerRect: DOMRect,
): VerticalStrikeBolt {
  const pad = VERTICAL_LIGHTNING_ESTATE_PADDING_RATIO;
  const strikeRatio = {
    rx: pad + Math.random() * (1 - pad * 2),
    ry: pad + Math.random() * (1 - pad * 2),
  };
  const tip = resolveStrikePoint(estateRect, containerRect, strikeRatio);

  // Cloud origin spreads −55% … +55% of screen width from the tip
  // so bolts arrive steeply angled from anywhere across the sky
  const cloudX = tip.x + (Math.random() - 0.5) * layerWidth * 1.1;
  const origin: Point2 = {
    x: cloudX,
    y: -layerHeight * 0.06,
  };
  const baseLen = Math.hypot(tip.x - cloudX, tip.y - origin.y);
  const lengthPx = Math.min(
    Math.max(baseLen * VERTICAL_LIGHTNING_LENGTH_BOOST, layerHeight * 0.68),
    Math.min(layerHeight * 1.18, VERTICAL_LIGHTNING_MAX_BOLT_LENGTH),
  );

  return {
    strikeRatio,
    origin,
    tip,
    cloudX,
    angleRad: Math.atan2(tip.y - origin.y, tip.x - cloudX),
    lengthPx,
  };
}

/**
 * Wide bolt: lands anywhere across the full screen width, upper 65% of height.
 * No estate check — purely visual atmosphere.
 */
export function pickWideScreenStrikeBolt(
  layerWidth: number,
  layerHeight: number,
): VerticalStrikeBolt {
  // Spread across 120% of screen width so bolts near edges still look natural
  const tipX = layerWidth * (-0.1 + Math.random() * 1.2);
  // Land between 20–68% down the screen
  const tipY = layerHeight * (0.20 + Math.random() * 0.48);
  const cloudX = tipX + (Math.random() - 0.5) * layerWidth * 0.06;
  const origin: Point2 = { x: cloudX, y: -layerHeight * 0.06 };
  const baseLen = tipY - origin.y;
  const lengthPx = Math.min(
    Math.max(baseLen * VERTICAL_LIGHTNING_LENGTH_BOOST, layerHeight * 0.28),
    VERTICAL_LIGHTNING_MAX_BOLT_LENGTH,
  );
  return {
    strikeRatio: { rx: 0.5, ry: 0.5 }, // unused for wide bolts
    origin,
    tip: { x: tipX, y: tipY },
    cloudX,
    angleRad: Math.PI / 2,
    lengthPx,
  };
}

export function isPointInsideEstate(
  point: Point2,
  estateRect: DOMRect,
  containerRect: DOMRect,
): boolean {
  const er = estateLocalRect(estateRect, containerRect);
  return (
    point.x >= er.x &&
    point.x <= er.x + er.w &&
    point.y >= er.y &&
    point.y <= er.y + er.h
  );
}
