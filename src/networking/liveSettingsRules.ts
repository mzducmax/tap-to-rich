import type { GameSettingsAction, NetworkMessage } from './types';

export type SocialTriggerSetting = {
  action: number;
  amount: number;
};

export type LikeSetting = {
  action: number;
  amount: number;
  number: number;
};

export type GiftActionSetting = {
  actionId: number;
  units: number;
  number: number;
  actionName?: string;
};

export type LikeRuntimeState = {
  totalLike: number;
  totalLikeCountCurrent: number;
  likeTargetTriggeredMilestone: number;
  likeTargetLiveInitialized: boolean;
};

/** Unity gửi payload phẳng hoặc bọc trong `data`. */
export function unwrapNetworkPayload(msg: NetworkMessage): NetworkMessage {
  const nested = msg.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...msg, ...(nested as Record<string, unknown>) };
  }
  return msg;
}

export function parseSocialTriggerSetting(raw: unknown): SocialTriggerSetting | null {
  if (!raw || typeof raw !== 'object') return null;
  const setting = raw as Record<string, unknown>;
  const action = Number(setting.action);
  if (!Number.isFinite(action) || action <= 0) return null;
  return {
    action: Math.floor(action),
    amount: Math.max(1, Math.floor(Number(setting.amount) || 1)),
  };
}

export function parseLikeSetting(raw: unknown): LikeSetting | null {
  if (!raw || typeof raw !== 'object') return null;
  const setting = raw as Record<string, unknown>;
  return {
    action: Math.floor(Number(setting.action) || 0),
    amount: Math.max(1, Math.floor(Number(setting.amount) || 1)),
    number: Math.max(0, Math.floor(Number(setting.number) || 0)),
  };
}

export function buildGiftActionMap(
  actions: GameSettingsAction[] | undefined,
): Map<number, GiftActionSetting> {
  const map = new Map<number, GiftActionSetting>();
  for (const item of actions ?? []) {
    const giftId = Number(item.giftId);
    const actionId = Number(item.actionId);
    if (!Number.isFinite(giftId) || !Number.isFinite(actionId) || actionId <= 0) continue;
    map.set(giftId, {
      actionId: Math.floor(actionId),
      units: Math.max(1, Math.floor(Number(item.units) || 1)),
      number: Math.max(1, Math.floor(Number(item.number) || 1)),
      actionName: item.actionName,
    });
  }
  return map;
}

export function createLikeRuntimeState(): LikeRuntimeState {
  return {
    totalLike: 0,
    totalLikeCountCurrent: 0,
    likeTargetTriggeredMilestone: 0,
    likeTargetLiveInitialized: false,
  };
}

export function resetLikeRuntimeState(state: LikeRuntimeState) {
  state.totalLike = 0;
  state.totalLikeCountCurrent = 0;
  state.likeTargetTriggeredMilestone = 0;
  state.likeTargetLiveInitialized = false;
}

/** Khớp Unity HandleLike — likeTarget theo totalLikeCount + like thường theo likeCount. */
export function shouldTriggerLikeTarget(
  msg: NetworkMessage,
  likeTarget: LikeSetting | null,
  state: LikeRuntimeState,
): { trigger: boolean; viewerName: string } {
  const viewerName = String(msg.nickname ?? msg.uniqueId ?? 'Like Event');
  if (!likeTarget || likeTarget.number <= 0) {
    return { trigger: false, viewerName };
  }

  const totalIncoming = Math.max(0, Math.floor(Number(msg.totalLikeCount) || 0));
  if (totalIncoming > state.totalLikeCountCurrent) {
    state.totalLikeCountCurrent = totalIncoming;
  }

  let currentMilestone = Math.floor(totalIncoming / likeTarget.number);
  let lastMilestone = Math.max(0, state.likeTargetTriggeredMilestone);

  if (!state.likeTargetLiveInitialized) {
    state.likeTargetLiveInitialized = true;
    state.likeTargetTriggeredMilestone = currentMilestone;
    currentMilestone = state.likeTargetTriggeredMilestone;
    lastMilestone = state.likeTargetTriggeredMilestone;
  }

  if (currentMilestone > lastMilestone && likeTarget.action > 0) {
    state.likeTargetTriggeredMilestone = currentMilestone;
    return { trigger: true, viewerName };
  }

  return { trigger: false, viewerName };
}

export function shouldTriggerRegularLike(
  msg: NetworkMessage,
  likeSetting: LikeSetting | null,
  state: LikeRuntimeState,
): { trigger: boolean; viewerName: string } {
  const viewerName = String(msg.nickname ?? msg.uniqueId ?? 'Like Event');
  const targetLike = likeSetting?.number ?? 0;
  if (targetLike <= 0) {
    return { trigger: false, viewerName };
  }

  state.totalLike += Math.max(0, Math.floor(Number(msg.likeCount) || 0));
  if (state.totalLike < targetLike) {
    return { trigger: false, viewerName };
  }

  state.totalLike = 0;
  if (!likeSetting || likeSetting.action <= 0) {
    return { trigger: false, viewerName };
  }

  return { trigger: true, viewerName };
}
