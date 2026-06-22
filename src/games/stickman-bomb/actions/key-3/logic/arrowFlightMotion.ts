/**
 * Arrow flights — delegated to shared canvas batch renderer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import {
  cancelFlightGroup,
  createFlightGroup,
  flyArrowCanvas,
  type FlightGroup,
} from './avatarStrikeCanvas';

export type { FlightGroup };

export { createFlightGroup, cancelFlightGroup as cancelArrowFlightsFor };

export function flyArrow(
  groupId: FlightGroup,
  nockStart: Point2,
  tipTarget: Point2,
  duration: number,
): Promise<void> {
  return flyArrowCanvas(groupId, nockStart, tipTarget, duration);
}
