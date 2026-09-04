import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Cog, Lock, Mail, ChevronRight, ShieldCheck, Factory, Wrench, Package, Truck, User } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { login } from '@/store/authSlice';
import { ROLE_CATALOG } from '@/lib/rbac';
import type { RoleKey } from '@/types';

const roleIcons: Record<RoleKey, typeof Cog> = {
  super_admin: ShieldCheck,
  factory_manager: Factory,
  maintenance_manager: Wrench,
  maintenance_engineer: User,
  inventory_manager: Package,
  procurement_officer: Truck,
  supplier: Truck,
};

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleKey>('super_admin');
  const [email, setEmail] = useState('sarah.mitchell@smartmaint.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: RoleKey) => {
    setSelectedRole(role);
    const user = ROLE_CATALOG.find((r) => r.key === role);
    if (role === 'super_admin') setEmail('sarah.mitchell@smartmaint.com');
    if (role === 'factory_manager') setEmail('robert.chen@smartmaint.com');
    if (role === 'maintenance_manager') setEmail('james.patterson@smartmaint.com');
    if (role === 'maintenance_engineer') setEmail('david.kim@smartmaint.com');
    if (role === 'inventory_manager') setEmail('michael.brown@smartmaint.com');
    if (role === 'procurement_officer') setEmail('daniel.foster@smartmaint.com');
    if (role === 'supplier') setEmail('sales@bosch-industrial.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      dispatch(login(selectedRole));
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3479ff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 40% 80%, #f59e0b 0%, transparent 50%)' }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <Cog className="h-6 w-6 animate-[spin_12s_linear_infinite] text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">SmartMaint</p>
            <p className="text-xs text-slate-400">Industrial Management System</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Minimize downtime.<br />
            Maximize production.
          </h1>
          <p className="mt-4 text-base text-slate-300">
            A centralized platform for machine health monitoring, preventive maintenance,
            spare-parts optimization, and intelligent analytics across your manufacturing operations.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: '24/7', label: 'Monitoring' },
              { value: '99.2%', label: 'Uptime' },
              { value: '40%', label: 'Less Downtime' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© 2026 SmartMaint Industrial. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg">
              <Cog className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">SmartMaint</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in to your account</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Select your role to access the platform</p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ROLE_CATALOG.map((role) => {
              const Icon = roleIcons[role.key];
              return (
                <button
                  key={role.key}
                  onClick={() => handleRoleSelect(role.key)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                    selectedRole === role.key
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-600/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600',
                  )}
                >
                  <Icon className={clsx('h-5 w-5', selectedRole === role.key ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400')} />
                  <span className={clsx('text-[10px] font-medium leading-tight', selectedRole === role.key ? 'text-primary-700 dark:text-primary-300' : 'text-slate-500 dark:text-slate-400')}>
                    {role.name}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800" />
                Remember me
              </label>
              <button type="button" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>Sign In <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Demo platform — credentials are pre-filled. Select any role to explore.
          </p>
        </div>
      </div>
    </div>
  );
}
