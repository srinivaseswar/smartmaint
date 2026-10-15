import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Row } from '@/lib/store';
import { useStore } from '@/lib/store';
import type { EntityConfig, FieldDef } from '@/lib/config';
import { machineLabel } from '@/lib/derive';
import { Modal } from '@/components/ui';
import { PhotoInput } from '@/components/PhotoInput';
import { QrScanner, decodeQrImage } from '@/components/QrScanner';
import { parseMachineQr } from '@/lib/qr';

export function EntityForm({
  cfg, row, preset, onClose,
}: { cfg: EntityConfig; row: Row | null; preset?: Record<string, string>; onClose: () => void }) {
  const store = useStore();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    cfg.fields.forEach((f) => {
      const v = row ? row[f.key] : cfg.defaults?.[f.key];
      base[f.key] = v === undefined || v === null ? '' : String(v);
      if (f.type === 'select' && f.options && !base[f.key]) base[f.key] = f.options[0];
    });
    return { ...base, ...(row ? {} : preset) };
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const canScan = cfg.entity === 'machines' && !row;
  const isAdmin = store.user?.accessRole === 'super_admin';

  const applyQr = (text: string) => {
    const parsed = parseMachineQr(text);
    const keys = Object.keys(parsed).filter((k) => cfg.fields.some((f) => f.key === k));
    setValues((v) => ({ ...v, ...Object.fromEntries(keys.map((k) => [k, parsed[k]])) }));
    setScanMsg(keys.length ? `Filled ${keys.length} field${keys.length > 1 ? 's' : ''} from the QR code. Check them, then save.` : 'No machine details found in that QR code. Enter them manually.');
    setScanning(false);
  };
  const fromImage = async (file?: File) => {
    if (!file) return;
    const text = await decodeQrImage(file);
    if (text) applyQr(text); else setScanMsg('No QR code found in that image.');
  };

  const options = (f: FieldDef): { value: string; label: string }[] =>
    f.ref === 'machines'
      ? store.data.machines.map((m) => ({ value: m.id, label: machineLabel(m) }))
      : f.ref === 'suppliers'
        ? store.data.suppliers.map((s) => ({ value: s.id, label: String(s.name) }))
        : f.ref === 'supplierUsers'
          ? store.people.filter((person) => person.accessRole === 'supplier').map((person) => ({ value: person.id, label: `${person.name} (${person.email})` }))
          : f.ref === 'spares'
            ? store.data.spares.map((spare) => ({ value: spare.id, label: `${spare.name} (${spare.partNumber})` }))
        : (f.options ?? []).map((o) => ({ value: o, label: o }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    for (const f of cfg.fields) {
      if (f.required && !values[f.key].trim()) return setError(`${f.label} is required.`);
      if (f.type === 'number' && values[f.key] !== '' && Number(values[f.key]) < 0) return setError(`${f.label} cannot be negative.`);
    }
    const dupe = cfg.entity === 'machines' && store.data.machines.some((m) => m.id !== row?.id && String(m.machineCode).toLowerCase() === values.machineCode.trim().toLowerCase());
    if (dupe) return setError('Another machine already uses this Machine ID.');
    if (['warranties', 'partWarranties'].includes(cfg.entity) && values.endDate < values.startDate) return setError('Warranty cannot end before it starts.');
    const out: Record<string, string | number> = {};
    cfg.fields.forEach((f) => { out[f.key] = f.type === 'number' ? Number(values[f.key] || 0) : values[f.key].trim(); });
    setBusy(true);
    const err = row ? await store.update(cfg.entity, row.id, out) : await store.add(cfg.entity, out);
    setBusy(false);
    if (err) return setError(err);
    if (cfg.entity === 'inspections' && !row) await store.update('machines', String(out.machineId), { status: out.status });
    onClose();
  };

  return (
    <Modal title={`${row ? 'Edit' : 'Add'} ${cfg.singular}`} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {canScan && (
          <div className="border-b border-slate-200 p-4">
            {scanning ? (
              <QrScanner onResult={applyQr} onClose={() => setScanning(false)} />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn" onClick={() => { setScanMsg(''); setScanning(true); }}>Scan QR code</button>
                <label className="btn-ghost cursor-pointer">
                  Upload QR image
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void fromImage(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                <span className="text-sm text-slate-500">{scanMsg || 'Scan to fill the form, or enter the details manually below.'}</span>
              </div>
            )}
          </div>
        )}
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
          {cfg.fields.filter((f) => !f.adminOnly || isAdmin).map((f) => {
            const opts = f.type === 'select' ? options(f) : [];
            return (
              <div key={f.key} className={`bg-white p-4 ${f.wide ? 'sm:col-span-2' : ''}`}>
                <label className="label" htmlFor={f.type === 'photo' ? undefined : f.key}>{f.label}{f.required && ' *'}</label>
                {f.type === 'photo' ? (
                  <PhotoInput value={values[f.key]} onChange={(v) => setValues({ ...values, [f.key]: v })} camera={f.camera} name={values.name} />
                ) : f.type === 'select' ? (
                  <select id={f.key} className="input" value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}>
                    {f.ref && <option value="">{f.required ? 'Select…' : 'None'}</option>}
                    {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea id={f.key} rows={3} className="input h-auto py-2" value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                ) : (
                  <input id={f.key} className="input" type={f.type ?? 'text'} min={f.type === 'number' ? 0 : undefined} placeholder={f.placeholder} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                )}
                {f.ref === 'suppliers' && opts.length === 0 && <p className="mt-1 text-xs text-slate-500">No suppliers yet. <Link to="/suppliers" className="text-brand underline">Add one</Link></p>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3">
          <p className="text-sm text-red-600" role="alert">{error}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : `Save ${cfg.singular}`}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
