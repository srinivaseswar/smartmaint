import { MACHINE_STATUS } from '@/lib/config';

// Accepts the keys people commonly put in a machine QR code.
const ALIAS: Record<string, string> = {
  name: 'name', machine: 'name', machinename: 'name', title: 'name',
  id: 'machineCode', code: 'machineCode', machineid: 'machineCode', machinecode: 'machineCode', assetid: 'machineCode', asset: 'machineCode', assetcode: 'machineCode',
  type: 'type', category: 'type', machinetype: 'type',
  manufacturer: 'manufacturer', make: 'manufacturer', brand: 'manufacturer', maker: 'manufacturer',
  model: 'model', modelno: 'model', modelnumber: 'model',
  serial: 'serialNumber', serialno: 'serialNumber', serialnumber: 'serialNumber', sn: 'serialNumber',
  location: 'location', line: 'location', plant: 'location', area: 'location',
  installdate: 'installDate', installed: 'installDate', installedon: 'installDate', commissioned: 'installDate',
  status: 'status',
};
const norm = (k: string) => k.toLowerCase().replace(/[^a-z]/g, '');
const pad = (n: number) => String(n).padStart(2, '0');

/** Turns QR text (JSON, "key: value" lines, a URL with ?params, or a bare ID) into machine form values. */
export function parseMachineQr(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (k: string, v: unknown) => {
    const key = ALIAS[norm(k)];
    const val = typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '';
    if (key && val && !out[key]) out[key] = val.slice(0, 200);
  };
  const t = text.trim();

  if (/^https?:\/\//i.test(t)) {
    try {
      new URL(t).searchParams.forEach((v, k) => put(k, v));
    } catch { /* not a valid URL */ }
    if (Object.keys(out).length === 0) out.machineCode = t.slice(0, 60);
  } else {
    let parsed: unknown;
    try { parsed = JSON.parse(t); } catch { parsed = undefined; }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.entries(parsed as Record<string, unknown>).forEach(([k, v]) => put(k, v));
    } else {
      let pairs = 0;
      for (const line of t.split(/[\n;|]+/)) {
        const m = line.match(/^\s*([^:=]+?)\s*[:=]\s*(.+)$/);
        if (m) { pairs++; put(m[1], m[2]); }
      }
      if (pairs === 0 && t) out.machineCode = t.slice(0, 60);
    }
  }

  if (out.installDate && !/^\d{4}-\d{2}-\d{2}$/.test(out.installDate)) {
    const d = new Date(out.installDate);
    if (Number.isNaN(d.getTime())) delete out.installDate;
    else out.installDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  if (out.status) {
    const hit = MACHINE_STATUS.find((s) => s.toLowerCase() === out.status.toLowerCase());
    if (hit) out.status = hit; else delete out.status;
  }
  return out;
}

/** The text stored in a machine's printable QR label. */
export function machineQrPayload(m: Record<string, unknown>): string {
  const keys = ['name', 'machineCode', 'type', 'manufacturer', 'model', 'serialNumber', 'location', 'installDate'];
  const o: Record<string, string> = {};
  keys.forEach((k) => { if (m[k]) o[k] = String(m[k]); });
  return JSON.stringify(o);
}
