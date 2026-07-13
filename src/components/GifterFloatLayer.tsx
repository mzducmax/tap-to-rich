/**
 * Floating gifter badge — hiển thị avatar + tên người tặng quà, bay lơ lửng lên
 * trên màn hình rồi biến mất sau ~2s.
 *
 * Tối ưu drawcall:
 * - Chỉ animate `transform` + `opacity` → compositor GPU gộp, không repaint/layout,
 *   không tạo drawcall WebGL trên canvas game.
 * - Giới hạn số badge đồng thời (MAX_FLOATS) để chặn số DOM node.
 * - Throttle theo từng người tặng (combo gift chỉ hiện 1 badge).
 * - Avatar tái dùng cache ảnh của trình duyệt (cùng URL = cùng texture).
 */
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export type GifterFloatInfo = {
  name: string;
  avatar: string;
  id?: string | null;
};

export interface GifterFloatLayerHandle {
  push: (info: GifterFloatInfo) => void;
}

type FloatItem = GifterFloatInfo & {
  key: number;
  /** vị trí ngang 0..1 của màn hình */
  x: number;
};

/** Số badge tối đa cùng lúc — chặn DOM node và giữ khung hình mượt. */
const MAX_FLOATS = 12;
/** Thời gian sống của badge (ms) — khớp animation CSS. */
const LIFETIME_MS = 2000;
/** Combo/repeat của cùng một người trong khoảng này chỉ hiện 1 badge. */
const THROTTLE_MS = 1500;

const styles = `
@keyframes gifter-float-rise {
  0%   { opacity: 0; transform: translate3d(-50%, 12px, 0) scale(0.8); }
  15%  { opacity: 1; transform: translate3d(-50%, 0, 0) scale(1); }
  80%  { opacity: 1; transform: translate3d(-50%, -120px, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(-50%, -160px, 0) scale(0.92); }
}
.gifter-float {
  position: absolute;
  bottom: 22%;
  will-change: transform, opacity;
  animation: gifter-float-rise ${LIFETIME_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
`;

const GifterFloatLayer = forwardRef<GifterFloatLayerHandle>(function GifterFloatLayer(_props, ref) {
  const [items, setItems] = useState<FloatItem[]>([]);
  const seqRef = useRef(0);
  const lastShownRef = useRef<Map<string, number>>(new Map());

  const push = useCallback((info: GifterFloatInfo) => {
    const now = Date.now();
    const throttleId = info.id ?? info.name;
    const last = lastShownRef.current.get(throttleId) ?? 0;
    if (now - last < THROTTLE_MS) return;
    lastShownRef.current.set(throttleId, now);

    const key = seqRef.current++;
    const item: FloatItem = {
      ...info,
      key,
      x: 0.15 + Math.random() * 0.7,
    };
    setItems((prev) => {
      const next = [...prev, item];
      // Chặn trần số badge — bỏ badge cũ nhất nếu vượt quá.
      return next.length > MAX_FLOATS ? next.slice(next.length - MAX_FLOATS) : next;
    });

    window.setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.key !== key));
    }, LIFETIME_MS);
  }, []);

  useImperativeHandle(ref, () => ({ push }), [push]);

  // Dọn map throttle định kỳ để không phình theo số người tặng.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const cutoff = Date.now() - THROTTLE_MS * 4;
      for (const [id, t] of lastShownRef.current) {
        if (t < cutoff) lastShownRef.current.delete(id);
      }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-[46] pointer-events-none select-none overflow-hidden">
      <style>{styles}</style>
      {items.map((it) => (
        <div key={it.key} className="gifter-float" style={{ left: `${it.x * 100}%` }}>
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              {it.avatar ? (
                <img
                  src={it.avatar}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/80 flex items-center justify-center text-lg font-black text-white">
                  {it.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -top-1 -right-1 text-base drop-shadow">🎁</span>
            </div>
            <span
              className="max-w-[140px] truncate px-2 py-0.5 rounded-full bg-black/55 text-white text-[11px] font-bold tracking-wide"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
            >
              {it.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

export default memo(GifterFloatLayer);
