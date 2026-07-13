/**
 * One Plinko round — drag on the top rail, release to drop.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import { formatScoreFloatAmount } from '../../../gameplay/logic/scoreFloatPalette';
import { audioManager } from '../../../../../utils/audio';
import {
  PLINKO_AIM_ZONE_H,
  PLINKO_AIM_ZONE_OFFSET_Y,
  PLINKO_EXIT_MS,
  PLINKO_MULTIPLIERS,
  PLINKO_REWARD_HOLD_MS,
  formatPlinkoMultiplier,
  plinkoReward,
} from '../config/plinkoConfig';
import {
  buildPlinkoAnimSegments,
  samplePlinkoSegment,
} from '../logic/plinkoAnimPath';
import {
  clampDropX,
  formatPlinkoProbability,
  plinkoAllSlotProbabilities,
  plinkoBoardMetrics,
  simulatePlinkoFromDrop,
} from '../logic/plinkoSimulation';
import type { PlinkoLandPayload } from '../types';

type PlinkoInstanceProps = {
  roundId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  onLand: (payload: PlinkoLandPayload) => void;
  onComplete: () => void;
};

type Phase = 'aim' | 'falling';

function pegKey(row: number, col: number): string {
  return `${row}-${col}`;
}

const CONFETTI_COLORS = ['#fde047', '#fb923c', '#34d399', '#60a5fa', '#f472b6', '#ef4444'];
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, id) => ({
  id,
  left: Math.round((id * 37 + 11) % 100),
  color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
  delay: (id % 7) * 55,
  duration: 900 + (id % 5) * 160,
}));

function PlinkoInstanceInner({
  roundId,
  layerRef,
  onLand,
  onComplete,
}: PlinkoInstanceProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const dropRingRef = useRef<HTMLDivElement>(null);
  const onLandRef = useRef(onLand);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  const pointerDownRef = useRef(false);
  const dropXRef = useRef(0);

  const [phase, setPhase] = useState<Phase>('aim');
  const [winSlot, setWinSlot] = useState<number | null>(null);
  const [landReward, setLandReward] = useState<number | null>(null);
  const [landPoint, setLandPoint] = useState<{ x: number; y: number } | null>(null);
  const [exiting, setExiting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hitPegKeys, setHitPegKeys] = useState<ReadonlySet<string>>(() => new Set());

  onLandRef.current = onLand;
  onCompleteRef.current = onComplete;

  const boardMetrics = useMemo(() => plinkoBoardMetrics(), []);
  const slotProbabilities = useMemo(() => plinkoAllSlotProbabilities(), []);
  const dropZone = boardMetrics.dropZone;

  const syncBallPosition = useCallback((x: number) => {
    const ball = ballRef.current;
    const ring = dropRingRef.current;
    if (!ball) return;
    ball.style.left = `${x}px`;
    ball.style.top = `${dropZone.y}px`;
    if (ring) {
      ring.style.left = `${x}px`;
      ring.style.top = `${dropZone.y}px`;
    }
  }, [dropZone.y]);

  useLayoutEffect(() => {
    const randomX = dropZone.minX + Math.random() * (dropZone.maxX - dropZone.minX);
    dropXRef.current = randomX;
    syncBallPosition(randomX);
  }, [dropZone.minX, dropZone.maxX, syncBallPosition]);

  useEffect(() => {
    if (phase !== 'aim') return;
    const timer = window.setTimeout(() => {
      setPhase('falling');
    }, 600);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useLayoutEffect(() => {
    if (phase !== 'falling') return;

    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function runDrop() {
      const ready = await waitForRefs([layerRef, boardRef, ballRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const simulation = simulatePlinkoFromDrop(dropXRef.current);
      const { slotIndex: resolvedSlot, multiplier: resolvedMultiplier } = simulation;
      const segments = buildPlinkoAnimSegments(simulation);
      const ball = ballRef.current!;

      const flashPeg = (row: number, col: number) => {
        const key = pegKey(row, col);
        setHitPegKeys((prev) => new Set(prev).add(key));
        audioManager.playPlinkoBounce();
        window.setTimeout(() => {
          setHitPegKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, 130);
      };

      const animateSegment = async (
        from: { x: number; y: number },
        to: { x: number; y: number },
        durationMs: number,
        kind: 'drop' | 'bounce' | 'land',
        reboundHeightPx: number,
        pegHit?: { row: number; col: number },
      ) => {
        const start = performance.now();
        await new Promise<void>((resolve) => {
          const tick = (now: number) => {
            if (cancelled || sequenceId !== sequenceIdRef.current) {
              resolve();
              return;
            }
            if (isGameplayPaused()) {
              requestAnimationFrame(tick);
              return;
            }
            const elapsed = now - start;
            const t = Math.min(1, elapsed / durationMs);
            const { x, y, impact } = samplePlinkoSegment(
              from,
              to,
              t,
              kind,
              reboundHeightPx,
            );
            ball.style.left = `${x}px`;
            ball.style.top = `${y}px`;
            const squashY = 1 - impact * 0.28;
            const squashX = 1 + impact * 0.2;
            ball.style.transform = `scale(${squashX}, ${squashY})`;
            if (t < 1) {
              requestAnimationFrame(tick);
            } else {
              if (pegHit) flashPeg(pegHit.row, pegHit.col);
              resolve();
            }
          };
          requestAnimationFrame(tick);
        });
      };

      ball.classList.remove('plinko-ball--aim', 'plinko-ball--dragging');

      for (const segment of segments) {
        await animateSegment(
          segment.from,
          segment.to,
          segment.durationMs,
          segment.kind,
          segment.reboundHeight,
          segment.pegHit,
        );
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
      }

      const land = segments[segments.length - 1]?.to ?? simulation.path[simulation.path.length - 1];
      const reward = plinkoReward(resolvedMultiplier);
      setWinSlot(resolvedSlot);
      setLandReward(reward);
      setLandPoint({ x: land.x, y: land.y });

      onLandRef.current({
        slotIndex: resolvedSlot,
        multiplier: resolvedMultiplier,
        reward,
        x: land.x,
        y: land.y,
      });

      await sleep(PLINKO_REWARD_HOLD_MS);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      setExiting(true);
      await sleep(PLINKO_EXIT_MS);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      onCompleteRef.current();
    }

    void runDrop();

    return () => {
      cancelled = true;
    };
  }, [layerRef, phase, roundId]);

  const slotClass = (index: number) => {
    const mult = PLINKO_MULTIPLIERS[index] ?? 1;
    const base = ['plinko-slot'];
    if (index === 0 || index === PLINKO_MULTIPLIERS.length - 1) base.push('plinko-slot--edge');
    else if (mult <= 1) base.push('plinko-slot--center');
    if (winSlot === index) base.push('plinko-slot--win');
    return base.join(' ');
  };

  const railWidth = dropZone.maxX - dropZone.minX;
  const railLeft = dropZone.minX;
  const aimPad = 28;
  const aimTop = dropZone.y - PLINKO_AIM_ZONE_OFFSET_Y;

  const statsRowClass = (index: number) => {
    const mult = PLINKO_MULTIPLIERS[index] ?? 1;
    const base = ['plinko-stats__row'];
    if (index === 0 || index === PLINKO_MULTIPLIERS.length - 1) base.push('plinko-stats__row--edge');
    else if (mult <= 1) base.push('plinko-stats__row--center');
    if (winSlot === index) base.push('plinko-stats__row--win');
    return base.join(' ');
  };

  return (
    <div className="plinko-board-scaler">
      <div className={`plinko-play-area${exiting ? ' plinko-play-area--exiting' : ''}`}>
        <div ref={boardRef} className="plinko-board">
          <div className="plinko-board__title" aria-hidden>
            <span className="plinko-board__title-icon">🎱</span>
            <span className="plinko-board__title-text">PLINKO</span>
          </div>
          {phase === 'aim' && (
            <>
              <div
                className="plinko-drop-rail"
                style={{ left: railLeft, width: railWidth, top: dropZone.y - 3 }}
                aria-hidden
              />
              <div
                className="plinko-aim-zone"
                style={{
                  left: railLeft - aimPad,
                  width: railWidth + aimPad * 2,
                  top: aimTop,
                }}
                role="img"
                aria-label="Ball auto-dropping"
              >
                <span className="plinko-aim-zone__chev plinko-aim-zone__chev--left" aria-hidden>
                  ◀
                </span>
                <span className="plinko-aim-zone__label">AUTO DROP...</span>
                <span className="plinko-aim-zone__chev plinko-aim-zone__chev--right" aria-hidden>
                  ▶
                </span>
              </div>
            </>
          )}

        <div
          ref={dropRingRef}
          className={`plinko-board__drop-ring${phase === 'aim' ? ' plinko-board__drop-ring--active' : ''}`}
          style={{ left: dropZone.centerX, top: dropZone.y }}
          aria-hidden
        />

        <div
          ref={ballRef}
          className={[
            'plinko-ball',
            phase === 'aim' ? 'plinko-ball--aim' : '',
            dragging ? 'plinko-ball--dragging' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ left: dropZone.centerX, top: dropZone.y }}
          aria-hidden
        />

        {boardMetrics.pegRows.map((row, rowIndex) =>
          row.map((peg, pegIndex) => (
            <div
              key={`peg-${rowIndex}-${pegIndex}`}
              className={`plinko-peg${hitPegKeys.has(pegKey(rowIndex, pegIndex)) ? ' plinko-peg--hit' : ''}`}
              style={{ left: peg.x, top: peg.y }}
              aria-hidden
            />
          )),
        )}

        <div className="plinko-slots">
          {PLINKO_MULTIPLIERS.map((mult, index) => (
            <div key={`slot-${index}`} className={slotClass(index)}>
              {formatPlinkoMultiplier(mult)}
            </div>
          ))}
        </div>

        {landReward != null && landPoint && (
          <div
            className="plinko-reward-burst"
            style={{
              left: landPoint.x,
              top: landPoint.y - 10,
            }}
          >
            🎱 +{formatScoreFloatAmount(landReward)}$
          </div>
        )}

        {landReward != null && (
          <div className="plinko-celebrate" aria-hidden>
            <div className="plinko-celebrate__banner">🎉 CONGRATULATIONS! 🎉</div>
            <div className="plinko-celebrate__confetti">
              {CONFETTI_PIECES.map((piece) => (
                <span
                  key={piece.id}
                  className="plinko-confetti"
                  style={{
                    left: `${piece.left}%`,
                    background: piece.color,
                    animationDelay: `${piece.delay}ms`,
                    animationDuration: `${piece.duration}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        </div>

        <aside className="plinko-stats" aria-label="Landing odds per slot">
          <div className="plinko-stats__title">
            <span className="plinko-stats__title-game">🎱 PLINKO</span>
            <span className="plinko-stats__title-sub">Odds</span>
          </div>
          <div className="plinko-stats__rows">
            {PLINKO_MULTIPLIERS.map((mult, index) => (
              <div key={`prob-${index}`} className={statsRowClass(index)}>
                <span className="plinko-stats__mult">{formatPlinkoMultiplier(mult)}</span>
                <span className="plinko-stats__pct">
                  {formatPlinkoProbability(slotProbabilities[index] ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export const PlinkoInstance = memo(PlinkoInstanceInner);
