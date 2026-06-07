/// <reference types="vite/client" />

declare module '*.mp3' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_USE_DEV_API?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_LOGIN_PATH?: string;
  readonly VITE_WS_FETCH_PATH?: string;
  readonly VITE_GAME_ID?: string;
  readonly VITE_GAME_SETTINGS_ID?: string;
  readonly VITE_RANK_GAME_ID?: string;
  readonly VITE_AUTH_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ElectronAPI {
  isElectron: boolean;
  platform: string;
}

interface Window {
  electronAPI?: ElectronAPI;
}
