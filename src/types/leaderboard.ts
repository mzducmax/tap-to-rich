/** Shared row for room + global leaderboards */
export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  kills?: number;
  damage?: number;
  coin?: number;
}
