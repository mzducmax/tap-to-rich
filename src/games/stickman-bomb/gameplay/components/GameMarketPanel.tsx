/**
 * Game market panel — opened with [M]; lists mini-games and current estate stats.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Banknote, Bird, X } from 'lucide-react';
import { formatCounterLabel } from '../logic/formatCounterDisplay';
import { MARKET_GAMES, formatHouseLevelLabel, type MarketGameId } from '../config/marketConfig';
import { MoleControlPreview } from '../moles/components/MoleField';
import { moleStyles } from '../moles/styles/moleStyles';

type GameMarketPanelProps = {
  open: boolean;
  estateLevel: number;
  balance: number;
  onClose: () => void;
  onSelectGame: (id: MarketGameId) => void;
};

function MarketGameIcon({ id }: { id: MarketGameId }) {
  if (id === 'mole') {
    return (
      <div className="game-market-icon game-market-icon-mole" aria-hidden>
        <style>{moleStyles}</style>
        <MoleControlPreview />
      </div>
    );
  }

  if (id === 'bird') {
    return (
      <div className="game-market-icon game-market-icon-bird" aria-hidden>
        <Bird size={34} strokeWidth={2.2} className="text-sky-600" />
      </div>
    );
  }

  return (
    <div className="game-market-icon game-market-icon-loan" aria-hidden>
      <Banknote size={34} strokeWidth={2.2} className="text-emerald-600" />
    </div>
  );
}

export function GameMarketPanel({
  open,
  estateLevel,
  balance,
  onClose,
  onSelectGame,
}: GameMarketPanelProps) {
  return (
    <AnimatePresence>
      {open && (
    <div className="fixed inset-0 z-[48] flex items-center justify-center bg-indigo-950/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-indigo-950 bg-white text-indigo-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Game Market"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg border border-indigo-200 bg-white/90 p-1.5 text-indigo-900 transition-colors hover:bg-indigo-50"
          aria-label="Close Game Market"
        >
          <X size={16} />
        </button>

        <div className="border-b border-indigo-900/10 bg-gradient-to-br from-indigo-50 to-sky-50 px-5 pb-4 pt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/50">
            Game Market
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950/70">
                {formatHouseLevelLabel(estateLevel)}
              </span>
              <span className="rounded-lg border border-indigo-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-900/60">
                Press M to close
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-950/55">
                Balance
              </span>
              <span className="font-mono text-2xl font-black tabular-nums text-indigo-950">
                {formatCounterLabel(balance)}
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-[min(52vh,420px)] overflow-y-auto px-4 py-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-indigo-950/50">
            Available Games
          </p>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {MARKET_GAMES.map((game) => (
              <li key={game.id}>
                <button
                  type="button"
                  onClick={() => onSelectGame(game.id)}
                  className="group flex h-full w-full flex-col items-center gap-2 rounded-2xl border-2 border-indigo-100 bg-slate-50/90 px-3 py-4 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/80 active:scale-[0.98]"
                >
                  <MarketGameIcon id={game.id} />
                  <div className="flex min-h-[2.5rem] flex-col items-center justify-center gap-0.5">
                    <span className="text-[11px] font-black uppercase leading-tight tracking-wide text-indigo-950">
                      {game.name}
                    </span>
                    {game.hotkey && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-900/45">
                        Key {game.hotkey}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm font-black tabular-nums text-emerald-700">
                    {game.priceLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <style>{`
        .game-market-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4.5rem;
          height: 4.5rem;
          border-radius: 1rem;
          border: 2px solid rgba(99, 102, 241, 0.15);
          background: white;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .game-market-icon-mole .mole-control-preview {
          transform: scale(0.72);
          transform-origin: center;
        }

        .game-market-icon-mole .mole-hole {
          position: relative;
        }
      `}</style>
    </div>
      )}
    </AnimatePresence>
  );
}
