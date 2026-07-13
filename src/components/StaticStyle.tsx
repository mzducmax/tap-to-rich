/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { memo } from 'react';

type StaticStyleProps = {
  css: string;
};

export const StaticStyle = memo(function StaticStyle({ css }: StaticStyleProps) {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
});
