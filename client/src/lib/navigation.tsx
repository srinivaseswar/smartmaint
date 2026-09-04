import type { RoleKey } from '@/types';
import {
  LayoutDashboard, Cpu, Wrench, AlertTriangle, Package,
  TrendingUp, Truck, ShieldCheck, ClipboardList, Activity,
  Bell, FileClock, Settings, Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
  permission: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'dashboard:view' },
    ],
  },
  {
    label: 'Asset Management',
    items: [
      { key: 'machines', label: 'Machines', icon: Cpu, path: '/machines', permission: 'machines:view' },
      { key: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/maintenance', permission: 'maintenance:view' },
      { key: 'breakdowns', label: 'Breakdowns', icon: AlertTriangle, path: '/breakdowns', permission: 'breakdowns:view' },
      { key: 'service_history', label: 'Service History', icon: ClipboardList, path: '/service-history', permission: 'service_history:view' },
    ],
  },
  {
    label: 'Inventory & Procurement',
    items: [
      { key: 'inventory', label: 'Spare Parts', icon: Package, path: '/inventory', permission: 'inventory:view' },
      { key: 'forecasting', label: 'Forecasting', icon: TrendingUp, path: '/forecasting', permission: 'forecasting:view' },
      { key: 'suppliers', label: 'Suppliers & Procurement', icon: Truck, path: '/suppliers', permission: 'suppliers:view' },
    ],
  },
  {
    label: 'Analytics & Compliance',
    items: [
      { key: 'predictive', label: 'Predictive Maintenance', icon: Activity, path: '/predictive', permission: 'predictive:view' },
      { key: 'warranty', label: 'Warranty', icon: ShieldCheck, path: '/warranty', permission: 'warranty:view' },
      { key: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', permission: 'notifications:view' },
      { key: 'audit', label: 'Audit Log', icon: FileClock, path: '/audit', permission: 'audit:view' },
    ],
  },
];

export const adminOnlyItems: NavItem[] = [
  { key: 'users', label: 'User Management', icon: Users, path: '/users', permission: 'users:view' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/settings', permission: 'settings:view' },
];

export function getNavItemsForRole(role: RoleKey): NavSection[] {
  const sections = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => hasPermission(role, item.permission)),
  })).filter((section) => section.items.length > 0);

  if (role === 'super_admin') {
    sections.push({ label: 'Administration', items: adminOnlyItems });
  }
  return sections;
}

import { hasPermission } from '@/lib/rbac';
