/**
 * Full-screen level background — cross-fades between level images.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { BackgroundLevel } from '../config/levelConfig';
import {
  ALL_BACKGROUND_LEVELS,
  getLevelBackgroundUrl,
} from '../config/levelConfig';

type LevelBackgroundLayerProps = {
  level: BackgroundLevel;
};

export function LevelBackgroundLayer({ level }: LevelBackgroundLayerProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {ALL_BACKGROUND_LEVELS.map((lv) => (
        <img
          key={lv}
          src={getLevelBackgroundUrl(lv)}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            lv === level ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
