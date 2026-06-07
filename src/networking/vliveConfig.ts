import type { GameClientConfig } from './types';

/** API Zonee — dev local / live production */
export const VLIVE_DEV_API = 'http://localhost:6896/api/';
export const VLIVE_PROD_API = 'https://play.zonee.pro/api/';
export const VLIVE_LOGIN_PATH = 'login-game-client';
export const VLIVE_WS_PATH = 'fetch-ws';

export function getGameClientConfig(): GameClientConfig {
  const useDev = import.meta.env.VITE_USE_DEV_API === 'true';

  return {
    baseUrl:
      import.meta.env.VITE_API_BASE_URL ||
      (useDev ? VLIVE_DEV_API : VLIVE_PROD_API),
    loginUrl: import.meta.env.VITE_LOGIN_PATH || VLIVE_LOGIN_PATH,
    wsUrl: import.meta.env.VITE_WS_FETCH_PATH || VLIVE_WS_PATH,
    gameId: import.meta.env.VITE_GAME_ID || 'stack_box',
    gameSettingsId: import.meta.env.VITE_GAME_SETTINGS_ID || import.meta.env.VITE_GAME_ID || 'stack_box',
    rankGameId:
      import.meta.env.VITE_RANK_GAME_ID ||
      import.meta.env.VITE_GAME_ID ||
      'stack_box',
  };
}
