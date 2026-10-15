import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore, type Person } from '@/lib/store';
import { Avatar, Empty, Modal, PageHead } from '@/components/ui';
import { PhotoInput } from '@/components/PhotoInput';
import { ROLE_OPTIONS, type AccessRole } from '@/lib/access';

function PersonForm({ person, roles, onClose, onSaved }: { person: Person | null; roles: string[]; onClose: () => void; onSaved: (message: string) => void }) {
  const { addPerson, updatePerson, user } = useStore();
  const [f, setF] = useState({
    name: person?.name ?? '', role: person?.role ?? '', phone: person?.phone ?? '',
    email: person?.email ?? '', photo: person?.photo ?? '', login: true, password: '', accessRole: person?.accessRole ?? 'manager',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: 'name' | 'role' | 'phone' | 'email' | 'password') => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setError('Name is required.');
    if (!f.role.trim()) return setError('Role is required.');
    if (!person && f.login) {
      if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email so this person can sign in.');
      if (f.password.length < 6) return setError('Password must be at least 6 characters.');
    }
    setBusy(true);
    const err = person
      ? await updatePerson(person.id, { name: f.name, role: f.role, phone: f.phone, photo: f.photo, ...(user?.accessRole === 'super_admin' ? { accessRole: f.accessRole } : {}) })
      : await addPerson({ name: f.name, role: f.role, phone: f.phone, photo: f.photo, email: f.email, password: f.login ? f.password : undefined, accessRole: f.accessRole });
    setBusy(false);
    if (err) return setError(err);
    onSaved(person ? 'User details saved successfully.' : 'Account created successfully. The user can now sign in with the registered email and password.');
    onClose();
  };

  return (
    <Modal title={person ? 'Edit person' : 'Add person'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
          <div className="bg-white p-4 sm:col-span-2"><span className="label">Photo</span><PhotoInput value={f.photo} onChange={(v) => setF({ ...f, photo: v })} name={f.name} /></div>
          <div className="bg-white p-4"><label className="label" htmlFor="p-name">Name *</label><input id="p-name" className="input" value={f.name} onChange={set('name')} /></div>
          <div className="bg-white p-4">
            <label className="label" htmlFor="p-role">Role *</label>
            <input id="p-role" className="input" list="roles" placeholder="Technician, Store keeper…" value={f.role} onChange={set('role')} />
            <datalist id="roles">{roles.map((r) => <option key={r} value={r} />)}</datalist>
          </div>
          {user?.accessRole === 'super_admin' && <div className="bg-white p-4">
            <label className="label" htmlFor="p-access-role">System access role</label>
            <select id="p-access-role" className="input" value={f.accessRole} disabled={person?.id === user?.id} onChange={(e) => setF({ ...f, accessRole: e.target.value as AccessRole })}>
              {ROLE_OPTIONS.map((access) => <option key={access.value} value={access.value}>{access.label}</option>)}
            </select>
          </div>}
          <div className="bg-white p-4"><label className="label" htmlFor="p-phone">Phone</label><input id="p-phone" className="input" value={f.phone} onChange={set('phone')} /></div>
          {!person && <div className="bg-white p-4"><label className="label" htmlFor="p-email">Email</label><input id="p-email" type="email" className="input" value={f.email} onChange={set('email')} /></div>}
          {!person && (
            <div className="bg-white p-4 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.login} onChange={(e) => setF({ ...f, login: e.target.checked })} />Let this person sign in and read messages</label>
              {f.login && (
                <div className="mt-3 max-w-xs"><label className="label" htmlFor="p-pass">Password for this person</label><input id="p-pass" type="password" className="input" value={f.password} onChange={set('password')} autoComplete="new-password" /></div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3">
          <p className="text-sm text-red-600" role="alert">{error}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save person'}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function PeoplePage() {
  const { user, people, removePerson } = useStore();
  const [params, setParams] = useSearchParams();
  const admin = user?.accessRole === 'super_admin';
  const [form, setForm] = useState<Person | 'new' | null>(admin && params.get('new') === '1' ? 'new' : null);
  const roles = [...new Set(people.map((p) => p.role).filter(Boolean))];
  const [success, setSuccess] = useState('');
  const close = () => { setForm(null); if (params.has('new')) setParams({}); };

  return (
    <>
      <PageHead
        title="Team"
        note={admin ? 'Manage people and their system access roles.' : user?.accessRole === 'manager' ? 'View workspace people and edit your own profile.' : 'View and edit your own account profile.'}
        action={admin && <button className="btn" onClick={() => setForm('new')}><Plus size={16} />Add person</button>}
      />
      {success && <p className="border-b border-green-200 bg-green-50 px-6 py-3 text-sm text-green-800" role="status">{success}</p>}
      {people.length === 0 ? <Empty title="No people yet" /> : (
        <div className="grid border-t-0 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <div key={p.id} className="flex flex-col gap-4 border-b border-r border-slate-200 p-5">
              <div className="flex items-center gap-4">
                <Avatar src={p.photo} name={p.name} size={64} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}{p.id === user?.id && <span className="font-normal text-slate-500"> (you)</span>}</p>
                  <p className="truncate text-sm text-slate-600">{p.role || 'No role'}</p>
                </div>
              </div>
              <div className="space-y-0.5 text-sm text-slate-500">
                <p className="truncate">{p.phone || 'No phone'}</p>
                <p className="truncate">{p.email || 'No email'}{p.canLogin && ' · can sign in'}</p>
              </div>
              <div className="mt-auto flex items-center gap-4 text-sm font-medium">
                {p.id !== user?.id && <Link to={`/messages?to=${p.id}`} className="text-brand hover:underline">Message</Link>}
                {(admin || p.id === user?.id) && <button className="text-slate-700 hover:text-brand" onClick={() => setForm(p)}>Edit</button>}
                {admin && p.id !== user?.id && (
                  <button className="text-slate-700 hover:text-red-600" onClick={async () => {
                    if (!window.confirm(`Delete ${p.name}? ${p.canLogin ? 'They will no longer be able to sign in.' : ''}`)) return;
                    const err = await removePerson(p.id);
                    if (err) window.alert(err);
                  }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {form && <PersonForm person={form === 'new' ? null : form} roles={roles} onClose={close} onSaved={setSuccess} />}
    </>
  );
}
