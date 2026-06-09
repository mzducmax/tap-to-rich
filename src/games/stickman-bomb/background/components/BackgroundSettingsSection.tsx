/**
 * Settings panel section for background display mode and atmosphere theme.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  ATMOSPHERE_THEME_OPTIONS,
  type AtmosphereTheme,
} from '../config/atmosphereTheme';
import {
  BACKGROUND_DISPLAY_MODE_OPTIONS,
  type BackgroundDisplayMode,
} from '../config/displayMode';
import {
  formatLevelLabel,
  formatLevelThreshold,
  getLevelBackgroundUrl,
  getTargetLevelHint,
  NEGATIVE_BACKGROUND_LEVELS,
  POSITIVE_BACKGROUND_LEVELS,
  type BackgroundLevel,
} from '../config/levelConfig';

type BackgroundSettingsSectionProps = {
  targetScore: number;
  displayMode: BackgroundDisplayMode;
  atmosphereTheme: AtmosphereTheme;
  activeBackgroundLevel: BackgroundLevel;
  onDisplayModeChange: (mode: BackgroundDisplayMode) => void;
  onAtmosphereThemeChange: (theme: AtmosphereTheme) => void;
};

const THEME_EMOJI: Record<AtmosphereTheme, string> = {
  meadow: '🌿',
  day: '🌤️',
  cyber: '🔮',
  sunset: '🌇',
  cosmic: '🌌',
};

const THEME_ACTIVE_CLASS: Record<AtmosphereTheme, string> = {
  meadow: 'bg-green-100/80',
  day: 'bg-blue-100/80',
  cyber: 'bg-fuchsia-100/80',
  sunset: 'bg-rose-100/80',
  cosmic: 'bg-slate-100/80',
};

function LevelThumbnail({
  level,
  activeBackgroundLevel,
  targetScore,
}: {
  level: BackgroundLevel;
  activeBackgroundLevel: BackgroundLevel;
  targetScore: number;
}) {
  return (
    <div
      className={`relative overflow-hidden border-2 rounded-lg aspect-[4/3] ${
        activeBackgroundLevel === level
          ? 'border-indigo-900 ring-2 ring-indigo-400'
          : 'border-slate-200 opacity-70'
      }`}
      title={`${formatLevelLabel(level)}: ${formatLevelThreshold(level, targetScore)}`}
    >
      <img
        src={getLevelBackgroundUrl(level)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute bottom-0 inset-x-0 bg-indigo-950/75 text-[9px] font-black text-white py-0.5 text-center">
        {formatLevelLabel(level)}
      </span>
    </div>
  );
}

export function BackgroundSettingsSection({
  targetScore,
  displayMode,
  atmosphereTheme,
  activeBackgroundLevel,
  onDisplayModeChange,
  onAtmosphereThemeChange,
}: BackgroundSettingsSectionProps) {
  const useLevelBackground = displayMode === 'level';

  return (
    <>
      <p className="text-[10px] font-bold text-indigo-900/50 leading-snug -mt-2 mb-4">
        {useLevelBackground
          ? getTargetLevelHint(targetScore)
          : 'Victory target in $ (positive or negative). Level backgrounds when "2. Level" is selected.'}
      </p>

      <div className="mb-4 flex flex-col gap-1.5">
        <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
          Background Type
        </span>
        <div className="grid grid-cols-2 gap-2 mt-0.5">
          {BACKGROUND_DISPLAY_MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onDisplayModeChange(option.id)}
              className={`py-2.5 px-2.5 border-2 rounded-xl text-[11px] font-black flex flex-col items-center gap-1 transition-all ${
                displayMode === option.id
                  ? 'bg-emerald-100/80 border-indigo-900 scale-[1.02]'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{option.id === 'classic' ? '🌈' : '🏞️'}</span>
              <span>{option.label}</span>
              <span className="text-[9px] font-bold text-indigo-900/45 text-center leading-tight">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        {useLevelBackground && (
          <>
            <p className="text-[10px] font-bold text-emerald-800/80 leading-snug mt-1">
              Active: {formatLevelLabel(activeBackgroundLevel)} ·{' '}
              {formatLevelThreshold(activeBackgroundLevel, targetScore)}
            </p>
            <p className="text-[9px] font-black uppercase tracking-wider text-indigo-900/45">
              Negative
            </p>
            <div className="grid grid-cols-6 gap-1">
              {NEGATIVE_BACKGROUND_LEVELS.map((level) => (
                <LevelThumbnail
                  key={level}
                  level={level}
                  activeBackgroundLevel={activeBackgroundLevel}
                  targetScore={targetScore}
                />
              ))}
            </div>
            <p className="text-[9px] font-black uppercase tracking-wider text-indigo-900/45 mt-1">
              Zero &amp; Positive
            </p>
            <div className="grid grid-cols-6 gap-1">
              {POSITIVE_BACKGROUND_LEVELS.map((level) => (
                <LevelThumbnail
                  key={level}
                  level={level}
                  activeBackgroundLevel={activeBackgroundLevel}
                  targetScore={targetScore}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {displayMode === 'classic' && (
        <div className="mb-5 flex flex-col gap-1.5">
          <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
            Atmosphere Theme
          </span>
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            {ATMOSPHERE_THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onAtmosphereThemeChange(option.id)}
                className={`py-2 px-2.5 border-2 rounded-xl text-[11px] font-black flex flex-col items-center gap-1 transition-all ${
                  atmosphereTheme === option.id
                    ? `${THEME_ACTIVE_CLASS[option.id]} border-indigo-900 scale-[1.02]`
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full shadow ${option.swatchClass}`}
                />
                <span>
                  {option.label} {THEME_EMOJI[option.id]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
