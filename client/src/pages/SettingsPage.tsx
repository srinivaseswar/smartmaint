import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, Database } from 'lucide-react';
import { PageHeader } from '@/components/ui/Toolbar';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleTheme } from '@/store/themeSlice';

export function SettingsPage() {
  const theme = useAppSelector((s) => s.theme.theme);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your account and system preferences" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile settings */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" defaultValue={user?.name || ''} />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" defaultValue={user?.email || ''} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" className="input" placeholder="+1 555 000 0000" />
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            {theme === 'light' ? <Sun className="h-5 w-5 text-slate-400" /> : <Moon className="h-5 w-5 text-slate-400" />}
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
                <p className="text-xs text-slate-400">Toggle dark theme across the app</p>
              </div>
              <button
                onClick={() => dispatch(toggleTheme())}
                className={`relative h-6 w-11 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
          </div>
          <div className="space-y-3">
            {['Maintenance reminders', 'Low-stock alerts', 'Breakdown notifications', 'Warranty expiry alerts', 'Purchase approval requests'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">System Information</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'System Version', value: 'v2.4.1' },
              { label: 'Database', value: 'MongoDB 7.0' },
              { label: 'API Version', value: 'v1.0' },
              { label: 'Last Backup', value: '2026-08-28 03:00 UTC' },
              { label: 'Uptime', value: '99.97%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
