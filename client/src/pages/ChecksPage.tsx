import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, type Row } from '@/lib/store';
import { CONFIGS } from '@/lib/config';
import { checkState, lastCheck, nextCheck } from '@/lib/derive';
import { Avatar, Dot, PageHead } from '@/components/ui';
import { EntityTable } from '@/components/EntityTable';
import { EntityForm } from '@/components/EntityForm';

export function ChecksPage() {
  const { data: d } = useStore();
  const cfg = CONFIGS.inspections;
  const [form, setForm] = useState<{ row: Row | null; preset?: Record<string, string> } | null>(null);

  const rows = d.machines
    .map((m) => ({ m, next: nextCheck(d, m), last: lastCheck(d, m), state: checkState(d, m) }))
    .sort((a, b) => a.next.localeCompare(b.next));
  const due = rows.filter((r) => r.state.tone !== 'ok').length;

  return (
    <>
      <PageHead
        title="Monthly checks"
        note={d.machines.length ? `${due} of ${d.machines.length} machines due or overdue. Saving a check updates the machine status.` : cfg.note}
      />
      {d.machines.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm">
          <span>Register a machine first. Every registered machine gets a monthly check.</span>
          <Link to="/machines?new=1" className="btn">Register a machine</Link>
        </div>
      ) : (
        <div className="overflow-x-auto border-b border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Machine', 'Current status', 'Last checked', 'Next check', ''].map((h, i) => (
                  <th key={i} className="border border-slate-200 border-t-0 px-4 py-2 text-xs font-medium text-slate-600 first:border-l-0 last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, next, last, state }) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="border border-slate-200 border-l-0 px-4 py-2.5">
                    <Link to={`/machines/${m.id}`} className="flex items-center gap-3 hover:text-brand">
                      <Avatar src={String(m.photo || '')} name={String(m.name)} size={32} />
                      <span><span className="font-medium">{m.name}</span><span className="block text-xs text-slate-500">{m.machineCode}</span></span>
                    </Link>
                  </td>
                  <td className="border border-slate-200 px-4 py-2.5">{m.status}</td>
                  <td className="border border-slate-200 px-4 py-2.5">{last ?? 'Never'}</td>
                  <td className="border border-slate-200 px-4 py-2.5"><Dot tone={state.tone}>{next} · {state.text}</Dot></td>
                  <td className="border border-slate-200 border-r-0 px-4 py-2.5 text-right">
                    <button className="text-sm font-medium text-brand hover:underline" onClick={() => setForm({ row: null, preset: { machineId: m.id, status: String(m.status) } })}>Check now</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-medium">Check history</h2>
      <EntityTable cfg={cfg} rows={d.inspections} empty="No checks recorded yet" onEdit={(r) => setForm({ row: r })} />
      {form && <EntityForm cfg={cfg} row={form.row} preset={form.preset} onClose={() => setForm(null)} />}
    </>
  );
}
