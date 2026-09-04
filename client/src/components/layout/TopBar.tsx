import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Menu, Bell, Sun, Moon, Search, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleTheme } from '@/store/themeSlice';
import { notifications } from '@/data/seed';
import { ROLE_MAP } from '@/lib/rbac';
import type { RoleKey } from '@/types';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const theme = useAppSelector((s) => s.theme.theme);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read && user && n.target_roles.includes(user.role)).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;
  const userNotifs = notifications.filter((n) => n.target_roles.includes(user.role)).slice(0, 5);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search machines, parts, orders..."
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white animate-pulse-ring">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-slide-in">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                <p className="text-xs text-slate-400">{unreadCount} unread</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {userNotifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
                    className={clsx('cursor-pointer border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/50', !n.read && 'bg-primary-50/50 dark:bg-primary-600/5')}
                  >
                    <div className="flex items-start gap-2">
                      <span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.priority === 'critical' ? 'bg-danger-500' : n.priority === 'warning' ? 'bg-warning-500' : 'bg-sky-500')} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{n.timestamp.replace('T', ' ').replace('Z', '')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
                className="block w-full border-t border-slate-200 py-2.5 text-center text-xs font-medium text-primary-600 hover:bg-slate-50 dark:border-slate-800 dark:text-primary-400 dark:hover:bg-slate-800"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{user.role_name}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-slide-in">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="mt-2 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-600/15 dark:text-primary-300">
                  {ROLE_MAP[user.role as RoleKey]?.name}
                </span>
              </div>
              <div className="py-1">
                <button onClick={() => { navigate('/settings'); setProfileOpen(false); }} className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                  Profile Settings
                </button>
                <button onClick={() => { navigate('/login'); setProfileOpen(false); }} className="block w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-600/10">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
