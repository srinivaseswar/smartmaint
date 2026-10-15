import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { PhotoInput } from '@/components/PhotoInput';
import { ROLE_OPTIONS, type AccessRole } from '@/lib/access';

const tiles = ['Machines', 'Spare inventory', 'Team', 'Messages'];

export function AuthPage() {
  const { signIn, signUp } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [f, setF] = useState({ name: '', company: '', email: '', password: '', photo: '', accessRole: 'manager' as AccessRole, setupKey: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'up' && !f.name.trim()) return setError('Enter your name.');
    if (mode === 'up' && f.accessRole === 'super_admin' && !f.setupKey.trim()) return setError('Enter the Super Admin setup key.');
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.');
    if (f.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    const err = mode === 'in'
      ? await signIn(f.email, f.password, f.accessRole)
      : await signUp(f);
    setBusy(false);
    if (err) setError(err);
    else navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="grid w-full max-w-4xl border border-slate-900 md:grid-cols-2">
        <div className="flex flex-col justify-between border-b border-slate-900 md:border-b-0 md:border-r">
          <div className="p-8">
            <p className="text-lg font-semibold">SmartMaint</p>
            <h1 className="mt-10 text-3xl font-semibold leading-tight">Keep every machine, spare part and teammate in one place.</h1>
          </div>
          <div className="grid grid-cols-2 border-t border-slate-900">
            {tiles.map((t, i) => (
              <div key={t} className={`px-5 py-4 text-sm ${i % 2 === 0 ? 'border-r border-slate-900' : ''} ${i < 2 ? 'border-b border-slate-900' : ''}`}>{t}</div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="p-8" noValidate>
          <div className="mb-6 grid grid-cols-2 border border-slate-300 text-sm font-medium" role="tablist">
            {(['in', 'up'] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(''); }}
                className={`h-9 ${mode === m ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>
                {m === 'in' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {mode === 'up' && (
              <>
                <div><label className="label" htmlFor="signup-access-role">Account role</label><select id="signup-access-role" className="input" value={f.accessRole} onChange={(e) => setF({ ...f, accessRole: e.target.value as AccessRole, setupKey: '' })}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div>
                {f.accessRole === 'super_admin' && <div><label className="label" htmlFor="setup-key">Super Admin setup key</label><input id="setup-key" type="password" className="input" value={f.setupKey} onChange={(e) => setF({ ...f, setupKey: e.target.value })} autoComplete="off" /></div>}
                <div>
                  <span className="label">Your photo</span>
                  <PhotoInput value={f.photo} onChange={(v) => setF({ ...f, photo: v })} name={f.name} />
                </div>
                <div><label className="label" htmlFor="name">Your name</label><input id="name" className="input" value={f.name} onChange={set('name')} autoComplete="name" /></div>
                <div><label className="label" htmlFor="company">Factory / company (optional)</label><input id="company" className="input" value={f.company} onChange={set('company')} autoComplete="organization" /></div>
              </>
            )}
            <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" value={f.email} onChange={set('email')} autoComplete="email" /></div>
            <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" className="input" value={f.password} onChange={set('password')} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} /></div>
            {mode === 'in' && <div><label className="label" htmlFor="access-role">Sign in as</label><select id="access-role" className="input" value={f.accessRole} onChange={(e) => setF({ ...f, accessRole: e.target.value as AccessRole })}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div>}
          </div>
          <p className="mt-4 min-h-5 text-sm text-red-600" role="alert">{error}</p>
          <button className="btn mt-2 w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
          {mode === 'up' && <p className="mt-4 text-xs text-slate-500">Your workspace starts empty. You add your own machines, people and parts.</p>}
        </form>
      </div>
    </div>
  );
}
