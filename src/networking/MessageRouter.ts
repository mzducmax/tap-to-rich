import GiftProcessor from './GiftProcessor';
import { unwrapNetworkPayload } from './liveSettingsRules';
import type { MessageHandlers, NetworkMessage } from './types';

export default class MessageRouter {
  private handlers: MessageHandlers;
  private giftProcessor: GiftProcessor;
  private shouldProcessGift?: (gift: Record<string, unknown>) => boolean;

  constructor(
    handlers: MessageHandlers = {},
    options?: { shouldProcessGift?: (gift: Record<string, unknown>) => boolean },
  ) {
    this.handlers = handlers;
    this.shouldProcessGift = options?.shouldProcessGift;

    this.giftProcessor = new GiftProcessor((gift) => {
      this.handlers.onGift?.(gift);
    });
  }

  route(msg: NetworkMessage | null | undefined) {
    if (!msg || !msg.type) return;

    if (msg.type === 'update_settings') {
      console.log('[WS] update_settings');
    }

    switch (msg.type) {
      case 'gift': {
        const gift = msg as NetworkMessage & Record<string, unknown>;
        if (this.shouldProcessGift && !this.shouldProcessGift(gift)) {
          break;
        }
        this.giftProcessor.handleGift(gift);
        break;
      }
      case 'like':
        this.handlers.onLike?.(unwrapNetworkPayload(msg));
        break;
      case 'join':
        this.handlers.onJoin?.(unwrapNetworkPayload(msg));
        break;
      case 'follow':
        this.handlers.onFollow?.(unwrapNetworkPayload(msg));
        break;
      case 'share':
        this.handlers.onShare?.(unwrapNetworkPayload(msg));
        break;
      case 'chat':
        this.handlers.onChat?.(msg);
        break;
      case 'game_execute_action':
        this.handlers.onGameAction?.(msg);
        break;
      case 'update_settings':
        this.handlers.onUpdateSettings?.(msg);
        break;
      default:
        break;
    }
  }
}
