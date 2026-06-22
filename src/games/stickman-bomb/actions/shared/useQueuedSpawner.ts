/**
 * Queued spawner — mọi lần trigger được xếp hàng, drain theo cooldown + max concurrent.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { popActionSpawnQueue, shiftActionSpawnQueue } from './actionSpawnQueueStore';

const DEFAULT_MAX_QUEUE = 128;

export type QueuedSpawnerOptions<TPayload> = {
  active: boolean;
  maxConcurrent: number;
  cooldownMs: number;
  maxQueue?: number;
  createPayload: () => TPayload;
};

export function useQueuedSpawner<
  TItem extends { id: number },
  TPayload extends Record<string, unknown> = Record<string, never>,
>({
  active,
  maxConcurrent,
  cooldownMs,
  maxQueue = DEFAULT_MAX_QUEUE,
  createPayload,
}: QueuedSpawnerOptions<TPayload>) {
  const [items, setItems] = useState<TItem[]>([]);
  const queueRef = useRef<TPayload[]>([]);
  const itemsRef = useRef<TItem[]>([]);
  const cooldownUntilRef = useRef(0);
  const idRef = useRef(0);
  const drainTimerRef = useRef<number | null>(null);
  const activeRef = useRef(active);
  const createPayloadRef = useRef(createPayload);

  activeRef.current = active;
  createPayloadRef.current = createPayload;
  itemsRef.current = items;

  const clearDrainTimer = useCallback(() => {
    if (drainTimerRef.current !== null) {
      window.clearTimeout(drainTimerRef.current);
      drainTimerRef.current = null;
    }
  }, []);

  const tryDrain = useCallback(() => {
    if (!activeRef.current) return;

    if (queueRef.current.length === 0) return;

    if (itemsRef.current.length >= maxConcurrent) {
      clearDrainTimer();
      drainTimerRef.current = window.setTimeout(() => {
        drainTimerRef.current = null;
        tryDrain();
      }, 32);
      return;
    }

    if (Date.now() < cooldownUntilRef.current) {
      clearDrainTimer();
      drainTimerRef.current = window.setTimeout(() => {
        drainTimerRef.current = null;
        tryDrain();
      }, cooldownUntilRef.current - Date.now());
      return;
    }

    const payload = queueRef.current.shift();
    if (!payload) return;

    shiftActionSpawnQueue();

    const nextId = idRef.current + 1;
    idRef.current = nextId;
    cooldownUntilRef.current = Date.now() + cooldownMs;

    const newItem = { ...payload, id: nextId } as TItem;
    const nextItems = [...itemsRef.current, newItem];
    itemsRef.current = nextItems;
    setItems(nextItems);

    if (queueRef.current.length > 0) {
      clearDrainTimer();
      drainTimerRef.current = window.setTimeout(() => {
        drainTimerRef.current = null;
        tryDrain();
      }, cooldownMs);
    }
  }, [clearDrainTimer, cooldownMs, maxConcurrent]);

  const enqueue = useCallback(() => {
    if (!activeRef.current) {
      popActionSpawnQueue();
      return false;
    }
    if (queueRef.current.length >= maxQueue) {
      popActionSpawnQueue();
      return false;
    }
    queueRef.current.push(createPayloadRef.current());
    tryDrain();
    return true;
  }, [maxQueue, tryDrain]);

  const complete = useCallback(
    (id: number) => {
      const nextItems = itemsRef.current.filter((item) => item.id !== id);
      itemsRef.current = nextItems;
      setItems(nextItems);
      tryDrain();
    },
    [tryDrain],
  );

  const reset = useCallback(() => {
    clearDrainTimer();
    queueRef.current = [];
    cooldownUntilRef.current = 0;
    idRef.current = 0;
    itemsRef.current = [];
    setItems([]);
  }, [clearDrainTimer]);

  useEffect(() => {
    if (active) tryDrain();
    else clearDrainTimer();
  }, [active, clearDrainTimer, tryDrain]);

  useEffect(() => () => clearDrainTimer(), [clearDrainTimer]);

  return {
    items,
    enqueue,
    complete,
    reset,
    pendingCount: () => queueRef.current.length,
  };
}
