/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadAtmosphereTheme,
  saveAtmosphereTheme,
  type AtmosphereTheme,
} from '../config/atmosphereTheme';
import {
  loadBackgroundDisplayMode,
  saveBackgroundDisplayMode,
  type BackgroundDisplayMode,
} from '../config/displayMode';
import { scoreToBackgroundLevel } from '../config/levelConfig';
import {
  createGrassTufts,
  createStarsConstellation,
} from '../logic/createDecorations';
import type { ActiveThemeKey, TimeOfDay } from '../types';

type UseGameBackgroundOptions = {
  score: number;
  targetScore: number;
  paused?: boolean;
};

export function useGameBackground({ score, targetScore, paused = false }: UseGameBackgroundOptions) {
  const [atmosphereTheme, setAtmosphereTheme] = useState<AtmosphereTheme>(
    () => loadAtmosphereTheme(),
  );
  const [displayMode, setDisplayMode] = useState<BackgroundDisplayMode>(
    () => loadBackgroundDisplayMode(),
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [starsConstellation] = useState(() => createStarsConstellation());
  const [grassTufts] = useState(() => createGrassTufts());

  const useLevelBackground = displayMode === 'level';

  const activeBackgroundLevel = useMemo(
    () => scoreToBackgroundLevel(score, targetScore),
    [score, targetScore],
  );

  const activeThemeKey: ActiveThemeKey =
    atmosphereTheme === 'day' ? timeOfDay : atmosphereTheme;

  const canvasTimeOfDay: TimeOfDay =
    atmosphereTheme === 'day' ? timeOfDay : 'day';

  const isNightLike =
    activeThemeKey === 'night' ||
    activeThemeKey === 'cosmic' ||
    activeThemeKey === 'cyber';
  const isDayLike =
    activeThemeKey === 'sunrise' ||
    activeThemeKey === 'day' ||
    activeThemeKey === 'sunset';
  const isMeadow = activeThemeKey === 'meadow';

  useEffect(() => {
    if (atmosphereTheme !== 'day' || paused) return;

    const stages: TimeOfDay[] = ['sunrise', 'day', 'sunset', 'night'];
    const interval = setInterval(() => {
      setTimeOfDay((current) => {
        const nextIdx = (stages.indexOf(current) + 1) % stages.length;
        return stages[nextIdx];
      });
    }, 22000);

    return () => clearInterval(interval);
  }, [atmosphereTheme, paused]);

  const handleAtmosphereThemeChange = useCallback((theme: AtmosphereTheme) => {
    setAtmosphereTheme(theme);
    saveAtmosphereTheme(theme);
    if (theme !== 'day') {
      setTimeOfDay('day');
    }
  }, []);

  const handleDisplayModeChange = useCallback((mode: BackgroundDisplayMode) => {
    setDisplayMode(mode);
    saveBackgroundDisplayMode(mode);
  }, []);

  return {
    atmosphereTheme,
    displayMode,
    useLevelBackground,
    activeBackgroundLevel,
    activeThemeKey,
    canvasTimeOfDay,
    isNightLike,
    isDayLike,
    isMeadow,
    starsConstellation,
    grassTufts,
    handleAtmosphereThemeChange,
    handleDisplayModeChange,
  };
}
