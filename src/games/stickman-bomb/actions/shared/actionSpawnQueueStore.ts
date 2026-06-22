/**
 * FIFO queue of upcoming key actions — batched, fingerprinted for minimal React updates.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type ActionSpawnQueueSnapshot = {
  readonly length: number;
  readonly slot0?: string;
  readonly slot1?: string;
  readonly slot2?: string;
  readonly overflow: number;
};

type Listener = () => void;

const EMPTY_SNAPSHOT: ActionSpawnQueueSnapshot = {
  length: 0,
  overflow: 0,
};

const listeners = new Set<Listener>();

let queue: string[] = [];
let snapshot: ActionSpawnQueueSnapshot = EMPTY_SNAPSHOT;
let fingerprint = '0';
let rafId: number | null = null;

function computeFingerprint(): string {
  const n = queue.length;
  if (n === 0) return '0';
  const overflow = Math.max(0, n - 3);
  return `${n}|${queue[0] ?? ''}|${queue[1] ?? ''}|${queue[2] ?? ''}|${overflow}`;
}

function buildSnapshot(): ActionSpawnQueueSnapshot {
  const n = queue.length;
  if (n === 0) return EMPTY_SNAPSHOT;
  return {
    length: n,
    slot0: queue[0],
    slot1: queue[1],
    slot2: queue[2],
    overflow: Math.max(0, n - 3),
  };
}

function publish() {
  rafId = null;
  const nextFingerprint = computeFingerprint();
  if (nextFingerprint === fingerprint) return;
  fingerprint = nextFingerprint;
  snapshot = buildSnapshot();
  listeners.forEach((listener) => listener());
}

function schedulePublish() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(publish);
}

export function subscribeActionSpawnQueue(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActionSpawnQueueSnapshot(): ActionSpawnQueueSnapshot {
  return snapshot;
}

export function pushActionSpawnQueue(actionKey: string) {
  queue.push(actionKey);
  schedulePublish();
}

/** Remove the next item when spawn starts (FIFO front). */
export function shiftActionSpawnQueue() {
  if (queue.length === 0) return;
  queue.shift();
  schedulePublish();
}

/** Undo the most recent push (enqueue rejected / inactive). */
export function popActionSpawnQueue() {
  if (queue.length === 0) return;
  queue.pop();
  schedulePublish();
}

export function resetActionSpawnQueue() {
  if (queue.length === 0) return;
  queue.length = 0;
  schedulePublish();
}
