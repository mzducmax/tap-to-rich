/**
 * Vertical spawn preview — 3 upcoming actions + overflow count (right edge).
 * Lightweight: no blur, fixed slots, memoized avatars, batched store updates.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { memo, useSyncExternalStore } from 'react';
import {
  getActionSpawnQueueSnapshot,
  subscribeActionSpawnQueue,
} from './actionSpawnQueueStore';
import { getActionQueueVisual } from './actionQueueVisuals';
import { KEY_8_SOCCER_BALL } from '../types';

type ActionSpawnQueueDockProps = {
  avatarUrl?: string;
  hidden?: boolean;
};

const SLOT_CLASS =
  'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-black/55 contain-strict';

const QueueAvatar = memo(function QueueAvatar({
  actionKey,
  avatarUrl,
  dimmed,
}: {
  actionKey: string;
  avatarUrl?: string;
  dimmed: boolean;
}) {
  const visual = getActionQueueVisual(actionKey, avatarUrl);

  return (
    <div
      className={`${SLOT_CLASS}${dimmed ? ' opacity-50' : ''}`}
      title={visual.label}
      aria-label={visual.label}
    >
      {visual.imageUrl ? (
        <img
          src={visual.imageUrl}
          alt=""
          width={40}
          height={40}
          decoding="async"
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="text-lg leading-none select-none" aria-hidden>
          {visual.emoji}
        </span>
      )}
      {actionKey === KEY_8_SOCCER_BALL && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-black/80 px-0.5 text-[8px] font-black tabular-nums text-white/90">
          {actionKey}
        </span>
      )}
    </div>
  );
});

const OverflowBadge = memo(function OverflowBadge({ count }: { count: number }) {
  return (
    <div
      className={`${SLOT_CLASS} border-dashed border-white/20`}
      aria-label={`${count} more actions waiting`}
      title={`+${count} waiting`}
    >
      <span className="font-mono text-xs font-black tabular-nums text-white/80">
        +{count}
      </span>
    </div>
  );
});

const QueueSlot = memo(function QueueSlot({
  actionKey,
  avatarUrl,
  dimmed,
}: {
  actionKey?: string;
  avatarUrl?: string;
  dimmed: boolean;
}) {
  if (!actionKey) {
    return <div className="h-10 w-10 shrink-0" aria-hidden />;
  }
  return <QueueAvatar actionKey={actionKey} avatarUrl={avatarUrl} dimmed={dimmed} />;
});

export function ActionSpawnQueueDock({ avatarUrl, hidden = false }: ActionSpawnQueueDockProps) {
  const { length, slot0, slot1, slot2, overflow } = useSyncExternalStore(
    subscribeActionSpawnQueue,
    getActionSpawnQueueSnapshot,
    getActionSpawnQueueSnapshot,
  );

  if (hidden || length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute right-3 top-1/2 z-60 flex -translate-y-1/2 flex-col items-center gap-1.5 select-none"
      aria-label="Upcoming action queue"
      role="list"
    >
      <div role="listitem">
        <QueueSlot actionKey={slot0} avatarUrl={avatarUrl} dimmed={false} />
      </div>
      <div role="listitem">
        <QueueSlot actionKey={slot1} avatarUrl={avatarUrl} dimmed />
      </div>
      <div role="listitem">
        <QueueSlot actionKey={slot2} avatarUrl={avatarUrl} dimmed />
      </div>
      {overflow > 0 && (
        <div role="listitem">
          <OverflowBadge count={overflow} />
        </div>
      )}
    </div>
  );
}
