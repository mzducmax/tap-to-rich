export type ChatTeam = 'A' | 'B';

/** Chat keywords shown in gift guide (Team Alpha) */
export const CHAT_TEAM_A_KEYWORDS = [
  'a',
  '1',
  'alpha',
  'ronando',
  'ro',
  'rô',
  'yes',
  'boy',
  'join a',
] as const;

/** Chat keywords shown in gift guide (Team Bravo) */
export const CHAT_TEAM_B_KEYWORDS = [
  '2',
  'b',
  'messi',
  'mess',
  'si',
  'no',
  'girl',
  'join b',
  'si',
] as const;

/** Bình luận khớp chính xác (sau trim + lowercase) → Team A */
const TEAM_A_KEYWORDS = new Set<string>(CHAT_TEAM_A_KEYWORDS);

/** Bình luận khớp chính xác → Team B */
const TEAM_B_KEYWORDS = new Set<string>(CHAT_TEAM_B_KEYWORDS);

function normalizeComment(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasRôOrRo(t: string): boolean {
  return t.includes('rô') || /\bro\b/.test(t);
}

function hasSiMessiOrMess(t: string): boolean {
  return (
    /\bsi\b/.test(t) ||
    t === 'mess' ||
    /\bmess\b/.test(t) ||
    t.includes('messi')
  );
}

/**
 * Trả về team nếu bình luận là lệnh join; null nếu không khớp.
 */
export function parseTeamFromComment(raw: string): ChatTeam | null {
  const txt = normalizeComment(raw);
  if (!txt) return null;

  if (TEAM_A_KEYWORDS.has(txt)) return 'A';
  if (TEAM_B_KEYWORDS.has(txt)) return 'B';

  if (txt.includes('join team a')) return 'A';
  if (txt.includes('join team b')) return 'B';

  // Cụm: "team a" + Rô/Ro (vd. team a rô, hello team a ro)
  if (txt.includes('team a') && !txt.includes('team b') && hasRôOrRo(txt)) {
    return 'A';
  }

  // Cụm: "team b" + Si/Mess/Messi (vd. team b si, ro team b si)
  if (txt.includes('team b') && !txt.includes('team a') && hasSiMessiOrMess(txt)) {
    return 'B';
  }

  return null;
}

export function getChatCommentText(msg: Record<string, unknown>): string {
  return String(msg.comment ?? msg.content ?? msg.text ?? '').trim();
}

/** Hồi sinh sau khi chết — bình luận `0` hoặc `rs` */
export function isRespawnComment(raw: string): boolean {
  const txt = normalizeComment(raw);
  return txt === '0' || txt === 'rs';
}
