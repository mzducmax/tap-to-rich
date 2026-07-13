/**
 * +/- label that rises from the estate (house) center.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  buildScoreFloatRiseKeyframes,
  formatScoreFloatAmount,
  getScoreFloatPalette,
  getScoreFloatPresentation,
} from '../logic/scoreFloatPalette';
import type { ScoreFloatSource } from '../types/gameplayTypes';
import { HAMMER_COMBO_HIT_TARGET, HAMMER_MEGA_COMBO_HIT_TARGET } from '../config/hammerConfig';
import { MOLE_SCORE_FLOAT_THEME } from '../moles/config/moleScoreFloatTheme';
import type { SheepVariant } from '../sheep/config/sheepConfig';
import {
  formatSheepHitLabel,
  SHEEP_SCORE_FLOAT_THEMES,
  SHEEP_SCORE_RISE_ANIMATION,
} from '../sheep/config/sheepScoreFloatTheme';

type Props = {
  delta: number;
  source: ScoreFloatSource;
  sheepVariant?: SheepVariant;
  gameAreaRef: React.RefObject<HTMLElement | null>;
  estateTargetRef: React.RefObject<HTMLElement | null>;
  onComplete: () => void;
};

export function EstateScoreFloat({
  delta,
  source,
  sheepVariant,
  gameAreaRef,
  estateTargetRef,
  onComplete,
}: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const amount = Math.abs(delta);

  useLayoutEffect(() => {
    if (amount === 0) {
      onComplete();
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const measure = () => {
      if (cancelled) return;

      const area = gameAreaRef.current;
      const estate = estateTargetRef.current;
      if (!area || !estate) {
        if (attempts < 10) {
          attempts += 1;
          requestAnimationFrame(measure);
          return;
        }
        onComplete();
        return;
      }

      const areaRect = area.getBoundingClientRect();
      const estateRect = estate.getBoundingClientRect();
      const y =
        source === 'hammerMegaCombo'
          ? estateRect.top - areaRect.top - 96
          : source === 'hammerCombo'
            ? estateRect.top - areaRect.top - 78
            : source === 'key-0' ||
              source === 'key-3' ||
              source === 'key-5' ||
              source === 'key-8' ||
              source === 'key-i'
              ? estateRect.top - areaRect.top - 10
              : source === 'key-2'
                ? estateRect.top - areaRect.top + estateRect.height * 0.04
                : estateRect.top - areaRect.top + estateRect.height * 0.18;

      setPos({
        x: estateRect.left - areaRect.left + estateRect.width * 0.5,
        y,
      });
    };

    measure();

    return () => {
      cancelled = true;
    };
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const presentation = getScoreFloatPresentation(source, amount);

  useEffect(() => {
    if (!pos || amount === 0) return;
    const fallbackMs = Math.ceil(presentation.duration * 1000) + 400;
    const timer = window.setTimeout(onComplete, fallbackMs);
    return () => window.clearTimeout(timer);
  }, [amount, onComplete, pos, presentation.duration]);

  if (!pos || amount === 0) return null;

  if (sheepVariant) {
    const theme = SHEEP_SCORE_FLOAT_THEMES[sheepVariant];
    const rise = SHEEP_SCORE_RISE_ANIMATION.estate;

    return (
      <motion.span
        initial={{ ...rise.initial, x: '-50%' }}
        animate={{ ...rise.animate, x: '-50%' }}
        transition={rise.transition}
        onAnimationComplete={onComplete}
        className="absolute pointer-events-none select-none z-[60] font-black tabular-nums whitespace-nowrap"
        style={{
          left: pos.x,
          top: pos.y,
          fontSize: theme.estateFontSize,
          fontFamily: '"Arial Rounded MT Bold", "Nunito", "Trebuchet MS", sans-serif',
          fontWeight: 900,
          letterSpacing: '0.02em',
          color: theme.color,
          WebkitTextStroke: `1.75px ${theme.stroke}`,
          textShadow: theme.shadow,
          paintOrder: 'stroke fill',
          padding: '0.18rem 0.78rem',
          borderRadius: '999px',
          background: theme.bg,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.34)',
          lineHeight: 1.1,
        }}
      >
        {formatSheepHitLabel(delta)}
      </motion.span>
    );
  }

  const sign = delta >= 0 ? '+' : '-';
  const palette = getScoreFloatPalette(source);
  const isHammerCombo = source === 'hammerCombo';
  const isHammerMegaCombo = source === 'hammerMegaCombo';
  const isDiceRoll = source === 'key-6';
  const isPlinko = source === 'key-2';
  const isSoccerBall = source === 'key-8';
  const isLightningStrike = source === 'key-7';
  const isMole = source === 'mole';
  const isGrappleHeist = source === 'key-3';

  if (isGrappleHeist) {
    return (
      <motion.span
        initial={{
          x: '-50%',
          y: 0,
          opacity: 0,
          scale: presentation.initialScale,
          rotate: -10,
        }}
        animate={{
          y: [0, -10, -28, -96, presentation.riseY[2]],
          opacity: [0, 1, 1, 0.85, 0],
          scale: [
            presentation.initialScale,
            presentation.peakScale,
            presentation.peakScale * 0.96,
            presentation.peakScale * 0.9,
            presentation.endScale,
          ],
          rotate: [-10, 6, -4, 2, 0],
          x: ['-50%', '-53%', '-47%', '-51%', '-50%'],
        }}
        transition={{
          duration: presentation.duration,
          ease: [0.18, 1.1, 0.34, 1],
          times: [0, 0.12, 0.3, 0.62, 1],
        }}
        onAnimationComplete={onComplete}
        className="absolute pointer-events-none select-none z-[60] font-black tabular-nums whitespace-nowrap"
        style={{
          left: pos.x,
          top: pos.y,
          fontSize: presentation.fontSize,
          color: palette.color,
          WebkitTextStroke: `${presentation.strokeWidth} ${palette.stroke}`,
          paintOrder: 'stroke fill',
          textShadow: `0 0 ${presentation.glowBlur} ${palette.glow}, 0 0 16px rgba(255,255,255,0.55), 0 5px 0 rgba(127,29,29,0.9), 0 9px 20px rgba(0,0,0,0.6)`,
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
          lineHeight: 1,
          letterSpacing: '0.03em',
        }}
      >
        🃏 -{formatScoreFloatAmount(amount)}$
      </motion.span>
    );
  }

  if (isHammerMegaCombo) {
    const riseY = buildScoreFloatRiseKeyframes(presentation.riseY);

    return (
      <motion.span
        initial={{
          x: '-50%',
          y: 0,
          opacity: 0,
          scale: presentation.initialScale,
          rotate: -8,
        }}
        animate={{
          y: riseY,
          opacity: [0, 1, 1, 1, 0.85, 0],
          scale: [
            presentation.initialScale,
            presentation.peakScale,
            presentation.peakScale * 0.94,
            presentation.peakScale * 1.02,
            presentation.endScale,
            presentation.endScale,
          ],
          rotate: [-8, 6, -4, 3, 0, 0],
          x: '-50%',
        }}
        transition={{
          duration: presentation.duration,
          ease: [0.2, 1.2, 0.32, 1],
          times: [0, 0.12, 0.32, 0.5, 0.75, 1],
        }}
        onAnimationComplete={onComplete}
        className="absolute pointer-events-none select-none z-[80] font-black tabular-nums whitespace-nowrap flex flex-col items-center"
        style={{
          left: pos.x,
          top: pos.y,
        }}
      >
        <span
          style={{
            fontSize: '1.4rem',
            fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
            color: '#fff7ed',
            WebkitTextStroke: '2px #7c2d12',
            paintOrder: 'stroke fill',
            letterSpacing: '0.1em',
            textShadow: '0 0 16px rgba(249,115,22,0.95), 0 2px 8px rgba(0,0,0,0.65)',
          }}
        >
          🔥 MEGA COMBO x{HAMMER_MEGA_COMBO_HIT_TARGET}
        </span>
        <span
          style={{
            fontSize: presentation.fontSize,
            color: palette.color,
            WebkitTextStroke: `${presentation.strokeWidth} ${palette.stroke}`,
            paintOrder: 'stroke fill',
            textShadow: `0 0 ${presentation.glowBlur} ${palette.glow}, 0 0 22px rgba(255,255,255,0.6), 0 5px 14px rgba(0,0,0,0.7)`,
            fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1,
            letterSpacing: '0.03em',
          }}
        >
          +{formatScoreFloatAmount(amount)}$
        </span>
      </motion.span>
    );
  }

  if (isHammerCombo) {
    const riseY = buildScoreFloatRiseKeyframes(presentation.riseY);

    return (
      <motion.span
        initial={{
          x: '-50%',
          y: 0,
          opacity: 0,
          scale: presentation.initialScale,
          rotate: -6,
        }}
        animate={{
          y: riseY,
          opacity: [0, 1, 1, 0.8, 0],
          scale: [
            presentation.initialScale,
            presentation.peakScale,
            presentation.peakScale * 0.95,
            presentation.endScale,
            presentation.endScale,
          ],
          rotate: [-6, 4, -2, 0, 0],
          x: '-50%',
        }}
        transition={{
          duration: presentation.duration,
          ease: [0.2, 1.15, 0.35, 1],
          times: [0, 0.14, 0.4, 0.7, 1],
        }}
        onAnimationComplete={onComplete}
        className="absolute pointer-events-none select-none z-[70] font-black tabular-nums whitespace-nowrap flex flex-col items-center"
        style={{
          left: pos.x,
          top: pos.y,
        }}
      >
        <span
          style={{
            fontSize: '1.05rem',
            fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
            color: '#fef08a',
            WebkitTextStroke: '1.5px #701a75',
            paintOrder: 'stroke fill',
            letterSpacing: '0.12em',
            textShadow: '0 0 12px rgba(217,70,239,0.9), 0 2px 6px rgba(0,0,0,0.6)',
          }}
        >
          ⚡ COMBO x{HAMMER_COMBO_HIT_TARGET}
        </span>
        <span
          style={{
            fontSize: presentation.fontSize,
            color: palette.color,
            WebkitTextStroke: `${presentation.strokeWidth} ${palette.stroke}`,
            paintOrder: 'stroke fill',
            textShadow: `0 0 ${presentation.glowBlur} ${palette.glow}, 0 0 16px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.65)`,
            fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1,
            letterSpacing: '0.03em',
          }}
        >
          +{formatScoreFloatAmount(amount)}$
        </span>
      </motion.span>
    );
  }

  if (isDiceRoll) {
    return (
      <motion.span
        initial={{
          x: '-50%',
          y: 0,
          opacity: 0,
          scale: presentation.initialScale,
        }}
        animate={{
          y: [0, 0, 0, -58, -205],
          opacity: [0, 1, 1, 0.72, 0],
          scale: [0.38, 1.18, 1.14, 1.06, 0.9],
          x: '-50%',
        }}
        transition={{
          duration: presentation.duration,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.14, 0.34, 0.62, 1],
        }}
        onAnimationComplete={onComplete}
        className="absolute pointer-events-none select-none z-[60] font-black tabular-nums whitespace-nowrap"
        style={{
          left: pos.x,
          top: pos.y,
          fontSize: presentation.fontSize,
          color: palette.color,
          WebkitTextStroke: '5px #000000',
          paintOrder: 'stroke fill',
          textShadow:
            '0 0 18px rgba(250,204,21,0.85), 0 4px 0 #000, 0 6px 14px rgba(0,0,0,0.55)',
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
          lineHeight: 1,
          letterSpacing: '0.035em',
        }}
      >
        🎲 +{formatScoreFloatAmount(amount)}$
      </motion.span>
    );
  }

  if (isPlinko) {
    const riseY = buildScoreFloatRiseKeyframes(presentation.riseY);

    return (
      <motion.span
        initial={{
          x: '-50%',
          y: 0,
          opacity: 0,
          scale: presentation.initialScale,
        }}
        animate={{
          y: riseY,
          opacity: [0, 1, 1, 0.78, 0],
          scale: [0.34, 1.2, 1.14, 1.04, 0.92],
          x: '-50%',
        }}
        transition={{
          duration: presentation.duration,
          ease: [0.22, 1.12, 0.36, 1],
          times: [0, 0.12, 0.34, 0.68, 1],
        }}
        onAnimationComplete={onComplete}
        className="absolute pointer-events-none select-none z-[60] font-black tabular-nums whitespace-nowrap"
        style={{
          left: pos.x,
          top: pos.y,
          fontSize: presentation.fontSize,
          color: palette.color,
          WebkitTextStroke: `${presentation.strokeWidth} ${palette.stroke}`,
          paintOrder: 'stroke fill',
          textShadow:
            `0 0 ${presentation.glowBlur} ${palette.glow}, 0 4px 0 rgba(62, 39, 35, 0.85), 0 7px 16px rgba(0, 0, 0, 0.52)`,
          fontFamily: '"Arial Rounded MT Bold", "Nunito", "Trebuchet MS", sans-serif',
          lineHeight: 1,
          letterSpacing: '0.03em',
        }}
      >
        🎱 +{formatScoreFloatAmount(amount)}$
      </motion.span>
    );
  }

  return (
    <motion.span
      initial={{
        x: '-50%',
        y: 0,
        opacity: 0,
        scale: presentation.initialScale,
        rotate: isMole ? -5 : 0,
        filter: isLightningStrike ? 'brightness(3.2) saturate(1.4)' : undefined,
      }}
      animate={{
        y: presentation.riseY,
        opacity: isLightningStrike
          ? [0, 1, 0.72, 0.88, 0.62, 0]
          : [0, 1, 1, 0],
        scale: isLightningStrike
          ? [
              presentation.initialScale,
              presentation.peakScale,
              presentation.peakScale * 0.94,
              presentation.peakScale * 0.88,
              presentation.endScale,
              presentation.endScale,
            ]
          : [
              presentation.initialScale,
              presentation.peakScale,
              presentation.peakScale * 0.92,
              presentation.endScale,
            ],
        rotate: isMole ? [-5, 5, -2, 0] : 0,
        x: isLightningStrike
          ? ['-50%', '-47%', '-53%', '-49%', '-50%', '-50%']
          : '-50%',
        filter: isLightningStrike
          ? [
              'brightness(3.2) saturate(1.4)',
              'brightness(2.4) saturate(1.25)',
              'brightness(1.5) saturate(1.1)',
              'brightness(1.15) saturate(1)',
              'brightness(1) saturate(1)',
              'brightness(1) saturate(1)',
            ]
          : undefined,
      }}
      transition={{
        duration: presentation.duration,
        ease: isLightningStrike ? [0.18, 1, 0.32, 1] : 'easeOut',
        times: isLightningStrike
          ? [0, 0.07, 0.14, 0.28, 0.62, 1]
          : [0, 0.12, 0.65, 1],
      }}
      onAnimationComplete={onComplete}
      className="absolute pointer-events-none select-none z-[60] font-black tabular-nums whitespace-nowrap"
      style={{
        left: pos.x,
        top: pos.y,
        fontSize: presentation.fontSize,
                color: palette.color,
        textShadow: isLightningStrike
          ? `0 0 ${presentation.glowBlur} rgba(98,62,252,0.92), 0 0 22px rgba(162,212,255,0.95), 0 0 10px rgba(255,252,240,1), 0 4px 14px rgba(28,12,148,0.62)`
          : isSoccerBall
            ? `0 0 ${presentation.glowBlur} ${palette.glow}, 0 3px 0 rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.6)`
            : isMole
              ? MOLE_SCORE_FLOAT_THEME.shadow
              : `0 0 ${presentation.glowBlur} ${palette.glow}, 0 0 8px rgba(255,255,255,0.35), 0 3px 8px rgba(0,0,0,0.72)`,
        WebkitTextStroke: `${presentation.strokeWidth} ${palette.stroke}`,
        paintOrder: isSoccerBall || isLightningStrike || isMole ? 'stroke fill' : undefined,
        fontFamily: isSoccerBall
          ? '"Courier New", Courier, monospace'
          : isLightningStrike
            ? '"Arial Black", "Helvetica Neue", Arial, sans-serif'
            : isMole
              ? MOLE_SCORE_FLOAT_THEME.fontFamily
              : '"Courier New", Courier, monospace',
        lineHeight: 1,
        letterSpacing: source === 'key-9'
          ? '0.04em'
          : isLightningStrike
            ? '0.03em'
            : undefined,
      }}
    >
      {isLightningStrike ? '⚡ ' : isMole ? `${MOLE_SCORE_FLOAT_THEME.emoji} ` : ''}
      {sign}
      {formatScoreFloatAmount(amount)}$
    </motion.span>
  );
}
