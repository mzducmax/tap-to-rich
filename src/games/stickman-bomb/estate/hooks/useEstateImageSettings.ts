/**
 * Load/save custom estate tier images.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import type { EstateLevel } from '../config/estateConfig';
import {
  loadEstateImageOverrides,
  saveEstateImageOverrides,
  type EstateImageOverrides,
} from '../config/estateImageSettings';

export function useEstateImageSettings() {
  const [estateImageOverrides, setEstateImageOverrides] = useState<EstateImageOverrides>(
    () => loadEstateImageOverrides(),
  );

  const setEstateLevelImage = useCallback((level: EstateLevel, dataUrl: string) => {
    setEstateImageOverrides((prev) => {
      const next = { ...prev, [level]: dataUrl };
      saveEstateImageOverrides(next);
      return next;
    });
  }, []);

  const resetEstateLevelImage = useCallback((level: EstateLevel) => {
    setEstateImageOverrides((prev) => {
      if (!prev[level]) return prev;
      const next = { ...prev };
      delete next[level];
      saveEstateImageOverrides(next);
      return next;
    });
  }, []);

  const resetAllEstateLevelImages = useCallback(() => {
    setEstateImageOverrides({});
    saveEstateImageOverrides({});
  }, []);

  return {
    estateImageOverrides,
    setEstateLevelImage,
    resetEstateLevelImage,
    resetAllEstateLevelImages,
  };
}
