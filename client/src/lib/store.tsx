import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, token } from '@/lib/api';
import { todayStr } from '@/lib/util';
import { canAccessModule, type AccessRole } from '@/lib/access';

export type EntityKey = 'machines' | 'spares' | 'suppliers' | 'warranties' | 'services' | 'schedules' | 'inspections' | 'supplyOrders' | 'partWarranties' | 'partServices';
export interface Row { id: string; createdAt: string; [k: string]: string | number }
export type Data = Record<EntityKey, Row[]>;
export interface Person {
  id: string; name: string; email: string; role: string; phone: string; photo: string;
  company: string; isOwner: boolean; canLogin: boolean; accessRole: AccessRole;
}
export interface PersonInput { name: string; role: string; accessRole?: AccessRole; phone?: string; email?: string; photo?: string; password?: string }
export interface SignUpInput { name: string; company: string; email: string; password: string; photo: string; accessRole: AccessRole; setupKey?: string }
type Result = Promise<string | null>;
type Values = Record<string, string | number>;

export interface Store {
  user: Person | null;
  ready: boolean;
  data: Data;
  people: Person[];
  unread: number;
  signUp: (i: SignUpInput) => Result;
  signIn: (email: string, password: string, accessRole: AccessRole) => Result;
  signOut: () => void;
  add: (e: EntityKey, v: Values) => Result;
  update: (e: EntityKey, id: string, v: Values) => Result;
  remove: (e: EntityKey, id: string) => Result;
  addPerson: (i: PersonInput) => Result;
  updatePerson: (id: string, i: Partial<PersonInput>) => Result;
  removePerson: (id: string) => Result;
  refreshUnread: () => Promise<void>;
}

const emptyData = (): Data => ({ machines: [], spares: [], suppliers: [], warranties: [], services: [], schedules: [], inspections: [], supplyOrders: [], partWarranties: [], partServices: [] });
interface AuthRes { token: string; user: Person }

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Person | null>(null);
  const [ready, setReady] = useState(!token.get());
  const [data, setData] = useState<Data>(emptyData());
  const [people, setPeople] = useState<Person[]>([]);
  const [unread, setUnread] = useState(0);

  const clear = useCallback(() => {
    token.clear();
    setUser(null); setData(emptyData()); setPeople([]); setUnread(0);
  }, []);

  const loadRecords = useCallback(async () => {
    setData({ ...emptyData(), ...(await api<Partial<Data>>('/records')) });
  }, []);

  const loadAll = useCallback(async (role: AccessRole) => {
    const [d, p, u] = await Promise.all([
      api<Partial<Data>>('/records'),
      canAccessModule(role, 'people') ? api<Person[]>('/people')
        : canAccessModule(role, 'messages') ? api<Person[]>('/people/recipients') : Promise.resolve([]),
      canAccessModule(role, 'messages') ? api<{ count: number }>('/messages/unread') : Promise.resolve({ count: 0 }),
    ]);
    setData({ ...emptyData(), ...d });
    setPeople(p);
    setUnread(u.count);
  }, []);

  // Restore session on page load
  useEffect(() => {
    if (!token.get()) return;
    (async () => {
      try {
        const me = await api<Person>('/auth/me');
        await loadAll(me.accessRole);
        setUser(me);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) clear();
      } finally {
        setReady(true);
      }
    })();
  }, [loadAll, clear]);

  const refreshUnread = useCallback(async () => {
    try { setUnread((await api<{ count: number }>('/messages/unread')).count); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user || !canAccessModule(user.accessRole, 'messages')) return;
    const t = setInterval(refreshUnread, 20000);
    return () => clearInterval(t);
  }, [user, refreshUnread]);

  const run = useCallback(async (fn: () => Promise<void>): Result => {
    try {
      await fn();
      return null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && token.get()) clear();
      return e instanceof Error ? e.message : 'Something went wrong. Try again.';
    }
  }, [clear]);

  const finishAuth = useCallback(async (r: AuthRes) => {
    token.set(r.token);
    await loadAll(r.user.accessRole);
    setUser(r.user);
  }, [loadAll]);

  const signUp = useCallback<Store['signUp']>((i) => run(async () => {
    await finishAuth(await api<AuthRes>('/auth/signup', { method: 'POST', body: i }));
  }), [run, finishAuth]);

  const signIn = useCallback<Store['signIn']>((email, password, accessRole) => run(async () => {
    await finishAuth(await api<AuthRes>('/auth/login', { method: 'POST', body: { email, password, accessRole } }));
  }), [run, finishAuth]);

  const add = useCallback<Store['add']>((e, v) => run(async () => {
    const row = await api<Row>(`/records/${e}`, { method: 'POST', body: { ...v, createdAt: todayStr() } });
    setData((d) => ({ ...d, [e]: [row, ...d[e]] }));
  }), [run]);

  const update = useCallback<Store['update']>((e, id, v) => run(async () => {
    const row = await api<Row>(`/records/${e}/${id}`, { method: 'PUT', body: v });
    setData((d) => ({ ...d, [e]: d[e].map((r) => (r.id === id ? row : r)) }));
  }), [run]);

  const remove = useCallback<Store['remove']>((e, id) => run(async () => {
    await api(`/records/${e}/${id}`, { method: 'DELETE' });
    if (e === 'machines') await loadRecords();
    else setData((d) => ({ ...d, [e]: d[e].filter((r) => r.id !== id) }));
  }), [run, loadRecords]);

  const addPerson = useCallback<Store['addPerson']>((i) => run(async () => {
    const p = await api<Person>('/people', { method: 'POST', body: i });
    setPeople((list) => [...list, p]);
  }), [run]);

  const updatePerson = useCallback<Store['updatePerson']>((id, i) => run(async () => {
    const p = await api<Person>(`/people/${id}`, { method: 'PUT', body: i });
    setPeople((list) => list.map((x) => (x.id === id ? p : x)));
    setUser((u) => (u && u.id === id ? p : u));
  }), [run]);

  const removePerson = useCallback<Store['removePerson']>((id) => run(async () => {
    await api(`/people/${id}`, { method: 'DELETE' });
    setPeople((list) => list.filter((x) => x.id !== id));
  }), [run]);

  const value = useMemo<Store>(
    () => ({ user, ready, data, people, unread, signUp, signIn, signOut: clear, add, update, remove, addPerson, updatePerson, removePerson, refreshUnread }),
    [user, ready, data, people, unread, signUp, signIn, clear, add, update, remove, addPerson, updatePerson, removePerson, refreshUnread],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
