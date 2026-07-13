/**
 * Settings panel section — custom estate tier images by score level.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useRef, type ChangeEvent } from 'react';
import {
  formatLevelLabel,
  formatLevelThreshold,
  getTargetLevelHint,
} from '../../background/config/levelConfig';
import {
  getDefaultEstateImageUrl,
  getEstateImageUrl,
  NEGATIVE_ESTATE_LEVELS,
  POSITIVE_ESTATE_LEVELS,
  type EstateLevel,
} from '../config/estateConfig';
import {
  hasEstateImageOverride,
  readImageFileAsDataUrl,
  type EstateImageOverrides,
} from '../config/estateImageSettings';

type EstateSettingsSectionProps = {
  targetScore: number;
  activeEstateLevel: EstateLevel;
  previewEstateLevel: EstateLevel | null;
  estateImageOverrides: EstateImageOverrides;
  onPreviewEstateLevelChange: (level: EstateLevel | null) => void;
  onEstateLevelImageChange: (level: EstateLevel, dataUrl: string) => void;
  onEstateLevelImageReset: (level: EstateLevel) => void;
  onResetAllEstateLevelImages: () => void;
};

function EstateLevelThumbnail({
  level,
  selectedLevel,
  targetScore,
  estateImageOverrides,
  onSelect,
}: {
  level: EstateLevel;
  selectedLevel: EstateLevel;
  targetScore: number;
  estateImageOverrides: EstateImageOverrides;
  onSelect: (level: EstateLevel) => void;
}) {
  const isSelected = selectedLevel === level;
  const isCustom = hasEstateImageOverride(level, estateImageOverrides);

  return (
    <button
      type="button"
      onClick={() => onSelect(level)}
      className={`relative overflow-hidden border-2 rounded-lg aspect-square transition-all ${
        isSelected
          ? 'border-amber-600 ring-2 ring-amber-400 scale-[1.03]'
          : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300'
      }`}
      title={`${formatLevelLabel(level)}: ${formatLevelThreshold(level, targetScore)}`}
    >
      <img
        src={getEstateImageUrl(level, estateImageOverrides)}
        alt=""
        className="absolute inset-0 h-full w-full object-contain bg-slate-50 p-0.5"
      />
      {isCustom && (
        <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
      )}
      <span className="absolute bottom-0 inset-x-0 bg-amber-950/80 text-[9px] font-black text-white py-0.5 text-center">
        {formatLevelLabel(level)}
      </span>
    </button>
  );
}

export function EstateSettingsSection({
  targetScore,
  activeEstateLevel,
  previewEstateLevel,
  estateImageOverrides,
  onPreviewEstateLevelChange,
  onEstateLevelImageChange,
  onEstateLevelImageReset,
  onResetAllEstateLevelImages,
}: EstateSettingsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedLevel = previewEstateLevel ?? activeEstateLevel;
  const isPreviewing =
    previewEstateLevel !== null && previewEstateLevel !== activeEstateLevel;
  const selectedIsCustom = hasEstateImageOverride(selectedLevel, estateImageOverrides);
  const customCount = Object.keys(estateImageOverrides).length;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onEstateLevelImageChange(selectedLevel, dataUrl);
    } catch {
      // ignore invalid reads
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase text-indigo-950/70 tracking-wider">
          Estate
        </span>
        {customCount > 0 && (
          <button
            type="button"
            onClick={onResetAllEstateLevelImages}
            className="text-[9px] font-black uppercase tracking-wide text-rose-600 hover:text-rose-800"
          >
            Reset All
          </button>
        )}
      </div>
      <p className="text-[10px] font-bold text-indigo-900/50 leading-snug -mt-1">
        {getTargetLevelHint(targetScore)} Select a level, then change its image.
      </p>
      <p className="text-[10px] font-bold text-amber-800/80 leading-snug">
        {isPreviewing ? 'Previewing' : 'Selected'}: {formatLevelLabel(selectedLevel)} ·{' '}
        {formatLevelThreshold(selectedLevel, targetScore)}
        {isPreviewing && (
          <>
            {' '}
            ·{' '}
            <button
              type="button"
              onClick={() => onPreviewEstateLevelChange(null)}
              className="underline text-amber-900/70 hover:text-amber-950"
            >
              follow score
            </button>
          </>
        )}
      </p>

      <div className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/50 p-2">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-amber-300/60 bg-white">
          <img
            src={getEstateImageUrl(selectedLevel, estateImageOverrides)}
            alt=""
            className="h-full w-full object-contain p-0.5"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-[10px] font-black text-amber-950/80">
            {formatLevelLabel(selectedLevel)}
            {selectedIsCustom ? ' · custom image' : ' · default image'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border-2 border-indigo-900 bg-white px-2.5 py-1 text-[10px] font-black uppercase text-indigo-950 hover:bg-indigo-50"
            >
              Change Image
            </button>
            {selectedIsCustom && (
              <button
                type="button"
                onClick={() => onEstateLevelImageReset(selectedLevel)}
                className="rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50"
              >
                Default
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <p className="text-[9px] font-black uppercase tracking-wider text-indigo-900/45">
        Negative
      </p>
      <div className="grid grid-cols-6 gap-1">
        {NEGATIVE_ESTATE_LEVELS.map((level) => (
          <EstateLevelThumbnail
            key={level}
            level={level}
            selectedLevel={selectedLevel}
            targetScore={targetScore}
            estateImageOverrides={estateImageOverrides}
            onSelect={onPreviewEstateLevelChange}
          />
        ))}
      </div>
      <p className="text-[9px] font-black uppercase tracking-wider text-indigo-900/45 mt-1">
        Zero &amp; Positive
      </p>
      <div className="grid grid-cols-6 gap-1">
        {POSITIVE_ESTATE_LEVELS.map((level) => (
          <EstateLevelThumbnail
            key={level}
            level={level}
            selectedLevel={selectedLevel}
            targetScore={targetScore}
            estateImageOverrides={estateImageOverrides}
            onSelect={onPreviewEstateLevelChange}
          />
        ))}
      </div>
      <p className="text-[9px] font-bold text-indigo-900/40 leading-snug">
        Green dot = custom image. Default:{' '}
        <span className="font-mono">{getDefaultEstateImageUrl(selectedLevel).split('/').pop()}</span>
      </p>
    </div>
  );
}
