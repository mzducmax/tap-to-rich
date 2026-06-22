/**
 * One money-train pass — train crosses above the estate and drops coins.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  AVATAR_COIN_COUNT,
  AVATAR_COIN_FADE_MS,
} from '../config/avatarCoinConfig';
import {
  beginCoinRain,
  cancelCoinRainFor,
  createCoinRainGroup,
  isCoinRainActive,
  type EstateZone,
} from '../logic/coinRainMotion';
import { waitForMoneyTrainAssets } from '../logic/avatarCoinCanvas';

function buildEstateZone(estateRect: DOMRect, containerRect: DOMRect): EstateZone {
  const bx = estateRect.left - containerRect.left;
  const by = estateRect.top - containerRect.top;
  return {
    left: bx + estateRect.width * 0.1,
    right: bx + estateRect.width * 0.9,
    top: by + estateRect.height * 0.18,
    bottom: by + estateRect.height * 0.78,
  };
}

type AvatarCoinInstanceProps = {
  showerId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onCoinHit: () => void;
  onShowerStart: () => void;
  onComplete: () => void;
};

function AvatarCoinInstanceInner({
  showerId,
  layerRef,
  gameplayTargetRef,
  onCoinHit,
  onShowerStart,
  onComplete,
}: AvatarCoinInstanceProps) {
  const onCoinHitRef = useRef(onCoinHit);
  const onShowerStartRef = useRef(onShowerStart);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);

  onCoinHitRef.current = onCoinHit;
  onShowerStartRef.current = onShowerStart;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;
    const rainGroup = createCoinRainGroup();

    async function runMoneyTrain() {
      const ready = await waitForRefs([layerRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await waitForMoneyTrainAssets();
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const layer = layerRef.current!;
      const estate = gameplayTargetRef.current!;
      const layerRect = layer.getBoundingClientRect();
      const estateRect = estate.getBoundingClientRect();
      const zone = buildEstateZone(estateRect, layerRect);

      onShowerStartRef.current();
      const started = beginCoinRain(
        rainGroup,
        zone,
        AVATAR_COIN_COUNT,
        () => onCoinHitRef.current(),
      );
      if (!started) {
        onCompleteRef.current();
        return;
      }

      while (!cancelled && sequenceId === sequenceIdRef.current && isCoinRainActive(rainGroup)) {
        await sleep(32);
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await sleep(AVATAR_COIN_FADE_MS);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      onCompleteRef.current();
    }

    void runMoneyTrain();

    return () => {
      cancelled = true;
      cancelCoinRainFor(rainGroup);
    };
  }, [showerId, gameplayTargetRef, layerRef]);

  return null;
}

export const AvatarCoinInstance = memo(AvatarCoinInstanceInner);
