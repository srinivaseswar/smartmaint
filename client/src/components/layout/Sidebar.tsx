import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Cog, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { getNavItemsForRole } from '@/lib/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/authSlice';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const role = useAppSelector((s) => s.auth.user?.role);
  const userName = useAppSelector((s) => s.auth.user?.name);
  const userRoleName = useAppSelector((s) => s.auth.user?.role_name);
  const avatarColor = useAppSelector((s) => s.auth.user?.avatar_color);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!role) return null;
  const sections = getNavItemsForRole(role);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900',
          collapsed ? 'w-16' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20">
              <Cog className="h-5 w-5 animate-[spin_8s_linear_infinite]" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">SmartMaint</p>
                <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">Industrial Management</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.label} className="mb-5">
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      clsx('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive', collapsed && 'justify-center px-2')
                    }
                  >
                    <item.icon className={clsx('h-[18px] w-[18px] shrink-0', collapsed && 'mx-auto')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className={clsx('flex items-center gap-2.5 rounded-lg px-2 py-2', !collapsed && 'bg-slate-50 dark:bg-slate-800/50')}>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {userName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{userName}</p>
                <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{userRoleName}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-danger-600 dark:hover:bg-slate-700 dark:hover:text-danger-400" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-2 hidden w-full items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
