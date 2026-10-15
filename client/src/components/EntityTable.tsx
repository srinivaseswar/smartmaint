import { useMemo, useState } from 'react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import type { Row } from '@/lib/store';
import { useStore } from '@/lib/store';
import type { EntityConfig } from '@/lib/config';
import { Empty } from '@/components/ui';

export function EntityTable({
  cfg, rows, onEdit, searchable = true, empty, canEdit = true, canDelete = true,
}: { cfg: EntityConfig; rows: Row[]; onEdit: (r: Row) => void; searchable?: boolean; empty?: string; canEdit?: boolean; canDelete?: boolean }) {
  const store = useStore();
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => cfg.searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(s)));
  }, [rows, q, cfg.searchKeys]);

  return (
    <div>
      {searchable && rows.length > 0 && (
        <div className="relative border-b border-slate-200 px-6 py-3">
          <Search size={14} className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input max-w-sm pl-8" placeholder={`Search ${cfg.title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${cfg.title}`} />
        </div>
      )}
      {rows.length === 0 ? (
        <Empty title={empty ?? `No ${cfg.title.toLowerCase()} yet`} />
      ) : shown.length === 0 ? (
        <Empty title="No matches for that search" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                {cfg.columns.map((c) => (
                  <th key={c.key} className="border border-slate-200 border-t-0 px-4 py-2 text-xs font-medium text-slate-600 first:border-l-0">{c.label}</th>
                ))}
                {(canEdit || canDelete || cfg.actions) && <th className="border border-slate-200 border-t-0 border-r-0 px-4 py-2 text-right text-xs font-medium text-slate-600">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  {cfg.columns.map((c) => (
                    <td key={c.key} className="border border-slate-200 px-4 py-2.5 first:border-l-0">
                      {c.render ? c.render(r, store.data) : String(r[c.key] || '—')}
                    </td>
                  ))}
                  {(canEdit || canDelete || cfg.actions) && <td className="border border-slate-200 border-r-0 px-4 py-2.5">
                    <div className="flex items-center justify-end gap-3">
                      {cfg.actions?.(r, store)}
                      {canEdit && <button onClick={() => onEdit(r)} aria-label="Edit" className="p-1 text-slate-500 hover:text-brand"><Pencil size={15} /></button>}
                      {canDelete && <button
                        aria-label="Delete"
                        className="p-1 text-slate-500 hover:text-red-600"
                        onClick={() => {
                          const extra = cfg.entity === 'machines' ? ' Its warranties, service records and schedules will be deleted too.' : '';
                          if (window.confirm(`Delete this ${cfg.singular}?${extra}`)) store.remove(cfg.entity, r.id);
                        }}
                      ><Trash2 size={15} /></button>}
                    </div>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
