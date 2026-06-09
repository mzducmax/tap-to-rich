/**
 * Classic gradient atmosphere scene (meadow, sky day cycle, cyber, etc.).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { GrassTuft, StarDecoration } from '../logic/createDecorations';
import type { ActiveThemeKey } from '../types';

type ClassicBackgroundSceneProps = {
  activeThemeKey: ActiveThemeKey;
  isMeadow: boolean;
  isNightLike: boolean;
  isDayLike: boolean;
  starsConstellation: StarDecoration[];
  grassTufts: GrassTuft[];
  visible: boolean;
};

export function ClassicBackgroundScene({
  activeThemeKey,
  isMeadow,
  isNightLike,
  isDayLike,
  starsConstellation,
  grassTufts,
  visible,
}: ClassicBackgroundSceneProps) {
  if (!visible) return null;

  return (
    <>
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            isMeadow ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#7ecbff] via-[#b8e4ff] to-[#d4f0d4]" />
          <div className="absolute top-14 right-[18%] w-20 h-20 rounded-full bg-yellow-200 shadow-[0_0_45px_18px_rgba(253,224,71,0.45)]" />
          <div className="absolute top-20 left-[12%] w-28 h-9 bg-white/55 rounded-full blur-[0.5px]" />
          <div className="absolute top-28 right-[8%] w-36 h-10 bg-white/45 rounded-full blur-[0.5px]" />
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#1f6b28] via-[#3da842] to-[#6ecf5a]/85" />
          <div className="absolute bottom-[38%] left-[-10%] w-[55%] h-20 bg-[#358f3a]/55 rounded-[50%] blur-[1px]" />
          <div className="absolute bottom-[36%] right-[-8%] w-[48%] h-16 bg-[#2d7a32]/50 rounded-[50%] blur-[1px]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#174d1c]/40 to-transparent" />
        </div>

        <div
          className={`absolute inset-0 bg-gradient-to-b from-purple-950/95 via-rose-900/85 to-amber-250/50 transition-opacity duration-1000 ease-in-out ${
            activeThemeKey === 'sunrise' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#5facdf] to-[#1e1b4b] transition-opacity duration-1000 ease-in-out ${
            activeThemeKey === 'day' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#11122a] via-[#3d2c4b] to-[#60424a] transition-opacity duration-1000 ease-in-out ${
            activeThemeKey === 'sunset' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#111736] via-[#1b214f] to-[#252f6b] transition-opacity duration-1000 ease-in-out ${
            activeThemeKey === 'night' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b from-purple-950 via-fuchsia-950/70 to-pink-950/40 transition-opacity duration-1000 ease-in-out ${
            activeThemeKey === 'cyber' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b from-slate-950 via-[#1e1b4b] to-[#090514] transition-opacity duration-1000 ease-in-out ${
            activeThemeKey === 'cosmic' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none z-0 transition-opacity duration-1000 ${
          isMeadow ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {grassTufts.map((tuft) => (
          <div
            key={tuft.id}
            className="absolute bottom-0 w-[3px] rounded-t-full origin-bottom"
            style={{
              left: tuft.left,
              height: `${tuft.height}px`,
              transform: `rotate(${tuft.rotate}deg)`,
              backgroundColor:
                tuft.shade === 0 ? '#1a5c22' : tuft.shade === 1 ? '#247a2e' : '#2e9638',
            }}
          />
        ))}
      </div>

      <div
        className={`absolute inset-x-0 top-0 h-2/3 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${
          isNightLike ? 'opacity-85' : 'opacity-0'
        }`}
      >
        {starsConstellation.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-twinkle shadow-sm"
            style={{
              left: star.left,
              top: star.top,
              width: `${4 * star.scale}px`,
              height: `${4 * star.scale}px`,
              animationDelay: star.delay,
              boxShadow: '0 0 6px 1px rgba(255, 255, 255, 0.4)',
            }}
          />
        ))}
        <div className="absolute top-16 right-1/4 w-16 h-16 rounded-full bg-transparent shadow-[14px_-14px_0_0_#fef3c7] opacity-80 blur-[0.6px]" />
      </div>

      <div
        className={`absolute inset-x-0 top-0 h-1/2 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${
          isDayLike ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`absolute rounded-full transition-all duration-[1200ms] ${
            activeThemeKey === 'sunrise'
              ? 'top-24 left-1/3 w-20 h-20 bg-amber-300 shadow-[0_0_50px_20px_rgba(252,211,77,0.3)]'
              : activeThemeKey === 'day'
                ? 'top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-100 shadow-[0_0_80px_25px_rgba(254,243,199,0.35)]'
                : 'top-28 left-2/3 w-24 h-24 bg-orange-400 shadow-[0_0_70px_22px_rgba(251,146,60,0.35)]'
          }`}
        />

        {activeThemeKey === 'day' && (
          <>
            <div className="absolute top-12 left-[-150px] w-36 h-10 bg-white/40 rounded-full blur-[1px] animate-cloud-slow" />
            <div className="absolute top-28 left-[-100px] w-48 h-12 bg-white/30 rounded-full blur-[0.8px] animate-cloud-medium" />
            <div className="absolute top-6 left-[20%] w-24 h-8 bg-white/25 rounded-full blur-[1.2px] animate-cloud-fast" />
          </>
        )}
        {activeThemeKey === 'sunset' && (
          <div className="absolute top-24 left-[-100px] w-48 h-10 bg-rose-400/25 rounded-full blur-[1px] animate-cloud-slow" />
        )}
      </div>
    </>
  );
}
