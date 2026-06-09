/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CounterToken =
  | { type: 'digit'; value: string }
  | { type: 'sign'; value: '-' }
  | { type: 'group-gap' };

function splitThousands(raw: string): string[] {
  const groups: string[] = [];
  let end = raw.length;

  while (end > 0) {
    const start = Math.max(0, end - 3);
    groups.unshift(raw.slice(start, end));
    end = start;
  }

  return groups;
}

/** Build digit tokens with a wider gap every 3 digits from the right. */
export function buildCounterTokens(count: number): CounterToken[] {
  const raw = Math.abs(count).toString() || '0';
  const groups = splitThousands(raw);
  const tokens: CounterToken[] = [];

  if (count < 0) {
    tokens.push({ type: 'sign', value: '-' });
  }

  groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) tokens.push({ type: 'group-gap' });
    for (const char of group) {
      tokens.push({ type: 'digit', value: char });
    }
  });

  return tokens;
}

/** Screen-reader / debug label e.g. "-10$" */
export function formatCounterLabel(count: number): string {
  const sign = count < 0 ? '-' : '';
  const digits = Math.abs(count).toLocaleString('en-US');
  return `${sign}${digits}$`;
}
