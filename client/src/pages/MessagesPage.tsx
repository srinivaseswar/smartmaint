import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Empty, PageHead } from '@/components/ui';

interface Msg {
  id: string; subject: string; body: string; createdAt: string; unread: boolean; toLabel: string; mine: boolean;
  from: { id: string; name: string; role: string; photo: string };
}

export function MessagesPage() {
  const { user, people, refreshUnread } = useStore();
  const [params] = useSearchParams();
  const [box, setBox] = useState<'inbox' | 'sent'>('inbox');
  const [items, setItems] = useState<Msg[] | null>(null);
  const [to, setTo] = useState(params.get('to') ? `user:${params.get('to')}` : 'all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const others = people.filter((p) => p.id !== user?.id);
  const roles = [...new Map(others.filter((p) => p.role.trim()).map((p) => [p.role.trim().toLowerCase(), p.role.trim()])).values()];

  const load = useCallback(async (b: 'inbox' | 'sent') => {
    try {
      const list = await api<Msg[]>(`/messages?box=${b}`);
      setItems(list);
      if (b === 'inbox' && list.some((m) => m.unread)) {
        await api('/messages/read-all', { method: 'POST' });
        void refreshUnread();
      }
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : 'Could not load messages.');
    }
  }, [refreshUnread]);

  useEffect(() => { setItems(null); void load(box); }, [box, load]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (!body.trim()) return setError('Write a message first.');
    const payload = to === 'all' ? { toType: 'all' }
      : to.startsWith('role:') ? { toType: 'role', toRole: to.slice(5) }
      : { toType: 'user', toUser: to.slice(5) };
    setBusy(true);
    try {
      await api('/messages', { method: 'POST', body: { ...payload, subject, body } });
      setSubject(''); setBody(''); setNotice('Message sent.');
      if (box === 'sent') void load('sent'); else setBox('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the message.');
    }
    setBusy(false);
  };

  const del = async (id: string) => {
    if (!window.confirm(`Delete this message from your ${box === 'inbox' ? 'inbox' : 'sent list'}? Other people keep their copy.`)) return;
    try {
      await api(`/messages/${id}`, { method: 'DELETE' });
      setItems((l) => l && l.filter((m) => m.id !== id));
      void refreshUnread();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the message.');
    }
  };

  return (
    <>
      <PageHead title="Messages" note="Send a message to one person, everyone, or everyone with a role." />
      {others.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm">
          <span>You are the only person here. Add your team to send messages.</span>
          {user?.accessRole === 'super_admin' && <Link to="/people?new=1" className="btn">Add a person</Link>}
        </div>
      ) : (
        <form onSubmit={send} className="grid gap-px border-b border-slate-200 bg-slate-200 md:grid-cols-[260px_1fr]" noValidate>
          <div className="space-y-4 bg-white p-5">
            <div>
              <label className="label" htmlFor="m-to">Send to</label>
              <select id="m-to" className="input" value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="all">Everyone</option>
                {roles.length > 0 && (
                  <optgroup label="By role">
                    {roles.map((r) => <option key={r} value={`role:${r}`}>Everyone with role: {r}</option>)}
                  </optgroup>
                )}
                <optgroup label="One person">
                  {others.map((p) => <option key={p.id} value={`user:${p.id}`}>{p.name}{p.role && ` (${p.role})`}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="m-sub">Subject (optional)</label>
              <input id="m-sub" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
            </div>
          </div>
          <div className="bg-white p-5">
            <label className="label" htmlFor="m-body">Message</label>
            <textarea id="m-body" rows={4} maxLength={2000} className="input h-auto py-2" value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className={`text-sm ${error ? 'text-red-600' : 'text-green-700'}`} role="alert">{error || notice}</p>
              <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 border-b border-slate-200 text-sm font-medium sm:max-w-xs" role="tablist">
        {(['inbox', 'sent'] as const).map((b) => (
          <button key={b} role="tab" aria-selected={box === b} onClick={() => setBox(b)}
            className={`h-10 border-r border-slate-200 ${box === b ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>
            {b === 'inbox' ? 'Inbox' : 'Sent'}
          </button>
        ))}
      </div>

      {items === null ? <p className="px-6 py-6 text-sm text-slate-500">Loading…</p>
        : items.length === 0 ? <Empty title={box === 'inbox' ? 'Your inbox is empty' : 'You have not sent any messages'} />
        : (
          <ul>
            {items.map((m) => (
              <li key={m.id} className="flex gap-4 border-b border-slate-200 px-6 py-4">
                <Avatar src={m.from.photo} name={m.from.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 text-sm">
                    <span className="font-medium">{box === 'sent' ? `To: ${m.toLabel}` : m.from.name}</span>
                    {box === 'inbox' && m.from.role && <span className="text-slate-500">{m.from.role}</span>}
                    {box === 'inbox' && m.toLabel !== 'Everyone' && <span className="text-slate-500">· sent to {m.toLabel.replace('Everyone with role: ', 'role ')}</span>}
                    <span className="text-slate-500">{new Date(m.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {m.unread && <span className="bg-brand px-1.5 text-xs font-medium text-white">New</span>}
                  </div>
                  {m.subject && <p className="mt-1 font-medium">{m.subject}</p>}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{m.body}</p>
                </div>
                <button onClick={() => del(m.id)} className="self-start text-sm text-slate-500 hover:text-red-600" aria-label="Delete message">Delete</button>
              </li>
            ))}
          </ul>
        )}
    </>
  );
}
