import { getGameClientConfig } from './vliveConfig';
import type { LeaderboardEntry } from '../types/leaderboard';

export type RankMetric = 'score' | 'kills' | 'damage' | 'coin';

export interface RankAuth {
  uid: string;
  accessToken: string;
}

/** Gọi khi Rank API 401/403 — login lại và trả token mới */
export type RankAuthRefresh = () => Promise<RankAuth | null>;

export interface RankApiOptions {
  refreshAuth?: RankAuthRefresh;
}

export interface MatchRankPlayer {
  id: string;
  name: string;
  avatar: string;
  matchCoins: number;
  kills: number;
  totalDamage: number;
}

export interface RankBulkItem {
  memberKey: string;
  value: number;
  nickname: string;
  avatar?: string;
  uniqueId?: string;
}

/** Legacy single-metric row */
interface RankRow {
  memberKey: string;
  value: number;
  nickname?: string;
  avatar?: string;
  uniqueId?: string;
  updatedAt?: number;
}

interface RankGetResponse {
  success?: boolean;
  ranking?: RankRow[];
}

/** Merged rank-game row (metrics=score,kills,damage,coin) */
export interface RankMergedRow {
  memberKey: string;
  score: number;
  kills: number;
  damage: number;
  coin: number;
  nickname?: string;
  avatar?: string;
  userId?: string;
  uniqueId?: string;
  updatedAt?: number;
}

export type RankSortBy = RankMetric;

export interface RankMergedGetResponse {
  success?: boolean;
  scope?: 'room' | 'global';
  uid?: string;
  gameId?: string;
  sortBy?: RankSortBy;
  metrics?: RankSortBy[];
  period?: string;
  total?: number;
  ranking?: RankMergedRow[];
}

export interface FetchRankMergedParams {
  limit?: number;
  sortBy?: RankSortBy;
  /** Có uid → BXH phòng; bỏ qua → BXH global */
  uid?: string;
}

const MERGED_RANK_METRICS_QUERY = 'score,kills,damage,coin';

interface RankBulkResponse {
  success?: boolean;
  message?: string;
}

const RANK_METRICS: RankMetric[] = ['score', 'kills', 'damage', 'coin'];

function apiBase(): string {
  return getGameClientConfig().baseUrl.replace(/\/$/, '');
}

function rankGameId(): string {
  return getGameClientConfig().rankGameId ?? 'avatar_strike';
}

/** Damage thô trận — metric `damage` lưu full, không chia 1000 */
export function rawMatchDamage(totalDamage: number): number {
  return Math.floor(totalDamage);
}

/** Chỉ dùng cho metric `score`: coin×100 + kills×10 + round(damage/1000) */
export function computeMatchScore(coin: number, kills: number, damage: number): number {
  const c = Math.floor(coin);
  const k = Math.floor(kills);
  const d = rawMatchDamage(damage);
  return Math.round(c * 100 + k * 10 + d / 1000);
}

export function getMatchRankScoreDelta(player: MatchRankPlayer): number {
  return computeMatchScore(
    player.matchCoins,
    player.kills,
    player.totalDamage,
  );
}

/** Đã thả xu (quà) trong trận — mới đẩy lên BXH global */
export function hasMatchRankGiftXu(player: MatchRankPlayer): boolean {
  return Math.floor(player.matchCoins) > 0;
}

/** Có ít nhất 1 player thả xu — mới gọi update-bulk */
export function hasMatchRankPoints(players: MatchRankPlayer[]): boolean {
  return players.some(hasMatchRankGiftXu);
}

export function buildMatchRankItems(
  players: MatchRankPlayer[],
  metric: RankMetric,
): RankBulkItem[] {
  return players.map((p) => {
    const damageFull = rawMatchDamage(p.totalDamage);
    const coin = Math.floor(p.matchCoins);
    const kills = Math.floor(p.kills);
    let value: number;
    switch (metric) {
      case 'score':
        value = computeMatchScore(coin, kills, damageFull);
        break;
      case 'kills':
        value = kills;
        break;
      case 'damage':
        value = damageFull;
        break;
      case 'coin':
        value = coin;
        break;
    }
    const avatar = p.avatar?.trim();
    return {
      memberKey: p.id,
      value,
      nickname: p.name,
      ...(avatar ? { avatar } : {}),
    };
  });
}

const RANK_FETCH_TIMEOUT_MS = 15_000;

/** Players per POST — tránh body quá lớn (gateway / express limit) khi phòng đông */
const RANK_BULK_CHUNK_SIZE = 40;

function isRankAuthError(status: number, body: string): boolean {
  if (status === 401 || status === 403) return true;
  const lower = body.toLowerCase();
  return /jwt expired|token expired|unauthor|invalid\s*token|forbidden/.test(lower);
}

async function rankFetch<T>(
  auth: RankAuth,
  path: string,
  init?: RequestInit,
  options?: RankApiOptions,
  retried = false,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RANK_FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${apiBase()}/${path.replace(/^\//, '')}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const refreshAuth = options?.refreshAuth;
    if (!retried && refreshAuth && isRankAuthError(res.status, text)) {
      const refreshed = await refreshAuth();
      if (refreshed) {
        return rankFetch(refreshed, path, init, options, true);
      }
    }
    throw new Error(`Rank API ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/** POST /rank-game/update-bulk — one metric, one chunk */
async function postRankBulkChunk(
  auth: RankAuth,
  metric: RankMetric,
  items: RankBulkItem[],
  options?: RankApiOptions,
): Promise<void> {
  const body = {
    uid: auth.uid,
    gameId: rankGameId(),
    metric,
    op: 'sum' as const,
    items,
  };

  const data = await rankFetch<RankBulkResponse>(
    auth,
    'rank-game/update-bulk',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    options,
  );

  if (data.success === false) {
    throw new Error(data.message ?? `update-bulk failed (${metric})`);
  }
}

/** POST /rank-game/update-bulk — one metric; chia `items` thành nhiều request nhỏ */
export async function updateRankBulk(
  auth: RankAuth,
  metric: RankMetric,
  items: RankBulkItem[],
  options?: RankApiOptions,
): Promise<void> {
  if (items.length === 0) return;

  for (let i = 0; i < items.length; i += RANK_BULK_CHUNK_SIZE) {
    const chunk = items.slice(i, i + RANK_BULK_CHUNK_SIZE);
    await postRankBulkChunk(auth, metric, chunk, options);
  }
}

/** Hết trận — 4 request song song (score, kills, damage, coin) */
export async function syncMatchToGlobalRank(
  auth: RankAuth,
  players: MatchRankPlayer[],
  options?: RankApiOptions,
): Promise<void> {
  if (players.length === 0 || !hasMatchRankPoints(players)) return;

  await Promise.all(
    RANK_METRICS.map((metric) =>
      updateRankBulk(auth, metric, buildMatchRankItems(players, metric), options),
    ),
  );
}

/** GET merged — một request, đủ score/kills/damage/coin trên cùng tập top N */
export async function fetchRankMerged(
  auth: RankAuth,
  params: FetchRankMergedParams = {},
  options?: RankApiOptions,
): Promise<RankMergedRow[]> {
  const q = new URLSearchParams({
    gameId: rankGameId(),
    metrics: MERGED_RANK_METRICS_QUERY,
    merge: 'true',
    sortBy: params.sortBy ?? 'score',
    limit: String(params.limit ?? 100),
  });
  if (params.uid) {
    q.set('uid', params.uid);
  }

  const data = await rankFetch<RankMergedGetResponse>(auth, `rank-game?${q}`, undefined, options);
  return data.ranking ?? [];
}

export function mergedRowsToLeaderboardEntries(rows: RankMergedRow[]): LeaderboardEntry[] {
  return rows.map((row) => ({
    id: row.memberKey,
    name: row.nickname ?? row.memberKey,
    avatar: row.avatar?.trim() || '',
    score: Math.floor(row.score ?? 0),
    kills: Math.floor(row.kills ?? 0),
    damage: Math.floor(row.damage ?? 0),
    coin: Math.floor(row.coin ?? 0),
  }));
}

/** @deprecated Legacy — một metric; dùng fetchRankMerged thay thế */
export async function fetchRankMetric(
  auth: RankAuth,
  metric: RankMetric,
  limit = 100,
  options?: RankApiOptions,
): Promise<RankRow[]> {
  const q = new URLSearchParams({
    gameId: rankGameId(),
    metric,
    limit: String(limit),
  });

  const data = await rankFetch<RankGetResponse>(auth, `rank-game?${q}`, undefined, options);
  return data.ranking ?? [];
}

/** BXH từ metric score — hiển thị UI ngay trước khi fetch kills/damage/coin */
export function leaderboardEntriesFromScoreRows(rows: RankRow[]): LeaderboardEntry[] {
  return rows
    .map((row) => ({
      id: row.memberKey,
      name: row.nickname ?? row.memberKey,
      avatar: row.avatar?.trim() || '',
      score: Math.floor(row.value),
      kills: 0,
      damage: 0,
      coin: 0,
    }))
    .sort((a, b) => b.score - a.score);
}

function mergeRankMetrics(
  scoreRows: RankRow[],
  killsRows: RankRow[],
  damageRows: RankRow[],
  coinRows: RankRow[],
): LeaderboardEntry[] {
  const byKey = new Map<string, LeaderboardEntry>();

  const ensure = (row: RankRow): LeaderboardEntry => {
    let e = byKey.get(row.memberKey);
    if (!e) {
      e = {
        id: row.memberKey,
        name: row.nickname ?? row.memberKey,
        avatar: row.avatar?.trim() || '',
        score: 0,
        kills: 0,
        damage: 0,
        coin: 0,
      };
      byKey.set(row.memberKey, e);
    }
    if (row.nickname) e.name = row.nickname;
    if (row.avatar?.trim()) e.avatar = row.avatar.trim();
    return e;
  };

  for (const row of scoreRows) {
    const e = ensure(row);
    e.score = Math.floor(row.value);
  }
  for (const row of killsRows) {
    ensure(row).kills = Math.floor(row.value);
  }
  for (const row of damageRows) {
    ensure(row).damage = Math.floor(row.value);
  }
  for (const row of coinRows) {
    ensure(row).coin = Math.floor(row.value);
  }

  return [...byKey.values()].sort((a, b) => b.score - a.score);
}

/** BXH global — GET merged (không uid), sortBy=score */
export async function fetchGlobalRankLeaderboard(
  auth: RankAuth,
  limit = 100,
  onScoreReady?: (entries: LeaderboardEntry[]) => void,
  options?: RankApiOptions,
): Promise<LeaderboardEntry[]> {
  const rows = await fetchRankMerged(auth, { limit, sortBy: 'score' }, options);
  const entries = mergedRowsToLeaderboardEntries(rows);
  onScoreReady?.(entries);
  return entries;
}

/** BXH phòng streamer — GET merged + uid */
export async function fetchRoomRankLeaderboard(
  auth: RankAuth,
  limit = 100,
  sortBy: RankSortBy = 'score',
  options?: RankApiOptions,
): Promise<LeaderboardEntry[]> {
  const rows = await fetchRankMerged(
    auth,
    { limit, sortBy, uid: auth.uid },
    options,
  );
  return mergedRowsToLeaderboardEntries(rows);
}
