/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Settings,
  WifiOff,
} from 'lucide-react';
import LoginScreen, { getLastLoginEmail } from './components/LoginScreen';
import {
  StickmanBombCanvas,
  StickmanBombCanvasHandle,
  MISS_PENALTY_BOXES,
  COUNTER_DISPLAY_STYLE_OPTIONS,
  loadCounterDisplayStyle,
  saveCounterDisplayStyle,
  loadCounterVisible,
  saveCounterVisible,
  WEAPON_SWITCH_KEY_OPTIONS,
  loadWeaponMode,
  loadWeaponSwitchKey,
  saveWeaponMode,
  saveWeaponSwitchKey,
  BackgroundSettingsSection,
  EstateSettingsSection,
  GameBackgroundRoot,
  useGameBackground,
  useEstateImageSettings,
  GameplayControlsSection,
  scoreToEstateLevel,
  loadTargetScore,
  saveTargetScore,
  clampTargetScore,
  clampHammerEstateReward,
  loadHammerEstateReward,
  saveHammerEstateReward,
  MIN_HAMMER_ESTATE_REWARD,
  MAX_HAMMER_ESTATE_REWARD,
  hasReachedWinTarget,
  hasReachedLoseTarget,
  getLoseTargetScore,
  MIN_TARGET_SCORE,
  MAX_TARGET_SCORE,
  formatCounterLabel,
  type CounterDisplayStyle,
  type EstateLevel,
  type WeaponMode,
} from './games/stickman-bomb';
import TargetGoalDock from './components/TargetGoalDock';
import { useLiveNetworking, type LoginRequest } from './hooks/useLiveNetworking';
import GameClient from './networking/GameClient';
import type { GiftBoxEffect } from './networking/giftBoxRules';
import type { SettingsActionResult } from './networking/gameActionExecutor';
import type { MatchRankPlayer } from './networking/rankGameApi';
import { pushMatchToGlobalRank } from './services/globalLeaderboard';
import { parseWinProgress } from './networking/winSettings';
import { GameStats } from './types';
import { audioManager } from './utils/audio';

/** Temporarily skip login — set to false to re-enable. */
const SKIP_LOGIN = true;

type ViewerGiftStats = {
  id: string;
  name: string;
  avatar: string;
  matchCoins: number;
  peakScore: number;
};

export default function App() {
  const canvasRef = useRef<StickmanBombCanvasHandle | null>(null);
  const balancePanelRef = useRef<HTMLDivElement | null>(null);
  const balanceDockRef = useRef<HTMLDivElement | null>(null);
  const viewerStatsRef = useRef<Map<string, ViewerGiftStats>>(new Map());
  const [loginRequest, setLoginRequest] = useState<LoginRequest | null>(null);

  // Stats mirroring states
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    perfectStreak: 0,
    totalBoxesStacked: 1,
  });

  // Target goal — supports negative integers (score moves 0 → target)
  const [targetScore, setTargetScore] = useState(() => loadTargetScore());

  // Sound active state
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('stack_volume');
    return saved ? Math.min(1, Math.max(0, parseFloat(saved))) : 0.5;
  });
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('stack_muted') === 'true';
  });

  // Modal display overrides
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [previewEstateLevel, setPreviewEstateLevel] = useState<EstateLevel | null>(null);
  const {
    estateImageOverrides,
    setEstateLevelImage,
    resetEstateLevelImage,
    resetAllEstateLevelImages,
  } = useEstateImageSettings();
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showDefeatModal, setShowDefeatModal] = useState(false);
  const [victoryCountdown, setVictoryCountdown] = useState<number | null>(null);
  const [winProgress, setWinProgress] = useState({ current: 0, total: 0 });
  const [showWinPanel, setShowWinPanel] = useState(() => {
    return localStorage.getItem('stack_show_win_panel') !== 'false';
  });

  const [counterDisplayStyle, setCounterDisplayStyle] = useState<CounterDisplayStyle>(
    () => loadCounterDisplayStyle(),
  );
  const [showCounter, setShowCounter] = useState(() => loadCounterVisible());

  const [weaponMode, setWeaponMode] = useState<WeaponMode>(() => loadWeaponMode());
  const [weaponSwitchKey, setWeaponSwitchKey] = useState(() => loadWeaponSwitchKey());
  const [hammerEstateReward, setHammerEstateReward] = useState(() => loadHammerEstateReward());

  const gamePaused =
    showSettingsModal ||
    victoryCountdown !== null ||
    showDefeatModal ||
    hasReachedWinTarget(stats.score, targetScore) ||
    hasReachedLoseTarget(stats.score, targetScore);

  const gameBackground = useGameBackground({
    score: stats.score,
    targetScore,
    paused: gamePaused,
  });

  const activeEstateLevel = scoreToEstateLevel(stats.score, targetScore);

  const canShowWinPanel = showWinPanel && winProgress.total > 0;
  const [showNotification, setShowNotification] = useState<string | null>(null);
  type LiveActionBanner =
    | { kind: 'reset'; viewerName: string }
    | { kind: 'win'; viewerName: string; delta: number };

  const [liveActionBanner, setLiveActionBanner] = useState<LiveActionBanner | null>(null);
  const liveActionBannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Defeat — score hits negative target threshold
  useEffect(() => {
    if (!hasReachedLoseTarget(stats.score, targetScore)) return;
    if (showDefeatModal || showVictoryModal) return;

    setVictoryCountdown(null);
    setShowDefeatModal(true);
    audioManager.playLose();
    triggerFloatNotify(`💀 HIT ${formatCounterLabel(getLoseTargetScore(targetScore))}! GAME OVER!`);
  }, [stats.score, targetScore, showDefeatModal, showVictoryModal]);

  // Victory — positive target reached, 10 second survival countdown
  useEffect(() => {
    if (hasReachedLoseTarget(stats.score, targetScore)) return;

    if (hasReachedWinTarget(stats.score, targetScore)) {
      if (!showVictoryModal && !showDefeatModal && victoryCountdown === null) {
        setVictoryCountdown(10);
        triggerFloatNotify(`🎯 REACHED ${formatCounterLabel(targetScore)}! SURVIVE 10 SECONDS TO WIN!`);
      }
    } else {
      if (victoryCountdown !== null) {
        setVictoryCountdown(null);
        triggerFloatNotify(`⚠️ Below goal target! Survival timer cancelled.`);
      }
    }
  }, [stats.score, targetScore, showVictoryModal, showDefeatModal, victoryCountdown]);

  // Countdown timer clock
  useEffect(() => {
    if (victoryCountdown === null || showSettingsModal) return;

    // Play high pitched tick for countdown seconds
    audioManager.playTick();

    if (victoryCountdown <= 0) {
      setVictoryCountdown(null);
      setShowVictoryModal(true);
      setWinProgress((prev) => ({
        ...prev,
        current: prev.current + 1,
      }));
      audioManager.playWin();
      void pushSessionToGlobalRank(targetScore);
      triggerFloatNotify(`🏆 VICTORY! ACCUMULATED ${formatCounterLabel(targetScore)}!`);
      return;
    }

    const timer = setTimeout(() => {
      setVictoryCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [victoryCountdown, targetScore, showSettingsModal]);

  const toggleMute = () => {
    const isMutedNow = audioManager.toggleMute();
    setIsMuted(isMutedNow);
    localStorage.setItem('stack_muted', String(isMutedNow));
    triggerFloatNotify(isMutedNow ? '🔇 Sound Muted' : '🔊 Sound Unmuted');
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    audioManager.setVolume(value);
    localStorage.setItem('stack_volume', String(value));
    if (value === 0) {
      setIsMuted(true);
      localStorage.setItem('stack_muted', 'true');
    } else {
      setIsMuted(false);
      localStorage.setItem('stack_muted', 'false');
    }
  };

  const handleCounterDisplayStyleChange = (style: CounterDisplayStyle) => {
    setCounterDisplayStyle(style);
    saveCounterDisplayStyle(style);
    audioManager.playPop();
  };

  const handleShowCounterChange = (next: boolean) => {
    setShowCounter(next);
    saveCounterVisible(next);
    audioManager.playPop();
  };

  const handleWeaponModeChange = (mode: WeaponMode) => {
    setWeaponMode(mode);
    saveWeaponMode(mode);
  };

  const handleWeaponSwitchKeyChange = (code: string) => {
    setWeaponSwitchKey(code);
    saveWeaponSwitchKey(code);
    audioManager.playPop();
  };

  const triggerFloatNotify = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 2500);
  };

  const showLiveActionBanner = (banner: LiveActionBanner) => {
    if (liveActionBannerTimeoutRef.current) {
      clearTimeout(liveActionBannerTimeoutRef.current);
    }
    setLiveActionBanner(banner);
    liveActionBannerTimeoutRef.current = setTimeout(() => {
      setLiveActionBanner(null);
      liveActionBannerTimeoutRef.current = null;
    }, 2200);
  };

  const showResetBanner = (viewerName: string) => {
    showLiveActionBanner({ kind: 'reset', viewerName });
  };

  const showWinDeltaBanner = (viewerName: string, delta: number) => {
    if (delta >= 0) {
      audioManager.playWin();
    } else {
      audioManager.playLose();
    }
    showLiveActionBanner({ kind: 'win', viewerName, delta });
  };

  useEffect(() => {
    return () => {
      if (liveActionBannerTimeoutRef.current) {
        clearTimeout(liveActionBannerTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    audioManager.setVolume(volume);
    if (isMuted && !audioManager.getMuteStatus()) {
      audioManager.toggleMute();
    } else if (!isMuted && audioManager.getMuteStatus()) {
      audioManager.toggleMute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyGiftBoxEffect = useCallback(
    (effect: GiftBoxEffect, options?: { silentToast?: boolean }) => {
    if (!canvasRef.current) return;

    const boxLabel = effect.boxes === 1 ? 'box' : 'boxes';
    if (effect.direction === 'add') {
      canvasRef.current.autoBuildBoxes(effect.boxes);
      if (!options?.silentToast) {
        triggerFloatNotify(`🎁 ${effect.viewerName} +${effect.boxes} ${boxLabel}`);
      }
    } else {
      canvasRef.current.destroyTopBoxes(effect.boxes);
      if (!options?.silentToast) {
        triggerFloatNotify(`💥 ${effect.viewerName} −${effect.boxes} ${boxLabel}`);
      }
    }

    if (effect.viewerId && !effect.viewerId.includes('test-viewer') && (effect.coins ?? 0) > 0) {
      const map = viewerStatsRef.current;
      const existing = map.get(effect.viewerId);
      const next: ViewerGiftStats = {
        id: effect.viewerId,
        name: effect.viewerName,
        avatar: existing?.avatar ?? '',
        matchCoins: (existing?.matchCoins ?? 0) + (effect.coins ?? 0),
        peakScore: existing?.peakScore ?? 0,
      };
      map.set(effect.viewerId, next);
    }
  },
  []);

  const SOCIAL_ACTION_SOURCES = new Set([
    'Like',
    'LikeTarget',
    'Share',
    'Follow',
    'Join',
  ]);

  const socialActionIcon: Record<string, string> = {
    Like: '👍',
    LikeTarget: '👍',
    Share: '📤',
    Follow: '➕',
    Join: '👋',
  };

  const handleLiveGameReset = useCallback((viewerName: string) => {
    console.log('[Action:Reset] handleLiveGameReset — tower reset + lose sound', { viewerName });
    setVictoryCountdown(null);
    setShowVictoryModal(false);
    setShowDefeatModal(false);
    canvasRef.current?.resetGame();
    setStats((prev) => ({
      ...prev,
      score: 0,
      perfectStreak: 0,
      totalBoxesStacked: 1,
    }));
    audioManager.playLose();
    showResetBanner(viewerName);
    triggerFloatNotify(`🔄 ${viewerName} reset the tower!`);
  }, []);

  const applySettingsAction = useCallback(
    (action: SettingsActionResult) => {
      if (action.type === 'box') {
        const { effect, source } = action;
        const isSocial = source != null && SOCIAL_ACTION_SOURCES.has(source);
        applyGiftBoxEffect(effect, { silentToast: isSocial });

        if (isSocial && source) {
          const boxLabel = effect.boxes === 1 ? 'box' : 'boxes';
          const icon = socialActionIcon[source] ?? '⭐';
          if (effect.direction === 'add') {
            triggerFloatNotify(
              `${icon} ${effect.viewerName} sent ${effect.boxes} ${boxLabel}`,
            );
          } else {
            triggerFloatNotify(
              `${icon} ${effect.viewerName} removed ${effect.boxes} ${boxLabel}`,
            );
          }
        }
        return;
      }
      if (action.type === 'reset') {
        console.log('[Action:Reset] applySettingsAction received', action);
        handleLiveGameReset(action.viewerName);
        return;
      }
      if (action.type === 'winDelta') {
        console.log('[Action:Win] applySettingsAction', action);
        setWinProgress((prev) => ({
          ...prev,
          current: prev.current + action.delta,
        }));
        showWinDeltaBanner(action.viewerName, action.delta);
        const sign = action.delta >= 0 ? '+' : '−';
        triggerFloatNotify(
          `🏆 ${action.viewerName} ${sign}${Math.abs(action.delta)} win`,
        );
      }
    },
    [applyGiftBoxEffect, handleLiveGameReset],
  );

  const {
    connectionStatus,
    connectionMessage,
    authLoading,
    loggedInEmail,
    isReady,
    loginError,
    gameSettings,
    getRankAuth,
    refreshRankAuth,
  } = useLiveNetworking(loginRequest, applyGiftBoxEffect, applySettingsAction);

  useEffect(() => {
    if (!gameSettings?.settings) return;
    setWinProgress(parseWinProgress(gameSettings.settings));
  }, [gameSettings]);

  const handleLogin = (email: string) => {
    setLoginRequest({ email, key: Date.now() });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setShowSettingsModal((prev) => {
          const next = !prev;
          if (next) {
            audioManager.playPop();
          } else {
            setPreviewEstateLevel(null);
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const syncPeakScoresFromStats = useCallback((currentScore: number) => {
    for (const entry of viewerStatsRef.current.values()) {
      entry.peakScore = Math.max(entry.peakScore, currentScore);
    }
  }, []);

  const handleStatsChange = useCallback((newStats: GameStats) => {
    setStats(newStats);
    syncPeakScoresFromStats(newStats.score);
  }, [syncPeakScoresFromStats]);

  const pushSessionToGlobalRank = async (finalScore: number) => {
    const auth = getRankAuth();
    if (!auth) return;

    syncPeakScoresFromStats(finalScore);

    const players: MatchRankPlayer[] = [...viewerStatsRef.current.values()]
      .filter((v) => v.matchCoins > 0)
      .map((v) => ({
        id: v.id,
        name: v.name,
        avatar: v.avatar,
        matchCoins: v.matchCoins,
        kills: 0,
        totalDamage: Math.max(v.peakScore, finalScore),
      }));

    if (players.length === 0) return;

    try {
      await pushMatchToGlobalRank(auth, players, refreshRankAuth);
    } catch (err) {
      console.warn('[globalLeaderboard] push failed:', err);
    }
  };

  const handleResetEverything = () => {
    localStorage.removeItem('stack_high_score');
    viewerStatsRef.current.clear();
    setVictoryCountdown(null);
    setShowVictoryModal(false);
    setShowDefeatModal(false);
    if (canvasRef.current) {
      canvasRef.current.resetGame();
    }
    setStats((prev) => ({
      ...prev,
      highScore: 0,
      perfectStreak: 0,
      score: 0,
    }));
    triggerFloatNotify('🔄 Progress and records reset!');
  };

  if (!SKIP_LOGIN && !isReady) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isLoading={authLoading.active}
        loadingMessage={authLoading.message || 'Signing in...'}
        error={loginError}
        defaultEmail={GameClient.getEmailFromUrl() || getLastLoginEmail()}
      />
    );
  }

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

      {/* Target + goal — compact unified dock */}
      <div
        ref={balanceDockRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-3 pointer-events-auto select-none animate-fade-in"
      >
        <TargetGoalDock
          shellRef={balancePanelRef}
          score={stats.score}
          targetScore={targetScore}
          winCurrent={winProgress.current}
          winTotal={winProgress.total}
          showWin={canShowWinPanel}
          weaponMode={weaponMode}
        />
      </div>

      {!SKIP_LOGIN && connectionStatus !== 'connected' && (
        <div
          className={`absolute top-4 left-4 z-10 select-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black tracking-wider shadow-lg ${
            connectionStatus === 'error'
              ? 'bg-red-500/20 border-red-400/40 text-red-200'
              : 'bg-white/10 border-white/20 text-white/70'
          }`}
          title={loggedInEmail ? `${connectionMessage} · ${loggedInEmail}` : connectionMessage}
        >
          <WifiOff size={12} />
          <span className="uppercase">{connectionStatus}</span>
        </div>
      )}

      {/* Floating ESC / Gear settings button to enable comfortable mobile play or keyboard users */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowSettingsModal(true);
          audioManager.playPop();
        }}
        className="absolute top-4 right-4 z-10 select-none text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 active:scale-95 duration-75 p-2 px-3.5 rounded-xl border border-white/20 text-xs font-black tracking-wider flex items-center gap-2 shadow-lg"
        title="Press ESC or Click to Open Settings"
      >
        <Settings size={13} className="animate-spin-slow text-yellow-300" />
        <span className="uppercase text-[10px] tracking-widest">Settings (ESC)</span>
      </button>

      {/* Survival countdown — seconds only */}
      {victoryCountdown !== null && !showVictoryModal && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-none">
          <div className="relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32">
            <div className="absolute inset-0 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.15)]" />
            <div
              className={`absolute inset-1 rounded-full border-[3px] transition-colors duration-300 ${
                victoryCountdown <= 3
                  ? 'border-rose-400/80 shadow-[0_0_24px_rgba(244,63,94,0.45)] animate-pulse'
                  : 'border-amber-300/60 shadow-[0_0_20px_rgba(252,211,77,0.25)]'
              }`}
            />
            <span
              key={victoryCountdown}
              className={`relative font-black tabular-nums leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] animate-count-pop ${
                victoryCountdown <= 3
                  ? 'text-6xl md:text-7xl text-rose-300'
                  : 'text-6xl md:text-7xl text-white'
              }`}
            >
              {victoryCountdown}
            </span>
          </div>
        </div>
      )}

      {/* Live reset / win — full-screen banners */}
      <AnimatePresence>
        {liveActionBanner && (
          <motion.div
            key={
              liveActionBanner.kind === 'reset'
                ? `reset-${liveActionBanner.viewerName}`
                : `win-${liveActionBanner.delta}-${liveActionBanner.viewerName}`
            }
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="absolute inset-0 z-[45] flex flex-col items-center justify-center pointer-events-none select-none"
          >
            {liveActionBanner.kind === 'reset' ? (
              <>
                <div className="absolute inset-0 bg-red-950/25" />
                <p
                  className="relative text-7xl sm:text-8xl md:text-9xl font-black uppercase tracking-[0.2em] text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.85)] animate-pulse"
                  style={{ textShadow: '0 4px 0 #7f1d1d, 0 0 60px rgba(239,68,68,0.6)' }}
                >
                  RESET
                </p>
                <p className="relative mt-3 text-sm md:text-base font-bold text-red-200/90 uppercase tracking-widest">
                  {liveActionBanner.viewerName}
                </p>
              </>
            ) : (
              (() => {
                const isPlus = liveActionBanner.delta >= 0;
                const amount = Math.abs(liveActionBanner.delta);
                const sign = isPlus ? '+' : '−';
                return (
                  <>
                    <div
                      className={`absolute inset-0 ${
                        isPlus ? 'bg-amber-950/25' : 'bg-red-950/25'
                      }`}
                    />
                    <p
                      className={`relative text-6xl sm:text-7xl md:text-8xl font-black uppercase tracking-[0.15em] animate-pulse ${
                        isPlus
                          ? 'text-amber-300 drop-shadow-[0_0_40px_rgba(251,191,36,0.85)]'
                          : 'text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.85)]'
                      }`}
                      style={{
                        textShadow: isPlus
                          ? '0 4px 0 #78350f, 0 0 60px rgba(251,191,36,0.6)'
                          : '0 4px 0 #7f1d1d, 0 0 60px rgba(239,68,68,0.6)',
                      }}
                    >
                      {sign}
                      {amount} WIN
                    </p>
                    <p
                      className={`relative mt-3 text-sm md:text-base font-bold uppercase tracking-widest ${
                        isPlus ? 'text-amber-200/90' : 'text-red-200/90'
                      }`}
                    >
                      {liveActionBanner.viewerName}
                    </p>
                  </>
                );
              })()
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN GAME BACKGROUND VIEWPORT (GPU TRANSLATIONS ENABLED) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden', willChange: 'transform' }}>
        <StickmanBombCanvas
          ref={canvasRef}
          timeOfDay={gameBackground.canvasTimeOfDay}
          isMuted={isMuted}
          targetScore={targetScore}
          previewEstateLevel={previewEstateLevel}
          estateImageOverrides={estateImageOverrides}
          freezeSway={gamePaused}
          counterDisplayStyle={counterDisplayStyle}
          showCounter={showCounter}
          weaponMode={weaponMode}
          weaponSwitchKey={weaponSwitchKey}
          onWeaponModeChange={handleWeaponModeChange}
          hammerEstateReward={hammerEstateReward}
          onStatsChange={handleStatsChange}
          onGameOver={(score) => {
            setVictoryCountdown(null);
            audioManager.playLose();
            void pushSessionToGlobalRank(score);
            triggerFloatNotify(`☠️ Game over! Score: ${formatCounterLabel(score)}`);
          }}
          onMissPenalty={(remaining) => {
            triggerFloatNotify(
              `⚠️ Miss! −${formatCounterLabel(MISS_PENALTY_BOXES)} (${formatCounterLabel(remaining)} remaining)`,
            );
          }}
          onGameReset={() => {
            setVictoryCountdown(null);
            triggerFloatNotify('✨ New round started!');
          }}
          balancePanelRef={balancePanelRef}
          balanceDockRef={balanceDockRef}
        />
      </div>

      {/* GAME SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 w-screen h-screen bg-indigo-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white border-4 border-indigo-950 p-6 rounded-3xl max-w-sm w-full maxHeight-scroll overflow-y-auto shadow-2xl text-indigo-950 relative max-h-[90vh]"
            >
              <h2 className="text-xl font-black text-indigo-950 uppercase tracking-tight flex items-center gap-2 mb-4">
                <span>⚙️</span> GAME SETTINGS
              </h2>

              {/* Target Score Configuration block */}
              <div className="mb-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">Target Goal ($)</span>
                  <span className="text-[10px] font-mono font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {MIN_TARGET_SCORE.toLocaleString()} … {MAX_TARGET_SCORE.toLocaleString()}
                  </span>
                </div>
                <div className="bg-blue-50/50 p-2 rounded-xl border border-indigo-900/10 flex items-center gap-3 shadow-inner">
                  <span className="text-lg">🎯</span>
                  <input 
                    type="number" 
                    min={MIN_TARGET_SCORE}
                    max={MAX_TARGET_SCORE}
                    value={targetScore} 
                    onChange={(e) => {
                      const val = clampTargetScore(parseInt(e.target.value, 10) || 0);
                      setTargetScore(val);
                      saveTargetScore(val);
                    }}
                    className="w-full bg-transparent border-0 outline-none font-black text-base text-indigo-950 focus:outline-none"
                    placeholder="e.g., 100 or -500"
                  />
                </div>
              </div>

              <BackgroundSettingsSection
                targetScore={targetScore}
                displayMode={gameBackground.displayMode}
                atmosphereTheme={gameBackground.atmosphereTheme}
                activeBackgroundLevel={gameBackground.activeBackgroundLevel}
                onDisplayModeChange={(mode) => {
                  gameBackground.handleDisplayModeChange(mode);
                  audioManager.playPop();
                }}
                onAtmosphereThemeChange={(theme) => {
                  gameBackground.handleAtmosphereThemeChange(theme);
                  audioManager.playPop();
                }}
              />

              <EstateSettingsSection
                targetScore={targetScore}
                activeEstateLevel={activeEstateLevel}
                previewEstateLevel={previewEstateLevel}
                estateImageOverrides={estateImageOverrides}
                onPreviewEstateLevelChange={(level) => {
                  setPreviewEstateLevel(level);
                  audioManager.playPop();
                }}
                onEstateLevelImageChange={(level, dataUrl) => {
                  setEstateLevelImage(level, dataUrl);
                  setPreviewEstateLevel(level);
                  audioManager.playPop();
                }}
                onEstateLevelImageReset={(level) => {
                  resetEstateLevelImage(level);
                  audioManager.playPop();
                }}
                onResetAllEstateLevelImages={() => {
                  resetAllEstateLevelImages();
                  audioManager.playPop();
                }}
              />

              {/* Win counter toggle */}
              <div className="mb-4 flex items-center justify-between gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
                    Show Win Counter
                  </span>
                  <span className="text-[10px] font-bold text-indigo-900/50">
                    {canShowWinPanel
                      ? `Panel: TARGET | WIN (${winProgress.current}/${winProgress.total})`
                      : showWinPanel && winProgress.total <= 0
                      ? 'No win data from live settings yet'
                      : 'Panel: TARGET only (centered)'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showWinPanel}
                  onClick={() => {
                    const next = !showWinPanel;
                    setShowWinPanel(next);
                    localStorage.setItem('stack_show_win_panel', String(next));
                    audioManager.playPop();
                  }}
                  className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors duration-200 ${
                    showWinPanel
                      ? 'border-amber-500 bg-amber-400'
                      : 'border-slate-300 bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      showWinPanel ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider Block */}
              <div className="mb-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">SFX Volume</span>
                  <span className="text-xs font-mono font-black text-indigo-900">{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-50/50 p-2 rounded-xl border border-indigo-900/10">
                  <button type="button" onClick={toggleMute} className="text-indigo-900 hover:text-indigo-950 transition-colors">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-blue-105 rounded-lg appearance-none cursor-pointer accent-indigo-900" 
                  />
                </div>
              </div>

              {/* Score counter visibility */}
              <div className="mb-4 flex items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-indigo-900/10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
                    Hiển thị số đếm
                  </span>
                  <span className="text-[10px] font-bold text-indigo-900/50">
                    {showCounter
                      ? 'Bật — hiện số điểm bên trái màn hình'
                      : 'Tắt — chỉ hiện tài sản (estate) ở giữa'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showCounter}
                  onClick={() => handleShowCounterChange(!showCounter)}
                  className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors duration-200 ${
                    showCounter
                      ? 'border-indigo-500 bg-indigo-400'
                      : 'border-slate-300 bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      showCounter ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Counter display style */}
              <div className={`mb-5 flex flex-col gap-1.5 ${showCounter ? '' : 'opacity-45 pointer-events-none'}`}>
                <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
                  Counter Display Style
                </span>
                <div className="grid grid-cols-1 gap-2 mt-0.5 sm:grid-cols-3">
                  {COUNTER_DISPLAY_STYLE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!showCounter}
                      onClick={() => handleCounterDisplayStyleChange(option.id)}
                      className={`py-2.5 px-2 border-2 rounded-xl text-[11px] font-black flex flex-col items-center gap-1 transition-all ${
                        counterDisplayStyle === option.id
                          ? 'bg-indigo-100/80 border-indigo-900 scale-[1.02]'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base leading-none">
                        {option.id === 'stick'
                          ? '🖊️'
                          : option.id === 'classic'
                            ? '🔢'
                            : '💵'}
                      </span>
                      <span>{option.label}</span>
                      <span className="text-[9px] font-bold text-indigo-900/45 text-center leading-tight">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hammer estate reward */}
              <div className="mb-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
                    Điểm mỗi cú búa ($)
                  </span>
                  <span className="text-[10px] font-mono font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {MIN_HAMMER_ESTATE_REWARD.toLocaleString()} … {MAX_HAMMER_ESTATE_REWARD.toLocaleString()}
                  </span>
                </div>
                <div className="bg-blue-50/50 p-2 rounded-xl border border-indigo-900/10 flex items-center gap-3 shadow-inner">
                  <span className="text-lg">🔨</span>
                  <input
                    type="number"
                    min={MIN_HAMMER_ESTATE_REWARD}
                    max={MAX_HAMMER_ESTATE_REWARD}
                    value={hammerEstateReward}
                    onChange={(e) => {
                      const val = clampHammerEstateReward(parseInt(e.target.value, 10) || 0);
                      setHammerEstateReward(val);
                      saveHammerEstateReward(val);
                    }}
                    className="w-full bg-transparent border-0 outline-none font-black text-base text-indigo-950 focus:outline-none"
                    placeholder="e.g., 1"
                  />
                </div>
                <span className="text-[10px] font-bold text-indigo-900/50">
                  Số cộng mỗi lần búa đập trúng nhà (estate)
                </span>
              </div>

              <GameplayControlsSection
                weaponMode={weaponMode}
                weaponSwitchKey={weaponSwitchKey}
                hammerEstateReward={hammerEstateReward}
              />

              {/* Weapon switch key */}
              <div className="mb-5 flex flex-col gap-1.5">
                <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
                  Weapon Switch Key
                </span>
                <div className="grid grid-cols-3 gap-2 mt-0.5">
                  {WEAPON_SWITCH_KEY_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleWeaponSwitchKeyChange(option.code)}
                      className={`py-2 px-2 border-2 rounded-xl text-[11px] font-black transition-all ${
                        weaponSwitchKey === option.code
                          ? 'bg-indigo-100/80 border-indigo-900 scale-[1.02]'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      [{option.label}]
                    </button>
                  ))}
                </div>
              </div>

              {/* Default weapon mode */}
              <div className="mb-5 flex flex-col gap-1.5">
                <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
                  Default Weapon
                </span>
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleWeaponModeChange('hammer')}
                    className={`py-2.5 px-2 border-2 rounded-xl text-[11px] font-black flex flex-col items-center gap-1 transition-all ${
                      weaponMode === 'hammer'
                        ? 'bg-indigo-100/80 border-indigo-900 scale-[1.02]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base leading-none">🔨</span>
                    <span>Hammer</span>
                    <span className="text-[9px] font-bold text-indigo-900/45 text-center leading-tight">
                      Click counter to score
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeaponModeChange('gun')}
                    className={`py-2.5 px-2 border-2 rounded-xl text-[11px] font-black flex flex-col items-center gap-1 transition-all ${
                      weaponMode === 'gun'
                        ? 'bg-indigo-100/80 border-indigo-900 scale-[1.02]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base leading-none">🔫</span>
                    <span>Gun</span>
                    <span className="text-[9px] font-bold text-indigo-900/45 text-center leading-tight">
                      Scope view, click to shoot
                    </span>
                  </button>
                </div>
              </div>

              {/* Reset Game Button */}
              <div className="mb-4 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">Game Actions</span>
                <button
                  type="button"
                  onClick={() => {
                    handleResetEverything();
                    setPreviewEstateLevel(null);
                    setShowSettingsModal(false);
                  }}
                  className="w-full bg-red-500 hover:bg-red-650 text-white font-black uppercase py-2.5 px-4 rounded-xl shadow-md active:translate-y-0.5 transition-all text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  Reset & Replay 🔄
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setPreviewEstateLevel(null);
                  setShowSettingsModal(false);
                  audioManager.playPop();
                }}
                className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold uppercase tracking-wide rounded-2xl transition-all duration-75 text-center text-xs shadow-md mt-1"
              >
                CONFIRM & CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEFEAT DIALOG OVERLAY */}
      <AnimatePresence>
        {showDefeatModal && (
          <div className="fixed inset-0 w-screen h-screen bg-red-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-red-900 p-8 rounded-[36px] max-w-sm w-full shadow-2xl text-red-950 text-center relative"
            >
              <span className="text-red-500 text-7xl block mb-2 drop-shadow-md">💀</span>
              <h2 className="text-3xl font-black tracking-tight text-red-900 uppercase mt-2">
                DEFEAT
              </h2>
              <p className="text-red-900/75 text-xs font-black tracking-widest uppercase mt-1 mb-5">
                Score hit the negative target of {formatCounterLabel(getLoseTargetScore(targetScore))}!
              </p>

              <div className="bg-red-50 p-5 rounded-2xl border-2 border-red-900 shadow-[0_4px_0_#7f1d1d] mb-6">
                <span className="text-[10px] font-black text-red-950/60 uppercase block">
                  FINAL SCORE
                </span>
                <span className="text-3xl font-black text-red-600 block mt-1">
                  {formatCounterLabel(stats.score)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDefeatModal(false);
                  handleResetEverything();
                }}
                className="w-full bg-red-500 hover:bg-red-400 text-white border-2 border-red-900 font-extrabold uppercase tracking-wide py-4 px-6 rounded-2xl shadow-[0_6px_0_#7f1d1d] active:translate-y-1 active:shadow-none transition-all duration-100 text-sm"
              >
                TRY AGAIN 🔄
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TARGET COUNT WINNER DIALOG OVERLAY */}
      <AnimatePresence>
        {showVictoryModal && (
          <div className="fixed inset-0 w-screen h-screen bg-indigo-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-indigo-950 p-8 rounded-[36px] max-w-sm w-full shadow-2xl text-indigo-950 text-center relative"
            >
              <span className="text-yellow-400 text-7xl block mb-2 drop-shadow-md animate-bounce">🏆</span>
              <h2 className="text-3xl font-black tracking-tight text-indigo-950 uppercase mt-2">VICTORY!</h2>
              <p className="text-indigo-900/75 text-xs font-black tracking-widest uppercase mt-1 mb-5">
                Target of {formatCounterLabel(targetScore)} reached!
              </p>

              {winProgress.total > 0 && (
                <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 shadow-[0_4px_0_#d97706] mb-4">
                  <span className="text-[10px] font-black text-amber-800/70 uppercase block tracking-widest">
                    Win Progress
                  </span>
                  <span className="text-3xl font-black text-amber-600 block mt-1 tabular-nums">
                    {winProgress.current} / {winProgress.total}
                  </span>
                </div>
              )}
              
              <div className="bg-yellow-100/50 p-5 rounded-2xl border-2 border-indigo-900 shadow-[0_4px_0_#1e1b4b] mb-6">
                <span className="text-[10px] font-black text-indigo-950/60 uppercase block">FINAL SCORE</span>
                <span className="text-3xl font-black text-emerald-600 block mt-1">{formatCounterLabel(stats.score)} ✨</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowVictoryModal(false);
                  handleResetEverything();
                }}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-950 border-2 border-indigo-900 font-extrabold uppercase tracking-wide py-4 px-6 rounded-2xl shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all duration-100 text-sm"
              >
                CONSTRUCT NEW TOWER 🔄
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ABSOLUTE FLOATING NOTIFICATION ALERTS */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute bottom-28 md:bottom-36 left-1/2 -translate-x-1/2 bg-neutral-900/95 text-white font-bold text-xs py-2.5 px-5 rounded-full border border-neutral-850 shadow-xl z-50 flex items-center gap-2 pointer-events-none"
          >
            <span>✨</span>
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
