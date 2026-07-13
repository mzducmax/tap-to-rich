/**
 * Top-right avatars (below the Settings button) — one chip per active gameplay season.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import {
  BIRD_SPRITE_DISPLAY_H,
  BIRD_SPRITE_DISPLAY_W,
  DUCK_SHEET_DISPLAY_H,
  DUCK_SHEET_DISPLAY_W,
  DUCK_SPRITE_URL,
  getDuckFrameOffset,
} from '../birds/config/birdSpriteConfig';
import {
  MICKY_AVATAR_URL,
} from '../moles/config/moleSpriteConfig';
import {
  GAMEPLAY_SEASONS,
  resolveActiveSeasons,
  type GameplaySeasonId,
} from '../config/seasonSessionConfig';
import type { BirdPhase } from '../birds/config/birdConfig';
import type { SheepPhase } from '../sheep/config/sheepConfig';
import type { MolePhase } from '../moles/config/moleConfig';

type SeasonSessionBadgeProps = {
  birdPhase: BirdPhase;
  sheepPhase: SheepPhase;
  molePhase: MolePhase;
  hidden?: boolean;
};

const CHIP_SIZE = 44;
const BIRD_CHIP_SCALE = CHIP_SIZE / BIRD_SPRITE_DISPLAY_W;
const BIRD_CHIP_H = Math.round(BIRD_SPRITE_DISPLAY_H * BIRD_CHIP_SCALE);

const BirdAvatarChip = memo(function BirdAvatarChip() {
  const offset = getDuckFrameOffset(2);
  const sheetW = Math.round(DUCK_SHEET_DISPLAY_W * BIRD_CHIP_SCALE);
  const sheetH = Math.round(DUCK_SHEET_DISPLAY_H * BIRD_CHIP_SCALE);

  return (
    <div className="season-avatar-chip" aria-hidden>
      <div className="season-avatar-bird-viewport">
        <img
          className="season-avatar-bird-sheet"
          src={DUCK_SPRITE_URL}
          alt=""
          draggable={false}
          style={{
            width: sheetW,
            height: sheetH,
            transform: `translate3d(${Math.round(offset.x * BIRD_CHIP_SCALE)}px, ${Math.round(offset.y * BIRD_CHIP_SCALE)}px, 0)`,
          }}
        />
      </div>
    </div>
  );
});

const SheepAvatarChip = memo(function SheepAvatarChip() {
  return (
    <div className="season-avatar-chip" aria-hidden>
      <span className="season-avatar-sheep-emoji">🐑</span>
    </div>
  );
});

const MickyAvatarChip = memo(function MickyAvatarChip() {
  return (
    <div className="season-avatar-chip" aria-hidden>
      <img
        className="season-avatar-micky-image"
        src={MICKY_AVATAR_URL}
        alt=""
        draggable={false}
      />
    </div>
  );
});

const AVATAR_CHIPS: Record<GameplaySeasonId, React.ReactNode> = {
  bird: <BirdAvatarChip />,
  sheep: <SheepAvatarChip />,
  micky: <MickyAvatarChip />,
};

export function SeasonSessionBadge({
  birdPhase,
  sheepPhase,
  molePhase,
  hidden = false,
}: SeasonSessionBadgeProps) {
  const activeSeasons = resolveActiveSeasons(birdPhase, sheepPhase, molePhase);
  if (hidden || activeSeasons.length === 0) return null;

  const ariaLabel = activeSeasons
    .map((id) => `${GAMEPLAY_SEASONS[id].label}: ${GAMEPLAY_SEASONS[id].title}`)
    .join(', ');

  return (
    <div
      className="season-session-avatars"
      role="img"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <style>{seasonSessionBadgeStyles}</style>
      {activeSeasons.map((seasonId) => (
        <React.Fragment key={seasonId}>{AVATAR_CHIPS[seasonId]}</React.Fragment>
      ))}
    </div>
  );
}

export const seasonSessionBadgeStyles = `
  .season-session-avatars {
    position: absolute;
    top: 64px;
    right: 16px;
    z-index: 60;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .season-avatar-chip {
    flex-shrink: 0;
    width: ${CHIP_SIZE}px;
    height: ${CHIP_SIZE}px;
    overflow: hidden;
    border-radius: 999px;
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    border: 2px solid rgba(255, 255, 255, 0.55);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.28),
      0 0 0 1px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .season-avatar-bird-viewport {
    width: ${CHIP_SIZE}px;
    height: ${BIRD_CHIP_H}px;
    overflow: hidden;
    position: relative;
    isolation: isolate;
    line-height: 0;
  }

  .season-avatar-bird-sheet {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    max-width: none;
    pointer-events: none;
    user-select: none;
    mix-blend-mode: screen;
  }

  .season-avatar-sheep-emoji {
    font-size: 1.65rem;
    line-height: 1;
    transform: translateY(1px);
  }

  .season-avatar-micky-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 35%;
    display: block;
    pointer-events: none;
    user-select: none;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.22));
  }
`;
