export type WinProgress = {
  current: number;
  total: number;
};

export function parseWinProgress(settings: Record<string, unknown> | undefined): WinProgress {
  const currentWin = settings?.currentWin as { number?: number } | undefined;
  const win = settings?.win as { number?: number } | undefined;

  return {
    current: Math.max(0, Math.floor(Number(currentWin?.number) || 0)),
    total: Math.max(0, Math.floor(Number(win?.number) || 0)),
  };
}
