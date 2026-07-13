/**
 * Bảng ghim danh sách người tặng quà gần đây — avatar + tên, tách biệt với
 * hiệu ứng bay lên (GifterFloatLayer). Giữ tối đa MAX_ITEMS người, mới nhất
 * lên đầu; mỗi người chỉ giữ 1 dòng (tặng lại thì đẩy lên đầu thay vì nhân đôi).
 */
import { forwardRef, memo, useCallback, useImperativeHandle, useState } from 'react';

export type RecentGifterInfo = {
  name: string;
  avatar: string;
  id?: string | null;
};

export interface RecentGiftersPanelHandle {
  push: (info: RecentGifterInfo) => void;
}

type ListItem = RecentGifterInfo & { key: number };

const MAX_ITEMS = 8;

const RecentGiftersPanel = forwardRef<RecentGiftersPanelHandle>(function RecentGiftersPanel(_props, ref) {
  const [items, setItems] = useState<ListItem[]>([]);

  const push = useCallback((info: RecentGifterInfo) => {
    setItems((prev) => {
      const dedupeId = info.id ?? info.name;
      const filtered = prev.filter((it) => (it.id ?? it.name) !== dedupeId);
      const next = [{ ...info, key: Date.now() + Math.random() }, ...filtered];
      return next.slice(0, MAX_ITEMS);
    });
  }, []);

  useImperativeHandle(ref, () => ({ push }), [push]);

  if (items.length === 0) return null;

  return (
    <div className="absolute top-3 left-3 z-[45] pointer-events-none select-none flex flex-col gap-1.5 max-w-[180px]">
      {items.map((it) => (
        <div
          key={it.key}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/45 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
        >
          {it.avatar ? (
            <img
              src={it.avatar}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-6 h-6 rounded-full object-cover border border-white/70 shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 border border-white/70 flex items-center justify-center text-[10px] font-black text-white shrink-0">
              {it.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate text-[11px] font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {it.name}
          </span>
        </div>
      ))}
    </div>
  );
});

export default memo(RecentGiftersPanel);
