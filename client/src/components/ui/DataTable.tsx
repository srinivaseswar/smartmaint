import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'No records found',
  isLoading = false,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'table-th whitespace-nowrap',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx(
                    'table-td whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
