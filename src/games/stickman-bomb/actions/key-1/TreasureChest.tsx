/**
 * Gift box sprite for key-[1] drop sequence.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

type TreasureChestProps = {
  className?: string;
  size?: 'sm' | 'md';
};

const SIZES = {
  sm: { scale: 0.72, width: 48, height: 52 },
  md: { scale: 1, width: 48, height: 52 },
} as const;

export function TreasureChest({ className = '', size = 'md' }: TreasureChestProps) {
  const { scale, width, height } = SIZES[size];

  return (
    <div
      className={`relative pointer-events-none select-none ${className}`}
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: '50% 100%',
        filter: 'drop-shadow(2px 5px 8px rgba(0,0,0,0.35))',
      }}
    >
      {/* Bow loops */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-[10px] w-[28px] h-[14px]"
        aria-hidden
      >
        <div
          className="absolute left-0 top-[2px] w-[12px] h-[12px] rounded-full"
          style={{
            background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 55%, #d97706 100%)',
            border: '1.5px solid #b45309',
            transform: 'rotate(-28deg)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.45)',
          }}
        />
        <div
          className="absolute right-0 top-[2px] w-[12px] h-[12px] rounded-full"
          style={{
            background: 'linear-gradient(225deg, #fde68a 0%, #f59e0b 55%, #d97706 100%)',
            border: '1.5px solid #b45309',
            transform: 'rotate(28deg)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.45)',
          }}
        />
        <div
          className="absolute left-1/2 top-[6px] -translate-x-1/2 w-[8px] h-[8px] rounded-[3px]"
          style={{
            background: 'linear-gradient(180deg, #fcd34d 0%, #f59e0b 100%)',
            border: '1.5px solid #b45309',
          }}
        />
      </div>

      {/* Lid */}
      <div
        className="absolute inset-x-[2px] top-[8px] h-[10px] rounded-t-md"
        style={{
          background: 'linear-gradient(180deg, #f87171 0%, #dc2626 55%, #991b1b 100%)',
          border: '2px solid #7f1d1d',
          borderBottom: 'none',
        }}
      />

      {/* Box body */}
      <div
        className="absolute inset-x-0 top-[16px] bottom-0 rounded-md overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 45%, #b91c1c 100%)',
          border: '2.5px solid #7f1d1d',
        }}
      >
        {/* Vertical ribbon */}
        <div
          className="absolute inset-y-[2px] left-1/2 -translate-x-1/2 w-[9px] rounded-sm"
          style={{
            background: 'linear-gradient(90deg, #d97706 0%, #fbbf24 45%, #fde68a 50%, #fbbf24 55%, #d97706 100%)',
            borderLeft: '1px solid rgba(180,83,9,0.55)',
            borderRight: '1px solid rgba(180,83,9,0.55)',
          }}
        />

        {/* Horizontal ribbon */}
        <div
          className="absolute inset-x-[2px] top-1/2 -translate-y-1/2 h-[9px] rounded-sm"
          style={{
            background: 'linear-gradient(180deg, #d97706 0%, #fbbf24 45%, #fde68a 50%, #fbbf24 55%, #d97706 100%)',
            borderTop: '1px solid rgba(180,83,9,0.55)',
            borderBottom: '1px solid rgba(180,83,9,0.55)',
          }}
        />

        {/* Shine */}
        <div className="absolute left-[6px] top-[6px] w-[8px] h-[14px] rounded-full bg-white/20 blur-[1px]" />
      </div>

      {/* Bottom shadow */}
      <div className="absolute inset-x-[10px] bottom-[1px] h-[2px] rounded-full bg-black/20" />
    </div>
  );
}
