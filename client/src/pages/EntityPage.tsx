import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore, type EntityKey, type Row } from '@/lib/store';
import { CONFIGS } from '@/lib/config';
import { EntityTable } from '@/components/EntityTable';
import { EntityForm } from '@/components/EntityForm';
import { PageHead } from '@/components/ui';
import { canDeleteEntity, canEditEntity, canWriteEntity } from '@/lib/access';

export function EntityPage({ entity }: { entity: EntityKey }) {
  const cfg = CONFIGS[entity];
  const { data, user } = useStore();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(params.get('new') === '1');
  const canWrite = canWriteEntity(user?.accessRole, entity);
  const canDelete = canDeleteEntity(user?.accessRole, entity);
  const supplierOrInventory = user?.accessRole === 'supplier' || user?.accessRole === 'inventory_manager';
  const blocked = cfg.requires && data[cfg.requires].length === 0 && !supplierOrInventory;

  const close = () => { setOpen(false); setEditing(null); if (params.has('new')) setParams({}); };

  return (
    <>
      <PageHead
        title={cfg.title}
        note={cfg.note}
        action={!blocked && canWrite && <button className="btn" onClick={() => setOpen(true)}><Plus size={16} />Add {cfg.singular}</button>}
      />
      {blocked && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm">
          <span>Register a machine first. {cfg.title} are always linked to a machine.</span>
          <Link to="/machines?new=1" className="btn">Register a machine</Link>
        </div>
      )}
      <EntityTable cfg={cfg} rows={data[entity]} onEdit={(r) => { setEditing(r); setOpen(true); }} canEdit={canEditEntity(user?.accessRole, entity)} canDelete={canDelete} />
      {open && canWrite && <EntityForm cfg={cfg} row={editing} onClose={close} />}
    </>
  );
}
