export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayStr = () => fmt(new Date());

export function addDays(date: string, n: number) {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return fmt(d);
}

export function addMonths(date: string, n: number) {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return fmt(d);
}

export function daysUntil(date: string) {
  const a = new Date(date + 'T00:00:00').getTime();
  const b = new Date(todayStr() + 'T00:00:00').getTime();
  return Math.round((a - b) / 86400000);
}

export const num = (v: unknown) => Number(v) || 0;
export const money = (v: unknown) => '₹' + num(v).toLocaleString('en-IN');
