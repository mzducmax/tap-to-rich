/**
 * Root background renderer — classic atmosphere and/or level scene overlay.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { BackgroundLevel } from '../config/levelConfig';
import type { GrassTuft, StarDecoration } from '../logic/createDecorations';
import type { ActiveThemeKey } from '../types';
import { ClassicBackgroundScene } from './ClassicBackgroundScene';
import { LevelBackgroundLayer } from './LevelBackgroundLayer';

type GameBackgroundRootProps = {
  useLevelBackground: boolean;
  activeBackgroundLevel: BackgroundLevel;
  activeThemeKey: ActiveThemeKey;
  isMeadow: boolean;
  isNightLike: boolean;
  isDayLike: boolean;
  starsConstellation: StarDecoration[];
  grassTufts: GrassTuft[];
};

export function GameBackgroundRoot({
  useLevelBackground,
  activeBackgroundLevel,
  activeThemeKey,
  isMeadow,
  isNightLike,
  isDayLike,
  starsConstellation,
  grassTufts,
}: GameBackgroundRootProps) {
  return (
    <>
      <ClassicBackgroundScene
        activeThemeKey={activeThemeKey}
        isMeadow={isMeadow}
        isNightLike={isNightLike}
        isDayLike={isDayLike}
        starsConstellation={starsConstellation}
        grassTufts={grassTufts}
        visible={!useLevelBackground}
      />
      {useLevelBackground && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LevelBackgroundLayer level={activeBackgroundLevel} />
        </div>
      )}
    </>
  );
}
