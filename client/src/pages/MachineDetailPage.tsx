import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore, type EntityKey, type Row } from '@/lib/store';
import { CONFIGS, type EntityConfig } from '@/lib/config';
import { EntityTable } from '@/components/EntityTable';
import { EntityForm } from '@/components/EntityForm';
import { Avatar, Dot, PageHead } from '@/components/ui';
import { MachineQr } from '@/components/MachineQr';

const related: { entity: EntityKey; title: string }[] = [
  { entity: 'inspections', title: 'Monthly checks' },
  { entity: 'schedules', title: 'Maintenance' },
  { entity: 'spares', title: 'Spare parts' },
  { entity: 'warranties', title: 'Warranty' },
  { entity: 'services', title: 'Service history' },
];
const tone = { Running: 'ok', Idle: 'mute', 'Under maintenance': 'warn', Breakdown: 'bad' } as const;

export function MachineDetailPage() {
  const { id } = useParams();
  const { data } = useStore();
  const machine = data.machines.find((m) => m.id === id);
  const [form, setForm] = useState<{ cfg: EntityConfig; row: Row | null } | null>(null);

  if (!machine) {
    return <div className="p-6"><p className="font-medium">Machine not found.</p><Link to="/machines" className="mt-2 inline-block text-brand underline">Back to machines</Link></div>;
  }
  const facts: [string, string][] = [
    ['Machine ID', String(machine.machineCode)], ['Type', String(machine.type || '—')], ['Manufacturer', String(machine.manufacturer || '—')],
    ['Model', String(machine.model || '—')], ['Serial number', String(machine.serialNumber || '—')], ['Location', String(machine.location || '—')],
    ['Installed on', String(machine.installDate || '—')],
  ];

  return (
    <>
      <PageHead
        lead={<Avatar src={String(machine.photo || '')} name={String(machine.name)} size={72} />}
        title={String(machine.name)}
        note={String(machine.machineCode)}
        action={<div className="flex items-center gap-4"><Dot tone={tone[machine.status as keyof typeof tone] ?? 'mute'}>{machine.status}</Dot><button className="btn-ghost" onClick={() => setForm({ cfg: CONFIGS.machines, row: machine })}>Edit machine</button></div>}
      />
      <div className="grid grid-cols-2 border-b border-slate-200 md:grid-cols-4">
        {facts.map(([k, v], i) => (
          <div key={k} className={`border-slate-200 p-4 ${i % 2 === 0 ? 'border-r' : ''} md:border-r md:[&:nth-child(4n)]:border-r-0 ${i < 4 ? 'border-b' : ''}`}>
            <p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>
      <section className="border-b border-slate-200">
        <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-medium">QR label</h2>
        <MachineQr machine={machine} />
      </section>
      {related.map(({ entity, title }) => {
        const cfg = CONFIGS[entity];
        const rows = data[entity].filter((r) => r.machineId === machine.id);
        return (
          <section key={entity} className="border-b border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
              <h2 className="text-sm font-medium">{title} <span className="text-slate-500">({rows.length})</span></h2>
              <button className="text-sm font-medium text-brand hover:underline" onClick={() => setForm({ cfg, row: null })}>Add {cfg.singular}</button>
            </div>
            <EntityTable cfg={cfg} rows={rows} searchable={false} empty={`No ${title.toLowerCase()} for this machine`} onEdit={(r) => setForm({ cfg, row: r })} />
          </section>
        );
      })}
      {form && <EntityForm cfg={form.cfg} row={form.row} preset={form.cfg.entity === 'machines' ? undefined : { machineId: machine.id }} onClose={() => setForm(null)} />}
    </>
  );
}
