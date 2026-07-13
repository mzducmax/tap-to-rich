/**
 * Perf harness — mounts the live game canvas without login/networking so we
 * can profile hammer + mouse-move performance in isolation.
 * Open at /perf.html on the dev server. Not part of the shipped app.
 */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  StickmanBombCanvas,
  GameBackgroundRoot,
  useGameBackground,
} from './games/stickman-bomb';
import TargetGoalDock from './components/TargetGoalDock';
import type { GameStats } from './types';
import './index.css';

const TARGET = 999999;

function PerfApp() {
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    perfectStreak: 0,
    totalBoxesStacked: 1,
  });
  const gameBackground = useGameBackground({
    score: stats.score,
    targetScore: TARGET,
  });

  return (
    <div className="w-screen h-screen font-sans overflow-hidden select-none relative flex flex-col items-center justify-start pb-0 bg-slate-950">
      <GameBackgroundRoot
        useLevelBackground={gameBackground.useLevelBackground}
        activeBackgroundLevel={gameBackground.activeBackgroundLevel}
        activeThemeKey={gameBackground.activeThemeKey}
        isMeadow={gameBackground.isMeadow}
        isNightLike={gameBackground.isNightLike}
        isDayLike={gameBackground.isDayLike}
        starsConstellation={gameBackground.starsConstellation}
        grassTufts={gameBackground.grassTufts}
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-3 pointer-events-auto select-none">
        <TargetGoalDock
          score={stats.score}
          targetScore={TARGET}
          weaponMode="hammer"
          hasBorrowed={false}
        />
      </div>
      <div
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
        style={{
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
      >
        <StickmanBombCanvas
          timeOfDay={gameBackground.canvasTimeOfDay}
          onStatsChange={setStats}
          onGameOver={() => {}}
          onGameReset={() => {}}
          isMuted
          targetScore={TARGET}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerfApp />
  </StrictMode>,
);
