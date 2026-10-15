import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui';
import { canAccessModule, ROLE_LABELS } from '@/lib/access';

const nav = [
  { module: 'dashboard', to: '/dashboard', label: 'Dashboard' },
  { module: 'machines', to: '/machines', label: 'Machines' },
  { module: 'checks', to: '/checks', label: 'Monthly checks' },
  { module: 'people', to: '/people', label: 'User management' },
  { module: 'messages', to: '/messages', label: 'Messages' },
  { module: 'schedules', to: '/schedules', label: 'Maintenance scheduling' },
  { module: 'spares', to: '/spares', label: 'Spare parts' },
  { module: 'suppliers', to: '/suppliers', label: 'Suppliers' },
  { module: 'warranties', to: '/warranties', label: 'Warranty' },
  { module: 'services', to: '/services', label: 'Service history' },
  { module: 'supplyOrders', to: '/supply-orders', label: 'Orders and deliveries' },
  { module: 'partWarranties', to: '/part-warranties', label: 'Spare-part warranties' },
  { module: 'partServices', to: '/part-history', label: 'Spare-part activity' },
] as const;

export function Layout() {
  const { user, signOut, unread } = useStore();
  const role = user?.accessRole;
  const title = role === 'super_admin' ? 'System dashboard'
    : role === 'manager' ? 'Manager dashboard'
      : role === 'supplier' ? 'Supplier dashboard' : 'Inventory dashboard';
  return (
    <div className="min-h-full md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-slate-200 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <p className="font-semibold">SmartMaint</p>
          {user?.company && <p className="hidden text-xs text-slate-500 md:mt-1 md:block">{user.company}</p>}
          <button onClick={signOut} className="text-sm text-slate-500 hover:text-slate-900 md:hidden">Sign out</button>
        </div>
        <nav className="flex overflow-x-auto border-t border-slate-200 md:flex-1 md:flex-col md:overflow-y-auto" aria-label="Main">
          {nav.filter((item) => canAccessModule(role, item.module)).map(({ module, to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex items-center justify-between gap-3 whitespace-nowrap border-b-2 px-5 py-2.5 text-sm md:border-b md:border-l-2 md:border-b-slate-200 ${isActive ? 'border-b-brand border-l-brand font-medium text-brand' : 'border-l-transparent text-slate-600 hover:bg-slate-50'}`}>
              {module === 'dashboard' ? title : role === 'supplier' && module === 'spares' ? 'Parts availability' : label}
              {to === '/messages' && unread > 0 && <span className="min-w-5 bg-brand px-1.5 text-center text-xs font-medium text-white">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 border-t border-slate-200 p-4 md:flex">
          <Avatar src={user?.photo} name={user?.name ?? ''} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{role ? ROLE_LABELS[role] : user?.email}</p>
            <button onClick={signOut} className="text-xs text-brand hover:underline">Sign out</button>
          </div>
        </div>
      </aside>
      <main className="min-w-0"><Outlet /></main>
    </div>
  );
}
