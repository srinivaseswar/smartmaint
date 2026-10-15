import type { Data, Row } from '@/lib/store';
import { addDays, addMonths, daysUntil, num } from '@/lib/util';

export const machineLabel = (m?: Row) => (m ? `${m.name} (${m.machineCode})` : '—');
export const findMachine = (d: Data, id: unknown) => d.machines.find((m) => m.id === id);

export const nextDue = (s: Row) => addDays(String(s.lastDone || s.createdAt), num(s.frequencyDays));
export const isLow = (p: Row) => num(p.quantity) <= num(p.minQuantity);

export type Tone = 'ok' | 'warn' | 'bad' | 'mute';

export function scheduleState(s: Row): { tone: Tone; text: string } {
  const n = daysUntil(nextDue(s));
  if (n < 0) return { tone: 'bad', text: `Overdue by ${-n}d` };
  if (n <= 7) return { tone: 'warn', text: n === 0 ? 'Due today' : `Due in ${n}d` };
  return { tone: 'ok', text: `Due in ${n}d` };
}

export function warrantyState(w: Row): { tone: Tone; text: string } {
  const n = daysUntil(String(w.endDate));
  if (n < 0) return { tone: 'mute', text: 'Expired' };
  if (n <= 30) return { tone: 'warn', text: `Ends in ${n}d` };
  return { tone: 'ok', text: 'Active' };
}

export function lastCheck(d: Data, m: Row): string | null {
  const dates = d.inspections.filter((i) => i.machineId === m.id).map((i) => String(i.date)).sort();
  return dates.length ? dates[dates.length - 1] : null;
}
// A machine is checked once a month. Until its first check, the month counts from registration.
export const nextCheck = (d: Data, m: Row) => addMonths(lastCheck(d, m) ?? String(m.createdAt), 1);

export function checkState(d: Data, m: Row): { tone: Tone; text: string } {
  const n = daysUntil(nextCheck(d, m));
  if (n < 0) return { tone: 'bad', text: `Overdue by ${-n}d` };
  if (n <= 7) return { tone: 'warn', text: n === 0 ? 'Due today' : `Due in ${n}d` };
  return { tone: 'ok', text: `Due in ${n}d` };
}

export interface Alert { tone: Tone; text: string; to: string }

export function buildAlerts(d: Data): Alert[] {
  const out: Alert[] = [];
  d.machines.filter((m) => m.status === 'Breakdown').forEach((m) =>
    out.push({ tone: 'bad', text: `${machineLabel(m)} is down`, to: `/machines/${m.id}` }));
  d.machines.forEach((m) => {
    const st = checkState(d, m);
    if (st.tone !== 'ok') out.push({ tone: st.tone, text: `Monthly check ${st.text.toLowerCase()} · ${machineLabel(m)}`, to: '/checks' });
  });
  d.schedules.forEach((s) => {
    const st = scheduleState(s);
    if (st.tone !== 'ok') out.push({ tone: st.tone, text: `${s.task} · ${machineLabel(findMachine(d, s.machineId))} · ${st.text}`, to: '/schedules' });
  });
  d.spares.filter(isLow).forEach((p) =>
    out.push({ tone: 'warn', text: `${p.name} low on stock (${p.quantity} left, minimum ${p.minQuantity})`, to: '/spares' }));
  d.warranties.forEach((w) => {
    const st = warrantyState(w);
    if (st.tone === 'warn') out.push({ tone: 'warn', text: `Warranty for ${machineLabel(findMachine(d, w.machineId))} · ${st.text}`, to: '/warranties' });
  });
  const rank = { bad: 0, warn: 1, ok: 2, mute: 3 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]);
}
