import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{start}</span>–<span className="font-medium text-slate-700 dark:text-slate-300">{end}</span> of <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={clsx('rounded-lg p-1.5 transition-colors', page <= 1 ? 'cursor-not-allowed text-slate-300 dark:text-slate-700' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">…</span>}
              <button
                onClick={() => onPageChange(p)}
                className={clsx(
                  'min-w-[32px] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                )}
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={clsx('rounded-lg p-1.5 transition-colors', page >= totalPages ? 'cursor-not-allowed text-slate-300 dark:text-slate-700' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
