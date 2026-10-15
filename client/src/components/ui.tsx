import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { Tone } from '@/lib/derive';

const dot: Record<Tone, string> = { ok: 'bg-green-600', warn: 'bg-amber-500', bad: 'bg-red-600', mute: 'bg-slate-400' };

export function Dot({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={`h-2 w-2 ${dot[tone]}`} aria-hidden />
      {children}
    </span>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-white/80 p-4 md:p-12" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-2xl border border-slate-900 bg-white" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 h-12">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 hover:bg-slate-100"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHead({ title, note, action, lead }: { title: string; note?: string; action?: ReactNode; lead?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 px-6 py-5">
      <div className="flex items-center gap-4">
        {lead}
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {note && <p className="mt-1 text-sm text-slate-500">{note}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 px-6 py-10">
      <p className="font-medium">{title}</p>
      {children}
    </div>
  );
}

export function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const style = { width: size, height: size };
  return src ? (
    <img src={src} alt="" style={style} className="shrink-0 border border-slate-200 object-cover" />
  ) : (
    <span style={style} className="inline-flex shrink-0 items-center justify-center border border-slate-300 bg-slate-50 text-sm font-medium text-slate-600" aria-hidden>
      {(name.trim()[0] ?? '?').toUpperCase()}
    </span>
  );
}
