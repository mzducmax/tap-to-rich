/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import type { KeyActionContext, KeyActionDefinition } from './types';

export function useKeyActions(
  actions: KeyActionDefinition[],
  context: KeyActionContext,
) {
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctx = contextRef.current;
      for (const action of actions) {
        if (e.key !== action.key) continue;
        if (!action.canRun(ctx)) continue;
        e.preventDefault();
        action.run(ctx);
        break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions]);
}
