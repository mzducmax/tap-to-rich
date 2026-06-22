/**
 * Decorative capybara walking along the bottom of the gameplay layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useCallback, useRef, useState } from 'react';
import { CAPYBARA_WALK_FRAMES } from '../config/capybaraSpriteConfig';
import { capybaraStyles, CAPYBARA_CROSS_MS } from '../styles/capybaraStyles';
import { CapybaraSprite } from './CapybaraSprite';

type CapybaraFacing = 'right' | 'left';

type CapybaraWalkerProps = {
  active?: boolean;
};

export const CapybaraWalker = memo(function CapybaraWalker({
  active = true,
}: CapybaraWalkerProps) {
  const walkerRef = useRef<HTMLDivElement>(null);
  const [facing, setFacing] = useState<CapybaraFacing>('left');

  const handleAnimationIteration = useCallback(() => {
    setFacing((prev) => (prev === 'right' ? 'left' : 'right'));
  }, []);

  if (!active) return null;

  const bodyClass =
    facing === 'right'
      ? 'capybara-walker-body capybara-walker-body-face-right'
      : 'capybara-walker-body capybara-walker-body-face-left';

  return (
    <div className="capybara-walker-layer" aria-hidden>
      <style>{capybaraStyles}</style>
      <div
        ref={walkerRef}
        className="capybara-walker"
        style={{ ['--capybara-cross-ms' as string]: `${CAPYBARA_CROSS_MS}ms` }}
        onAnimationIteration={handleAnimationIteration}
      >
        <span className={bodyClass}>
          <CapybaraSprite frameIndices={CAPYBARA_WALK_FRAMES} frameMs={280} />
        </span>
      </div>
    </div>
  );
});
