/**
 * Keydown routing with per-key pending queue — không bỏ lỡ lần ấn nào.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef } from 'react';
import { pushActionSpawnQueue } from './shared/actionSpawnQueueStore';
import type { KeyActionContext, KeyActionDefinition } from './types';

const MAX_PENDING_PER_KEY = 128;

export function useKeyActions(
  actions: KeyActionDefinition[],
  context: KeyActionContext,
) {
  const contextRef = useRef(context);
  contextRef.current = context;

  const pendingRef = useRef<Map<string, number>>(new Map());
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const flushPending = useCallback(() => {
    const ctx = contextRef.current;
    const pending = pendingRef.current;

    for (const action of actionsRef.current) {
      let count = pending.get(action.key) ?? 0;
      if (count <= 0) continue;

      while (count > 0 && action.canRun(ctx)) {
        action.run(ctx);
        count -= 1;
      }

      if (count > 0) pending.set(action.key, count);
      else pending.delete(action.key);
    }
  }, []);

  useEffect(() => {
    if (!context.paused && !context.hackerEffectRunning) flushPending();
  }, [context.paused, context.hackerEffectRunning, context.plinkoRunning, flushPending]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      const ctx = contextRef.current;
      for (const action of actionsRef.current) {
        if (e.key !== action.key) continue;
        e.preventDefault();
        pushActionSpawnQueue(action.key);

        if (action.canRun(ctx)) {
          action.run(ctx);
          queueMicrotask(flushPending);
        } else {
          const count = pendingRef.current.get(action.key) ?? 0;
          if (count < MAX_PENDING_PER_KEY) {
            pendingRef.current.set(action.key, count + 1);
          }
        }
        break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flushPending]);
}
