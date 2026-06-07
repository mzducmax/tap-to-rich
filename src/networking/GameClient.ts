import {
  clearAuthSession,
  isWsEndpointFresh,
  loadAuthSession,
  loadWsEndpoint,
  saveAuthSession,
  saveWsEndpoint,
  WS_URL_TTL_MS,
  type StoredAuthSession,
} from './secureStorage';
import type {
  AuthLoadingPhase,
  GameClientConfig,
  GameSettingsPayload,
  GameSettingsResponse,
  MyGamesResponse,
  LoginResponse,
  WsUrlResponse,
} from './types';

/** Fetch WS URL failed vì token / phiên — sẽ thử login lại một lần */
class FetchWsAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchWsAuthError';
  }
}

function normalizeLoginData(data: LoginResponse['data']): StoredAuthSession {
  if (!data?.email || !data?.accessToken || !data?.googleId) {
    throw new Error('Login response missing data (email, accessToken, googleId)');
  }

  const userId = String(data.UserId ?? data.userId ?? data.googleId);

  return {
    email: data.email,
    accessToken: data.accessToken,
    googleId: data.googleId,
    userId,
    savedAt: Date.now(),
  };
}

export type { GameClientConfig } from './types';

export default class GameClient {
  private static readonly MAX_RECONNECT_ATTEMPTS = 20;

  private baseUrl: string;
  private loginUrl: string;
  private wsUrl: string;
  private gameId: string;
  private gameSettingsId: string;
  private resolvedGameSettingsId: string | null = null;
  private email: string | null;
  private accessToken: string | null = null;
  private googleId: string | null = null;
  private userId: string | null = null;
  private ws: WebSocket | null = null;
  /** Số lần đã lên lịch kết nối lại (reset khi mở socket thành công) */
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  /** Tự fetch lại WSS URL mỗi 2 giờ */
  private wsRefreshTimer: ReturnType<typeof setInterval> | null = null;
  /** True khi user gọi disconnect() — không tự reconnect */
  private intentionalClose = false;
  private isConnecting = false;
  private hasConnectedOnce = false;
  /** True while WS is down and we are reconnecting — never show overlay */
  private isReconnecting = false;
  /** Reconnect / 2h refresh — no fullscreen loading or login status spam */
  private silentBackgroundDepth = 0;

  onLoading: ((active: boolean, phase: AuthLoadingPhase, message: string) => void) | null = null;
  onLoginStatus: ((success: boolean, message: string) => void) | null = null;
  onLoginSuccess: ((data: { email: string; userId: string | null }) => void) | null = null;
  onGameSettings: ((settings: GameSettingsPayload | null) => void) | null = null;
  onOpen: (() => void) | null = null;
  onMessage: ((data: unknown) => void) | null = null;
  onClose: (() => void) | null = null;
  onError: ((error: unknown) => void) | null = null;
  onReconnectExhausted: (() => void) | null = null;

  constructor(config: GameClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.loginUrl = config.loginUrl.replace(/^\//, '');
    this.wsUrl = config.wsUrl.replace(/^\//, '');
    this.gameId = config.gameId;
    this.gameSettingsId = config.gameSettingsId ?? config.gameId;
    this.email = GameClient.getEmailFromUrl();
  }

  /** Ghép baseUrl + path giống game gốc: baseUrl + "login-game-client" */
  private apiUrl(path: string): string {
    const segment = path.replace(/^\//, '');
    return `${this.baseUrl}/${segment}`;
  }

  /** Email bắt buộc từ URL: ?email=user@example.com */
  static getEmailFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('email') ?? params.get('e');
    if (!raw) return null;
    const decoded = decodeURIComponent(raw).trim();
    return decoded.length > 0 ? decoded : null;
  }

  getEmailParam(): string | null {
    return GameClient.getEmailFromUrl();
  }

  private resolveEmail(): string {
    const fromSession = this.email?.trim();
    if (fromSession) return fromSession;

    const fromUrl = GameClient.getEmailFromUrl();
    if (fromUrl) return fromUrl;

    throw new Error('Please enter your email to sign in.');
  }

  private applySession(session: StoredAuthSession) {
    this.email = session.email;
    this.accessToken = session.accessToken;
    this.googleId = session.googleId;
    this.userId = session.userId;
  }

  get connectedBefore(): boolean {
    return this.hasConnectedOnce;
  }

  private isSilentBackground(): boolean {
    return this.silentBackgroundDepth > 0;
  }

  private async runInBackground<T>(fn: () => Promise<T>): Promise<T> {
    this.silentBackgroundDepth += 1;
    try {
      return await fn();
    } finally {
      this.silentBackgroundDepth -= 1;
    }
  }

  /** Full-screen overlay only on first bootstrap — never during reconnect / 2h refresh. */
  private emitLoading(active: boolean, phase: AuthLoadingPhase, message: string) {
    if (this.isSilentBackground() || this.isReconnecting || this.hasConnectedOnce) {
      return;
    }

    if (phase === 'error') {
      this.onLoading?.(false, 'error', message);
      return;
    }
    this.onLoading?.(active, phase, message);
  }

  private emitLoginStatus(success: boolean, message: string) {
    if (this.isSilentBackground() || this.isReconnecting || this.hasConnectedOnce) {
      return;
    }
    this.onLoginStatus?.(success, message);
  }

  private async persistSession() {
    if (!this.email || !this.accessToken || !this.googleId) return;

    await saveAuthSession({
      email: this.email,
      accessToken: this.accessToken,
      googleId: this.googleId,
      userId: this.userId,
      savedAt: Date.now(),
    });
  }

  async tryRestoreSession(paramEmail: string): Promise<boolean> {
    const cached = await loadAuthSession();
    if (!cached) return false;

    if (cached.email.toLowerCase() !== paramEmail.toLowerCase()) {
      clearAuthSession();
      return false;
    }

    this.applySession(cached);
    return true;
  }

  /** Đăng nhập lại (vd. Rank API 403) — không bật overlay loading */
  async refreshSessionForRank(): Promise<boolean> {
    return this.login({ silent: true });
  }

  async fetchGameSettings(): Promise<GameSettingsPayload | null> {
    if (!this.userId || !this.accessToken) return null;
    const resolvedGameId = await this.resolveGameSettingsIdFromApi();

    console.log('[GameClient] fetching get-game-settings', {
      userId: this.userId,
      gameId: resolvedGameId,
    });

    const res = await fetch(this.apiUrl('get-game-settings'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        userId: this.userId,
        gameId: resolvedGameId,
      }),
    });

    const text = await res.text();
    let response: GameSettingsResponse | undefined;
    try {
      response = text ? (JSON.parse(text) as GameSettingsResponse) : undefined;
    } catch {
      throw new Error('Get game settings parse error');
    }

    if (!res.ok) {
      const message = response?.message || `Get game settings failed (${res.status})`;
      throw new Error(message);
    }

    if (!response?.success) {
      throw new Error(response?.message || 'Get game settings failed');
    }

    console.log('[GameClient] get-game-settings success', response.gameSettings);

    return response.gameSettings ?? null;
  }

  private async resolveGameSettingsIdFromApi(): Promise<string> {
    if (!this.accessToken) {
      return this.gameSettingsId;
    }
    if (this.resolvedGameSettingsId) {
      return this.resolvedGameSettingsId;
    }

    const fallback = this.gameSettingsId;
    try {
      const res = await fetch(this.apiUrl('get-my-games'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          gameIds: [this.gameId],
        }),
      });

      const text = await res.text();
      let response: MyGamesResponse | undefined;
      try {
        response = text ? (JSON.parse(text) as MyGamesResponse) : undefined;
      } catch {
        console.warn('[GameClient] get-my-games parse error');
        return fallback;
      }

      if (!res.ok || !response?.success || !response.games?.length) {
        console.warn('[GameClient] get-my-games failed, fallback gameSettingsId', {
          status: res.status,
          message: response?.message,
        });
        return fallback;
      }

      const target = response.games.find((g) => g?.gameId === this.gameId) ?? response.games[0];
      const resolvedId = target?._id?.trim();
      if (!resolvedId) return fallback;

      this.resolvedGameSettingsId = resolvedId;
      console.log('[GameClient] resolved game settings id', {
        gameId: this.gameId,
        gameSettingsId: resolvedId,
      });
      return resolvedId;
    } catch (err) {
      console.warn('[GameClient] get-my-games error, fallback gameSettingsId', err);
      return fallback;
    }
  }

  async login(options?: { silent?: boolean }): Promise<boolean> {
    const silent = options?.silent === true;
    try {
      const email = this.resolveEmail();
      this.email = email;

      if (!silent) {
        this.emitLoading(true, 'login', `Signing in: ${email}...`);
        this.emitLoginStatus(false, '🔌 Connecting...');
      }

      const res = await fetch(this.apiUrl(this.loginUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          gameId: this.gameId,
        }),
      });

      if (!res.ok) {
        throw new Error(
          "You don't have access; upgrade to a Vlive Pro account for $15/month to play.",
        );
      }

      const response = (await res.json()) as LoginResponse;

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const session = normalizeLoginData(response.data);
      this.applySession(session);

      if (!silent) {
        this.emitLoading(true, 'save', 'Saving login session...');
      }
      await this.persistSession();

      if (!silent) {
        this.emitLoginStatus(true, response.message || 'Login successful!');
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (!silent) {
        this.emitLoading(false, 'error', message);
        this.emitLoginStatus(false, `❌ ${message}`);
      } else {
        console.warn('[GameClient] silent re-login failed:', message);
      }
      return false;
    }
  }

  private isLikelyAuthFailureResponse(response?: WsUrlResponse): boolean {
    const m = (response?.message || '').toLowerCase();
    return (
      /expired|unauthor|forbidden|invalid\s*token|token\s*invalid|session\s*expired|hết\s*hạn|not\s*authorized/i.test(
        m,
      )
    );
  }

  private async fetchWsUrlFromServerOnce(): Promise<string> {
    if (!this.googleId) {
      throw new Error('Missing UID');
    }

    this.emitLoading(true, 'fetch-ws', 'Fetching WebSocket URL...');

    const res = await fetch(this.apiUrl(this.wsUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
      },
      body: JSON.stringify({
        uid: this.googleId,
        type: 'game',
      }),
    });

    const text = await res.text();
    let response: WsUrlResponse | undefined;
    try {
      response = text ? (JSON.parse(text) as WsUrlResponse) : undefined;
    } catch {
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new FetchWsAuthError(`HTTP ${res.status}`);
        }
        throw new Error(`Fetch WS HTTP Error: ${res.status}`);
      }
      throw new Error('JSON parse error while fetching WS URL');
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new FetchWsAuthError(response?.message || `HTTP ${res.status}`);
      }
      if (this.isLikelyAuthFailureResponse(response)) {
        throw new FetchWsAuthError(response?.message || `HTTP ${res.status}`);
      }
      throw new Error(`Fetch WS HTTP Error: ${res.status} ${response?.message || ''}`.trim());
    }

    if (response?.success && response?.data?.url) {
      const url = response.data.url;
      await this.persistWsEndpoint(url);
      return url;
    }

    if (this.isLikelyAuthFailureResponse(response)) {
      throw new FetchWsAuthError(response?.message || 'Auth failed');
    }

    throw new Error(`API returned error: ${response?.message || 'Unknown'}`);
  }

  private async persistWsEndpoint(url: string): Promise<void> {
    if (!this.googleId) return;
    await saveWsEndpoint({
      url,
      googleId: this.googleId,
      savedAt: Date.now(),
    });
  }

  /** URL WSS còn hạn (< 2h) trong localStorage */
  private async getCachedWsUrlIfFresh(): Promise<string | null> {
    if (!this.googleId) return null;
    const cached = await loadWsEndpoint(this.googleId);
    if (!cached || !isWsEndpointFresh(cached)) return null;
    return cached.url;
  }

  /**
   * Lấy URL WSS. Nếu token hết hạn (401/403 hoặc message lỗi auth), tự login lại một lần rồi gọi API lại.
   */
  async fetchWsUrlFromServer(): Promise<string> {
    try {
      return await this.fetchWsUrlFromServerOnce();
    } catch (err) {
      if (err instanceof FetchWsAuthError) {
        return await this.refetchWsUrlAfterReLogin(err);
      }
      throw err;
    }
  }

  private async refetchWsUrlAfterReLogin(cause: unknown): Promise<string> {
    if (!this.isSilentBackground()) {
      this.emitLoading(true, 'login', 'Session expired, signing in again...');
      this.emitLoginStatus(false, 'Session expired — signing in again...');
    } else {
      console.log('🔁 Background: session expired, re-login...');
    }
    const ok = await this.login({ silent: this.isSilentBackground() });
    if (!ok) {
      throw cause;
    }
    this.emitLoginStatus(true, 'Session refreshed');
    return await this.fetchWsUrlFromServerOnce();
  }

  /**
   * Reconnect: ưu tiên WSS đã lưu local (< 2h). Hết hạn hoặc lỗi → fetch (có login lại nếu auth fail).
   */
  private async resolveWsUrlForConnect(preferCache: boolean): Promise<string> {
    if (preferCache) {
      const cached = await this.getCachedWsUrlIfFresh();
      if (cached) return cached;
    }
    return this.fetchWsUrlFromServer();
  }

  private stopWsUrlRefreshScheduler() {
    if (this.wsRefreshTimer) {
      clearInterval(this.wsRefreshTimer);
      this.wsRefreshTimer = null;
    }
  }

  private startWsUrlRefreshScheduler() {
    this.stopWsUrlRefreshScheduler();
    this.wsRefreshTimer = setInterval(() => {
      void this.refreshWsUrlInBackground();
    }, WS_URL_TTL_MS);
  }

  /** Mỗi 2h fetch WSS mới và lưu local (không ngắt socket, không overlay) */
  private async refreshWsUrlInBackground() {
    if (this.intentionalClose || !this.googleId) return;
    await this.runInBackground(async () => {
      try {
        await this.fetchWsUrlFromServer();
        console.log('🔁 WSS URL refreshed (2h schedule)');
      } catch (err) {
        console.warn('Background WSS URL refresh failed:', err);
      }
    });
  }

  async start(options?: { email?: string }): Promise<boolean> {
    if (this.isConnecting) return false;

    const paramEmail = (options?.email ?? this.email ?? GameClient.getEmailFromUrl())?.trim();
    if (!paramEmail) {
      this.emitLoading(false, 'error', 'Please enter your email to sign in.');
      this.emitLoginStatus(false, 'Please enter your email to sign in.');
      return false;
    }

    this.intentionalClose = false;
    this.email = paramEmail;
    this.isConnecting = true;
    const showOverlay = !this.hasConnectedOnce;

    try {
      if (showOverlay) {
        this.emitLoading(true, 'login', `Signing in: ${paramEmail}...`);
      }

      // Fresh sign-in every app entry — never skip the login API via cached session.
      clearAuthSession();

      const loggedIn = await this.login({ silent: !showOverlay });

      if (!loggedIn) {
        clearAuthSession();
        this.emitLoading(false, 'error', 'Sign-in failed');
        this.emitLoginStatus(false, 'Sign-in failed');
        return false;
      }

      try {
        const gameSettings = await this.fetchGameSettings();
        this.onGameSettings?.(gameSettings);
      } catch (err) {
        console.warn('[GameClient] get-game-settings failed:', err);
        this.onGameSettings?.(null);
      }

      const wsEndpoint = await this.resolveWsUrlForConnect(true);

      this.emitLoading(true, 'connect-ws', 'Connecting to live stream...');
      await this.connect(wsEndpoint);

      if (showOverlay) {
        this.emitLoading(false, 'ready', 'Connected');
      }

      this.onLoginSuccess?.({
        email: this.email!,
        userId: this.userId,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      console.error('WS flow failed:', message);
      clearAuthSession();
      this.emitLoading(false, 'error', message);
      this.emitLoginStatus(false, message);
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  /** Chờ tới khi WebSocket `onopen` — loading chỉ tắt sau bước này (trong `start`). */
  connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      }

      let settled = false;
      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        fn();
      };

      const timeoutId = setTimeout(() => {
        settle(() => reject(new Error('WebSocket connection timeout')));
      }, 20000);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.hasConnectedOnce = true;
        this.isReconnecting = false;
        this.startWsUrlRefreshScheduler();
        this.onOpen?.();
        settle(() => resolve());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          this.onMessage?.(data);
        } catch {
          this.onMessage?.(event.data);
        }
      };

      this.ws.onclose = () => {
        this.onClose?.();

        if (!settled) {
          settle(() => reject(new Error('WebSocket closed before connecting')));
          return;
        }

        if (this.intentionalClose || !this.hasConnectedOnce) {
          return;
        }

        this.isReconnecting = true;
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('WS Error:', err);
        if (!this.isSilentBackground()) {
          this.onError?.(err);
        }
        settle(() => reject(new Error('WebSocket connection failed')));
      };
    });
  }

  /** Trễ tăng dần (tối đa ~30s) rồi fetch URL + mở lại WSS */
  private scheduleReconnect() {
    if (this.intentionalClose) return;

    if (this.reconnectAttempts >= GameClient.MAX_RECONNECT_ATTEMPTS) {
      console.warn(
        `Giving up WebSocket reconnect after ${this.reconnectAttempts} attempts`,
      );
      console.warn('Connection lost after max reconnect attempts — reload the page.');
      this.isReconnecting = false;
      this.onReconnectExhausted?.();
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts += 1;
    const cap = 30_000;
    const base = 1000 * Math.pow(2, Math.min(this.reconnectAttempts - 1, 8));
    const delay = Math.min(cap, base) + Math.random() * 400;

    console.log(`🔁 WebSocket reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.performReconnect();
    }, delay);
  }

  private async performReconnect() {
    if (this.intentionalClose || this.isConnecting) return;

    this.isConnecting = true;
    await this.runInBackground(async () => {
      try {
        console.log('🔁 Background reconnect...');
        let wsEndpoint = await this.resolveWsUrlForConnect(true);
        try {
          await this.connect(wsEndpoint);
        } catch (connectErr) {
          console.warn('Cached WSS failed, fetching new URL...', connectErr);
          wsEndpoint = await this.fetchWsUrlFromServer();
          await this.connect(wsEndpoint);
        }
        console.log('✅ Background reconnect OK');
      } catch (err) {
        console.warn('Reconnect failed:', err);
        if (!this.intentionalClose) {
          this.scheduleReconnect();
        }
      } finally {
        this.isConnecting = false;
      }
    });
  }

  disconnect() {
    this.intentionalClose = true;
    this.isReconnecting = false;
    this.stopWsUrlRefreshScheduler();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      const socket = this.ws;
      this.ws = null;
      socket.onclose = null;
      socket.close();
    }
  }

  logout() {
    this.disconnect();
    clearAuthSession();
    this.accessToken = null;
    this.googleId = null;
    this.userId = null;
  }

  /** DEV: đóng socket để kích hoạt reconnect ngầm (không overlay). */
  devSimulateDisconnect(): void {
    if (!import.meta.env.DEV || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.close();
  }

  /** Credentials for rank-game bulk update / GET leaderboard */
  getRankAuth(): { uid: string; accessToken: string } | null {
    if (!this.googleId || !this.accessToken) return null;
    return { uid: this.googleId, accessToken: this.accessToken };
  }
}
