import { useCallback, useEffect, useRef, useState } from 'react';
import GameClient from '../networking/GameClient';
import MessageRouter from '../networking/MessageRouter';
import {
  ACTION_RESET,
  ACTION_WIN_ADD,
  ACTION_WIN_SUBTRACT,
  parseGameExecuteAction,
  resolveGameExecuteEffects,
  resolveSettingsAction,
  type SettingsActionResult,
} from '../networking/gameActionExecutor';
import {
  getGiftCoinValue,
  getGiftViewerId,
  getGiftViewerName,
  type GiftBoxEffect,
} from '../networking/giftBoxRules';
import {
  buildGiftActionMap,
  createLikeRuntimeState,
  parseLikeSetting,
  parseSocialTriggerSetting,
  resetLikeRuntimeState,
  shouldTriggerLikeTarget,
  shouldTriggerRegularLike,
  type GiftActionSetting,
  type LikeSetting,
  type SocialTriggerSetting,
} from '../networking/liveSettingsRules';
import type { GameSettingsPayload, NetworkMessage } from '../networking/types';
import { getGameClientConfig } from '../networking/vliveConfig';
import type { RankAuth } from '../networking/rankGameApi';
import { saveLastLoginEmail } from '../components/LoginScreen';
import { clearAuthSession } from '../networking/secureStorage';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export type GiftBoxHandler = (effect: GiftBoxEffect) => void;
export type SettingsActionHandler = (action: SettingsActionResult) => void;

export type LoginRequest = {
  email: string;
  key: number;
};

export function useLiveNetworking(
  loginRequest: LoginRequest | null,
  onGiftBox?: GiftBoxHandler,
  onSettingsAction?: SettingsActionHandler,
) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [authLoading, setAuthLoading] = useState({ active: false, message: '' });
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettingsPayload | null>(null);

  const gameClientRef = useRef<GameClient | null>(null);
  const messageRouterRef = useRef<MessageRouter | null>(null);
  const authOverlayLockedRef = useRef(false);
  const onGiftBoxRef = useRef(onGiftBox);
  const onSettingsActionRef = useRef(onSettingsAction);
  onGiftBoxRef.current = onGiftBox;
  onSettingsActionRef.current = onSettingsAction;

  const getRankAuth = useCallback((): RankAuth | null => {
    return gameClientRef.current?.getRankAuth() ?? null;
  }, []);

  const refreshRankAuth = useCallback(async (): Promise<RankAuth | null> => {
    const client = gameClientRef.current;
    if (!client) return null;
    const ok = await client.refreshSessionForRank();
    return ok ? client.getRankAuth() : null;
  }, []);

  const disconnect = useCallback(() => {
    gameClientRef.current?.disconnect();
    gameClientRef.current = null;
    messageRouterRef.current = null;
    clearAuthSession();
    setIsReady(false);
    setLoggedInEmail(null);
    setConnectionStatus('idle');
    setConnectionMessage('');
    setAuthLoading({ active: false, message: '' });
    setLoginError(null);
    setGameSettings(null);
    authOverlayLockedRef.current = false;
  }, []);

  useEffect(() => {
    if (!loginRequest?.email) {
      disconnect();
      return;
    }

    const email = loginRequest.email.trim();
    setLoginError(null);
    setIsReady(false);
    authOverlayLockedRef.current = false;

    const gameClient = new GameClient(getGameClientConfig());
    let giftActionById = new Map<number, GiftActionSetting>();
    const likeState = createLikeRuntimeState();
    const socialSettingsRef = {
      like: null as LikeSetting | null,
      likeTarget: null as LikeSetting | null,
      share: null as SocialTriggerSetting | null,
      follow: null as SocialTriggerSetting | null,
      join: null as SocialTriggerSetting | null,
    };

    const dispatchSettingsAction = (
      result: SettingsActionResult,
      source: string,
      meta?: Record<string, unknown>,
    ) => {
      const handler =
        onSettingsActionRef.current ??
        (onGiftBoxRef.current
          ? (r: SettingsActionResult) => {
              if (r.type === 'box') onGiftBoxRef.current?.(r.effect);
            }
          : undefined);

      if (result.type === 'reset') {
        console.log('[Action:Reset] triggered', { source, ...meta, result });
      } else if (result.type === 'winDelta') {
        console.log('[Action:Win]', { source, delta: result.delta, viewer: result.viewerName, ...meta });
      }

      const payload =
        result.type === 'box' ? { ...result, source } : result;
      handler?.(payload);
    };

    const executeSettingsAction = (
      actionId: number,
      units: number,
      number: number,
      viewerName: string,
      source: string,
      options?: { viewerId?: string | null; coins?: number },
    ) => {
      const result = resolveSettingsAction(actionId, units, number, viewerName, options);
      if (!result) {
        if (actionId === ACTION_RESET) {
          console.warn('[Action:Reset] resolve failed', { actionId, units, number, source });
        }
        return;
      }

      if (actionId === ACTION_RESET) {
        console.log('[Action:Reset] executeSettingsAction', {
          source,
          actionId,
          units,
          number,
          viewerName,
          resultType: result.type,
        });
      }

      dispatchSettingsAction(result, source, { actionId, units, number });
    };

    const isGiftMappedInSettings = (gift: Record<string, unknown>): boolean => {
      const giftId = Number(gift.giftId);
      return Number.isFinite(giftId) && giftActionById.has(giftId);
    };

    const applyGiftActionFromSettings = (gift: Record<string, unknown>): boolean => {
      const giftId = Number(gift.giftId);
      if (!Number.isFinite(giftId)) return false;
      const action = giftActionById.get(giftId);
      if (!action) return false;
      executeSettingsAction(
        action.actionId,
        action.units,
        action.number,
        getGiftViewerName(gift),
        'GiftAction',
        {
          viewerId: getGiftViewerId(gift),
          coins: getGiftCoinValue(gift),
        },
      );
      return true;
    };

    const handleLikeBySettings = (msg: NetworkMessage) => {
      const likeTarget = socialSettingsRef.likeTarget;
      const likeTargetResult = shouldTriggerLikeTarget(msg, likeTarget, likeState);
      if (likeTargetResult.trigger && likeTarget) {
        executeSettingsAction(
          likeTarget.action,
          1,
          likeTarget.amount,
          likeTargetResult.viewerName,
          'LikeTarget',
        );
      }

      const likeSetting = socialSettingsRef.like;
      const likeResult = shouldTriggerRegularLike(msg, likeSetting, likeState);
      if (likeResult.trigger && likeSetting) {
        executeSettingsAction(
          likeSetting.action,
          1,
          likeSetting.amount,
          likeResult.viewerName,
          'Like',
        );
      }
    };

    const handleSocialEventBySettings = (
      msg: NetworkMessage,
      setting: SocialTriggerSetting | null,
      source: string,
      fallbackName: string,
    ) => {
      if (!setting) return;
      const viewerName = String(msg.nickname ?? msg.uniqueId ?? fallbackName);
      executeSettingsAction(setting.action, 1, setting.amount, viewerName, source);
    };

    const applyGameSettings = (settings: GameSettingsPayload | null) => {
      setGameSettings(settings);
      giftActionById = buildGiftActionMap(settings?.actions);
      resetLikeRuntimeState(likeState);

      const settingsObj = settings?.settings as Record<string, unknown> | undefined;
      socialSettingsRef.like = parseLikeSetting(settingsObj?.like);
      socialSettingsRef.likeTarget = parseLikeSetting(settingsObj?.likeTarget);
      socialSettingsRef.share = parseSocialTriggerSetting(settingsObj?.share);
      socialSettingsRef.follow = parseSocialTriggerSetting(settingsObj?.follow);
      socialSettingsRef.join = parseSocialTriggerSetting(settingsObj?.join);

      console.groupCollapsed(
        `[GameSettings] loaded (${settings?.actions?.length ?? 0} actions)`,
      );
      console.log('full payload:', settings);
      console.log('gift action map:', Object.fromEntries(giftActionById.entries()));
      console.log('social settings:', {
        like: socialSettingsRef.like,
        likeTarget: socialSettingsRef.likeTarget,
        share: socialSettingsRef.share,
        follow: socialSettingsRef.follow,
        join: socialSettingsRef.join,
      });
      console.groupEnd();
    };

    const messageRouter = new MessageRouter(
      {
      onGift: (gift) => {
        applyGiftActionFromSettings(gift);
      },
      onLike: (msg) => {
        handleLikeBySettings(msg);
      },
      onJoin: (msg) => {
        handleSocialEventBySettings(msg, socialSettingsRef.join, 'Join', 'Join Event');
      },
      onFollow: (msg) => {
        handleSocialEventBySettings(msg, socialSettingsRef.follow, 'Follow', 'Follow Event');
      },
      onShare: (msg) => {
        handleSocialEventBySettings(msg, socialSettingsRef.share, 'Share', 'Share Event');
      },
      onGameAction: (msg) => {
        const actionData = parseGameExecuteAction(msg);
        if (!actionData) {
          console.warn('[GameAction] failed to parse data:', msg);
          return;
        }

        if (
          actionData.actionId === ACTION_RESET ||
          actionData.actionId === ACTION_WIN_ADD ||
          actionData.actionId === ACTION_WIN_SUBTRACT
        ) {
          console.log('[GameAction]', actionData);
        }

        const results = resolveGameExecuteEffects(actionData);
        for (const result of results) {
          dispatchSettingsAction(result, 'GameAction', { ...actionData });
        }
      },
      onUpdateSettings: () => {
        console.log('[WS] update_settings — refetch get-game-settings');
        void gameClient.fetchGameSettings().then((settings) => {
          if (settings) {
            gameClient.onGameSettings?.(settings);
          }
        }).catch((err) => {
          console.error('[WS] update_settings refetch failed:', err);
        });
      },
    },
      { shouldProcessGift: isGiftMappedInSettings },
    );

    gameClientRef.current = gameClient;
    messageRouterRef.current = messageRouter;

    gameClient.onLoading = (active, phase, message) => {
      if (gameClient.connectedBefore && active) return;
      if (authOverlayLockedRef.current && active) return;
      setAuthLoading({ active, message });

      if (phase === 'error') {
        setLoginError(message);
        setIsReady(false);
      }
    };

    gameClient.onLoginStatus = (success, message) => {
      if (gameClient.connectedBefore) return;
      if (!success) {
        setConnectionStatus('error');
        setConnectionMessage(message);
        setLoginError(message.replace(/^❌\s*/, ''));
        setIsReady(false);
      } else {
        setConnectionStatus('connecting');
        setConnectionMessage(message);
      }
    };

    gameClient.onOpen = () => {
      setConnectionStatus('connected');
      setConnectionMessage('Live');
    };

    gameClient.onClose = () => {
      if (gameClient.connectedBefore) {
        setConnectionStatus('connecting');
        setConnectionMessage('Reconnecting...');
      }
    };

    gameClient.onReconnectExhausted = () => {
      setConnectionStatus('error');
      setConnectionMessage('Live connection lost — reload to reconnect');
    };

    gameClient.onError = () => {
      if (gameClient.connectedBefore) return;
      setConnectionStatus('error');
      setConnectionMessage('WebSocket error');
    };

    gameClient.onMessage = (data) => {
      if (data && typeof data === 'object') {
        messageRouter.route(data as NetworkMessage);
      }
    };

    gameClient.onLoginSuccess = ({ email: loginEmail }) => {
      setLoggedInEmail(loginEmail);
      saveLastLoginEmail(loginEmail);
      setLoginError(null);
      setIsReady(true);
    };

    gameClient.onGameSettings = applyGameSettings;

    setAuthLoading({ active: true, message: 'Signing in...' });

    void gameClient.start({ email }).then((ok) => {
      authOverlayLockedRef.current = true;
      setAuthLoading({ active: false, message: '' });
      if (!ok) {
        setIsReady(false);
        setLoggedInEmail(null);
        setLoginError((prev) => prev ?? 'Sign-in failed. Check your email and try again.');
        clearAuthSession();
      }
    });

    return () => {
      gameClient.disconnect();
      gameClientRef.current = null;
      messageRouterRef.current = null;
      clearAuthSession();
      setConnectionStatus('idle');
      setConnectionMessage('');
      setLoggedInEmail(null);
      setIsReady(false);
      setAuthLoading({ active: false, message: '' });
      setGameSettings(null);
      setLoginError(null);
    };
  }, [loginRequest?.email, loginRequest?.key, disconnect]);

  return {
    connectionStatus,
    connectionMessage,
    authLoading,
    loggedInEmail,
    isReady,
    loginError,
    hasEmailParam: Boolean(loginRequest?.email),
    gameSettings,
    getRankAuth,
    refreshRankAuth,
    disconnect,
  };
}
