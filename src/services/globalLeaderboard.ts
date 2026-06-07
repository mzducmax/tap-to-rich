import {
  computeMatchScore,
  getMatchRankScoreDelta,
  rawMatchDamage,
  fetchGlobalRankLeaderboard,
  hasMatchRankGiftXu,
  syncMatchToGlobalRank,
  type MatchRankPlayer,
  type RankAuth,
  type RankAuthRefresh,
} from '../networking/rankGameApi';
import type { LeaderboardEntry } from '../types/leaderboard';

export type { RankAuth, MatchRankPlayer };

/** Số hạng tối đa trên BXH global (API + UI) */
export const GLOBAL_LEADERBOARD_LIMIT = 100;

/** IDs/prefixes never synced to rank-game API (bots, gift-test panel, debug). */
const RANK_EXCLUDED_EXACT_IDS = new Set(['test-viewer-dev']);
const RANK_EXCLUDED_ID_PREFIXES = ['agent-', 'test-viewer', 'bot-', 'debug-'] as const;

/** Viewer TikTok thật — loại mọi bot/agent/test khỏi push & preview BXH global */
export function isRankExcludedPlayer(player: {
  id: string;
  isNetworkUser?: boolean;
  isAgent?: boolean;
}): boolean {
  if (player.isAgent === true) return true;
  if (RANK_EXCLUDED_EXACT_IDS.has(player.id)) return true;
  return RANK_EXCLUDED_ID_PREFIXES.some((p) => player.id.startsWith(p));
}

export function isRealNetworkPlayer(player: {
  id: string;
  isNetworkUser?: boolean;
  isAgent?: boolean;
}): boolean {
  if (isRankExcludedPlayer(player)) return false;
  return player.isNetworkUser === true || player.id.startsWith('net-');
}

export function filterRealNetworkPlayers<T extends { id: string; isNetworkUser?: boolean; isAgent?: boolean }>(
  players: T[],
): T[] {
  return players.filter(isRealNetworkPlayer);
}

export function playersToMatchRankPlayers(
  players: {
    id: string;
    name: string;
    avatar: string;
    matchCoins: number;
    kills: number;
    totalDamage: number;
    isNetworkUser?: boolean;
  }[],
): MatchRankPlayer[] {
  return filterRealNetworkPlayers(players).map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    matchCoins: p.matchCoins ?? 0,
    kills: p.kills,
    totalDamage: p.totalDamage,
  }));
}

export { hasMatchRankPoints } from '../networking/rankGameApi';

/** Hết trận — push bulk (chỉ viewer thật đã thả xu; bỏ qua nếu không ai quà) */
export async function pushMatchToGlobalRank(
  auth: RankAuth,
  players: MatchRankPlayer[],
  refreshAuth?: RankAuthRefresh,
): Promise<void> {
  const eligible = players.filter(
    (p) => !isRankExcludedPlayer({ id: p.id }) && hasMatchRankGiftXu(p),
  );
  await syncMatchToGlobalRank(auth, eligible, { refreshAuth });
}

/** Tab Global — GET /rank-game merged (metrics=score,kills,damage,coin) */
/** Fallback khi chưa login / API lỗi — dùng stats trận hiện tại */
type MatchPreviewSource = Parameters<typeof playersToMatchRankPlayers>[0];

/** Preview: merge match stats into cached global (server uses sum op). */
export function mergeMatchPreviewIntoGlobal(
  globalEntries: LeaderboardEntry[],
  matchPlayers: MatchPreviewSource,
  limit = GLOBAL_LEADERBOARD_LIMIT,
): LeaderboardEntry[] {
  const byId = new Map(globalEntries.map((e) => [e.id, { ...e }]));

  for (const p of playersToMatchRankPlayers(matchPlayers)) {
    if (!hasMatchRankGiftXu(p)) continue;
    const scoreDelta = getMatchRankScoreDelta(p);
    const killsDelta = Math.floor(p.kills);
    const damageDelta = rawMatchDamage(p.totalDamage);
    const coinDelta = Math.floor(p.matchCoins);
    const existing = byId.get(p.id);

    if (existing) {
      byId.set(p.id, {
        ...existing,
        name: p.name,
        avatar: p.avatar?.trim() || existing.avatar,
        score: existing.score + scoreDelta,
        kills: (existing.kills ?? 0) + killsDelta,
        damage: (existing.damage ?? 0) + damageDelta,
        coin: (existing.coin ?? 0) + coinDelta,
      });
    } else {
      byId.set(p.id, {
        id: p.id,
        name: p.name,
        avatar: p.avatar?.trim() || '',
        score: scoreDelta,
        kills: killsDelta,
        damage: damageDelta,
        coin: coinDelta,
      });
    }
  }

  return [...byId.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Cập nhật score từ API score metric — giữ kills/damage/coin local đã merge */
export function mergeApiScoreIntoEntries(
  existing: LeaderboardEntry[],
  scoreFromApi: LeaderboardEntry[],
): LeaderboardEntry[] {
  const scoreById = new Map(scoreFromApi.map((e) => [e.id, e]));
  const seen = new Set<string>();

  const merged = existing.map((e) => {
    seen.add(e.id);
    const api = scoreById.get(e.id);
    if (!api) return e;
    return {
      ...e,
      score: api.score,
      name: api.name || e.name,
      avatar: api.avatar?.trim() ? api.avatar : e.avatar,
    };
  });

  for (const api of scoreFromApi) {
    if (!seen.has(api.id)) merged.push(api);
  }

  return merged.sort((a, b) => b.score - a.score);
}

export function playersToGlobalFallbackEntries(
  players: MatchPreviewSource,
): LeaderboardEntry[] {
  return playersToMatchRankPlayers(players)
    .filter(hasMatchRankGiftXu)
    .map((p) => {
      const damageFull = rawMatchDamage(p.totalDamage);
      const coin = Math.floor(p.matchCoins);
      const kills = Math.floor(p.kills);
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: computeMatchScore(coin, kills, damageFull),
        kills,
        damage: damageFull,
        coin,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function fetchGlobalLeaderboard(
  auth: RankAuth | null,
  roomFallback?: LeaderboardEntry[],
  limit = GLOBAL_LEADERBOARD_LIMIT,
  onScoreReady?: (entries: LeaderboardEntry[]) => void,
  refreshAuth?: RankAuthRefresh,
): Promise<LeaderboardEntry[]> {
  if (!auth) {
    return roomFallback ?? [];
  }

  try {
    const full = await fetchGlobalRankLeaderboard(
      auth,
      limit,
      (scoreEntries) => {
        onScoreReady?.(scoreEntries);
      },
      { refreshAuth },
    );
    return full;
  } catch (err) {
    console.error('[globalLeaderboard] fetch failed:', err);
    return roomFallback ?? [];
  }
}
