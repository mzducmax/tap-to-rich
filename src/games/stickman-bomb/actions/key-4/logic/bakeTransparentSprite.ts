/**
 * Flood-fill edge black + de-fringe halos — keeps internal dark pixels (wheels).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export function bakeTransparentSprite(source: CanvasImageSource): HTMLCanvasElement {
  const probe = document.createElement('canvas');
  const probeCtx = probe.getContext('2d');
  if (!probeCtx) return probe;

  if (source instanceof HTMLImageElement) {
    probe.width = source.naturalWidth || 1;
    probe.height = source.naturalHeight || 1;
  } else if (source instanceof HTMLCanvasElement) {
    probe.width = source.width;
    probe.height = source.height;
  } else {
    probe.width = 1;
    probe.height = 1;
  }

  probeCtx.clearRect(0, 0, probe.width, probe.height);
  probeCtx.drawImage(source, 0, 0);

  const w = probe.width;
  const h = probe.height;
  const image = probeCtx.getImageData(0, 0, w, h);
  const data = image.data;
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  const idx = (x: number, y: number) => (y * w + x) * 4;
  const isEdgeBg = (x: number, y: number) => {
    const i = idx(x, y);
    const a = data[i + 3];
    if (a < 10) return true;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    return r <= 34 && g <= 34 && b <= 34;
  };

  const push = (x: number, y: number) => {
    const p = y * w + x;
    if (x < 0 || y < 0 || x >= w || y >= h || visited[p]) return;
    if (!isEdgeBg(x, y)) return;
    visited[p] = 1;
    queue.push(x, y);
  };

  for (let x = 0; x < w; x += 1) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y += 1) {
    push(0, y);
    push(w - 1, y);
  }

  while (queue.length > 0) {
    const y = queue.pop()!;
    const x = queue.pop()!;
    const i = idx(x, y);
    data[i + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = idx(x, y);
      if (data[i + 3] === 0) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      if (lum < 205) continue;
      const neighbors = [idx(x - 1, y), idx(x + 1, y), idx(x, y - 1), idx(x, y + 1)];
      if (neighbors.some((j) => data[j + 3] === 0)) {
        data[i + 3] = Math.max(0, data[i + 3] - 110);
      }
    }
  }

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const outCtx = out.getContext('2d');
  outCtx?.putImageData(image, 0, 0);
  return out;
}

/** Darken + contrast boost for gold coin readability on bright backgrounds. */
export function enrichCoinSprite(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  if (!ctx) return source;

  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, out.width, out.height);
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 12) continue;

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = r * 0.78 + 18;
    g = g * 0.72 + 10;
    b = b * 0.55 + 4;

    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    const boost = lum > 170 ? 0.88 : 1.06;
    r = Math.min(255, r * boost);
    g = Math.min(255, g * boost);
    b = Math.min(255, b * boost);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = Math.min(255, a + 18);
  }

  ctx.putImageData(image, 0, 0);
  return out;
}

function rowIsBottomBlackBar(data: Uint8ClampedArray, w: number, y: number) {
  let dark = 0;
  let visible = 0;
  for (let x = 0; x < w; x += 1) {
    const i = (y * w + x) * 4;
    if (data[i + 3] < 12) continue;
    visible += 1;
    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    if (lum < 48) dark += 1;
  }
  if (visible < w * 0.08) return true;
  return dark / visible > 0.62;
}

/** Crop transparent padding + strip bottom black artifact bar on train art. */
export function trimTrainSprite(source: HTMLCanvasElement): HTMLCanvasElement {
  const w = source.width;
  const h = source.height;
  const ctx = source.getContext('2d');
  if (!ctx || w <= 0 || h <= 0) return source;

  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;

  let top = h;
  let bottom = 0;
  let left = w;
  let right = 0;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 14) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }

  if (bottom <= top) return source;

  while (bottom > top && rowIsBottomBlackBar(data, w, bottom)) {
    for (let x = 0; x < w; x += 1) {
      const i = (bottom * w + x) * 4;
      data[i + 3] = 0;
    }
    bottom -= 1;
  }

  const pad = 1;
  top = Math.max(0, top - pad);
  left = Math.max(0, left - pad);
  bottom = Math.min(h - 1, bottom + pad);
  right = Math.min(w - 1, right + pad);

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;
  if (cropW <= 0 || cropH <= 0) return source;

  const out = document.createElement('canvas');
  out.width = cropW;
  out.height = cropH;
  const outCtx = out.getContext('2d');
  outCtx?.drawImage(source, left, top, cropW, cropH, 0, 0, cropW, cropH);
  return out;
}

export function bakeTrainSprite(source: CanvasImageSource): HTMLCanvasElement {
  return trimTrainSprite(bakeTransparentSprite(source));
}
