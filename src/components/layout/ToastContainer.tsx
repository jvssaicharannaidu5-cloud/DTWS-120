import React from 'react';

export interface ToastItem {
  id: number;
  msg: string;
  tone?: 'ok' | 'warn' | 'crit';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss?: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed right-4 bottom-12 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => {
        const borderTone =
          t.tone === 'crit'
            ? 'border-rose-600 text-rose-200'
            : t.tone === 'warn'
            ? 'border-amber-600 text-amber-200'
            : 'border-teal-700 text-teal-200';

        return (
          <div
            key={t.id}
            onClick={() => onDismiss?.(t.id)}
            className={`toast-anim panel px-3 py-2 text-[11px] font-mono pointer-events-auto cursor-pointer shadow-2xl backdrop-blur-md bg-[#10151c]/95 ${borderTone}`}
          >
            {t.msg}
          </div>
        );
      })}
    </div>
  );
};
