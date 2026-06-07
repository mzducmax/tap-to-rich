export interface GameClientConfig {
  baseUrl: string;
  loginUrl: string;
  wsUrl: string;
  gameId: string;
  /** get-game-settings payload gameId (ObjectId nếu backend yêu cầu) */
  gameSettingsId?: string;
  /** BXH global — gameId on rank-game API (default: avatar_strike) */
  rankGameId?: string;
}

export interface LoginDataPayload {
  email: string;
  accessToken: string;
  googleId: string;
  userId?: string;
  UserId?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: LoginDataPayload;
}

export type AuthLoadingPhase =
  | 'idle'
  | 'restore'
  | 'login'
  | 'save'
  | 'fetch-ws'
  | 'connect-ws'
  | 'ready'
  | 'error';

export interface WsUrlResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
  };
}

export interface GameSettingsAction {
  actionId: number;
  actionName: string;
  number: number;
  units: number;
  giftId: number;
  giftName: string;
  giftImage?: string;
  point: number;
}

export interface GameSettingsPayload {
  _id: string;
  userId: string;
  gameId: string;
  actions: GameSettingsAction[];
  name?: string;
  settings?: Record<string, unknown>;
}

export interface GameSettingsResponse {
  success: boolean;
  message?: string;
  gameSettings?: GameSettingsPayload;
}

export interface MyGameItem {
  _id: string;
  gameId: string;
  name?: string;
}

export interface MyGamesResponse {
  success: boolean;
  message?: string;
  games?: MyGameItem[];
}

export interface GameExecuteActionUserInfo {
  name?: string;
  avatarUrl?: string;
}

/** Khớp Unity WSSMessage<GameExecuteActionData> */
export interface GameExecuteActionData {
  actionId: number;
  number: number;
  units: number;
  userInfo?: GameExecuteActionUserInfo;
}

export interface NetworkMessage {
  type: string;
  data?: unknown;
  [key: string]: unknown;
}

export type MessageHandlers = {
  onGift?: (gift: Record<string, unknown>) => void;
  onLike?: (msg: NetworkMessage) => void;
  onJoin?: (msg: NetworkMessage) => void;
  onFollow?: (msg: NetworkMessage) => void;
  onShare?: (msg: NetworkMessage) => void;
  onChat?: (msg: NetworkMessage) => void;
  onGameAction?: (msg: NetworkMessage) => void;
  onUpdateSettings?: (msg: NetworkMessage) => void;
};
