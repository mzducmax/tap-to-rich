import {
  getComboRepeatTotal,
  getGiftRepeatCount,
  isComboGiftType,
  isGiftRepeatEnd,
} from './giftBoxRules';

/**
 * Combo TikTok — khớp Unity GiftProcessor:
 * - !repeatEnd: leftCount = repeatCount - đã xử lý → enqueue → ProcessEventQueue
 * - repeatEnd: chỉ cleanup (không push thêm)
 */
export default class GiftProcessor {
  private giftCountByUser: Map<string, Map<string, number>>;
  private eventQueue: Record<string, unknown>[];
  private onGiftProcessed: (gift: Record<string, unknown>) => void;

  constructor(onGiftProcessed: (gift: Record<string, unknown>) => void) {
    this.giftCountByUser = new Map();
    this.eventQueue = [];
    this.onGiftProcessed = onGiftProcessed;
  }

  handleGift(gift: Record<string, unknown>) {
    if (!gift) return;

    if (isComboGiftType(gift.giftType)) {
      const giftCountId = String(gift.groupId ?? gift.uniqueId ?? '');
      if (!giftCountId) return;

      if (!this.giftCountByUser.has(giftCountId)) {
        this.giftCountByUser.set(giftCountId, new Map());
      }

      const giftDict = this.giftCountByUser.get(giftCountId)!;
      const giftId = String(gift.giftId ?? 'default');

      if (!giftDict.has(giftId)) {
        giftDict.set(giftId, 0);
      }

      if (!isGiftRepeatEnd(gift)) {
        const leftCount = getComboRepeatTotal(gift) - (giftDict.get(giftId) ?? 0);
        for (let i = 0; i < leftCount; i++) {
          this.eventQueue.push(gift);
          giftDict.set(giftId, (giftDict.get(giftId) ?? 0) + 1);
        }
        this.processEventQueue();
      } else {
        giftDict.delete(giftId);
        if (giftDict.size === 0) {
          this.giftCountByUser.delete(giftCountId);
        }
      }
      return;
    }

    const count = getGiftRepeatCount(gift);
    for (let i = 0; i < count; i++) {
      this.eventQueue.push(gift);
    }
    this.processEventQueue();
  }

  processEventQueue() {
    while (this.eventQueue.length > 0) {
      const gift = this.eventQueue.shift();
      if (gift && this.onGiftProcessed) {
        this.onGiftProcessed(gift);
      }
    }
  }
}
