/**
 * Stack Box — box effects from API settings (giftId → actionId + units).
 */

export type GiftBoxDirection = 'add' | 'subtract';

export type GiftBoxEffect = {
  direction: GiftBoxDirection;
  boxes: number;
  viewerName: string;
  viewerId: string | null;
  /** TikTok gift coin value — stats only, not used for box count */
  coins?: number;
};

export function getGiftViewerName(gift: Record<string, unknown>): string {
  const name = gift.nickname ?? gift.nickName ?? gift.displayName ?? gift.userName;
  if (name != null && String(name).trim()) return String(name).trim();
  const id = gift.uniqueId ?? gift.userId;
  return id != null ? String(id) : 'Viewer';
}

export function getGiftViewerId(gift: Record<string, unknown>): string | null {
  const raw =
    gift.userId ??
    gift.uniqueId ??
    gift.uniqueID ??
    gift.groupId ??
    gift.openId ??
    gift.open_id;
  return raw != null && String(raw).length > 0 ? `net-${String(raw)}` : null;
}

/** TikTok coin value — leaderboard stats only */
export function getGiftCoinValue(gift: Record<string, unknown>): number {
  const raw =
    gift.diamondCount ??
    gift.xu ??
    gift.coin ??
    gift.coins ??
    gift.diamond ??
    0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** TikTok combo stream — server may send 1 or '1' */
export function isComboGiftType(giftType: unknown): boolean {
  return giftType === 1 || giftType === '1';
}

/** repeatEnd from TikTok: true | 1 | 'true' | '1' */
export function isGiftRepeatEnd(gift: Record<string, unknown>): boolean {
  const v = gift.repeatEnd;
  if (v === true || v === 1) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1';
  }
  return false;
}

export function getComboRepeatTotal(gift: Record<string, unknown>): number {
  const n = Number(gift.repeatCount ?? gift.giftCount ?? 1);
  return Math.max(1, Number.isFinite(n) ? Math.floor(n) : 1);
}

export function getGiftRepeatCount(gift: Record<string, unknown>): number {
  if (isComboGiftType(gift.giftType)) {
    return getComboRepeatTotal(gift);
  }
  const n = Number(gift.repeatCount ?? gift.count ?? gift.giftCount ?? 1);
  return Math.max(1, Number.isFinite(n) ? Math.floor(n) : 1);
}

export function formatGiftBoxLabel(effect: GiftBoxEffect): string {
  const sign = effect.direction === 'add' ? '+' : '−';
  const boxLabel = effect.boxes === 1 ? 'box' : 'boxes';
  return `${effect.viewerName}: ${sign}${effect.boxes} ${boxLabel}`;
}
