import type { Role, RoleKey } from '@/types';

export const ROLE_CATALOG: Role[] = [
  {
    key: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access, user management, and global configuration',
    permissions: ['*'],
  },
  {
    key: 'factory_manager',
    name: 'Factory Manager',
    description: 'Oversees factory operations, reviews analytics and KPIs',
    permissions: [
      'dashboard:view',
      'machines:view',
      'maintenance:view',
      'breakdowns:view',
      'inventory:view',
      'forecasting:view',
      'suppliers:view',
      'warranty:view',
      'service_history:view',
      'predictive:view',
      'notifications:view',
      'audit:view',
    ],
  },
  {
    key: 'maintenance_manager',
    name: 'Maintenance Manager',
    description: 'Plans and manages maintenance schedules and work orders',
    permissions: [
      'dashboard:view',
      'machines:view',
      'maintenance:view',
      'maintenance:edit',
      'breakdowns:view',
      'breakdowns:edit',
      'inventory:view',
      'forecasting:view',
      'warranty:view',
      'service_history:view',
      'service_history:edit',
      'predictive:view',
      'notifications:view',
    ],
  },
  {
    key: 'maintenance_engineer',
    name: 'Maintenance Engineer',
    description: 'Executes maintenance tasks and reports breakdowns',
    permissions: [
      'dashboard:view',
      'machines:view',
      'maintenance:view',
      'maintenance:edit',
      'breakdowns:view',
      'breakdowns:edit',
      'service_history:view',
      'service_history:edit',
      'notifications:view',
    ],
  },
  {
    key: 'inventory_manager',
    name: 'Inventory Manager',
    description: 'Manages spare parts inventory, warehouses, and stock transactions',
    permissions: [
      'dashboard:view',
      'machines:view',
      'inventory:view',
      'inventory:edit',
      'forecasting:view',
      'suppliers:view',
      'notifications:view',
    ],
  },
  {
    key: 'procurement_officer',
    name: 'Procurement Officer',
    description: 'Handles purchase requests, orders, and supplier relationships',
    permissions: [
      'dashboard:view',
      'inventory:view',
      'suppliers:view',
      'suppliers:edit',
      'notifications:view',
    ],
  },
  {
    key: 'supplier',
    name: 'Supplier',
    description: 'Views purchase orders and updates delivery status',
    permissions: [
      'dashboard:view',
      'suppliers:view',
      'notifications:view',
    ],
  },
];

export const ROLE_MAP: Record<RoleKey, Role> = Object.fromEntries(
  ROLE_CATALOG.map((r) => [r.key, r]),
) as Record<RoleKey, Role>;

export function hasPermission(role: RoleKey, permission: string): boolean {
  const r = ROLE_MAP[role];
  if (!r) return false;
  return r.permissions.includes('*') || r.permissions.includes(permission);
}

export function canAccessModule(role: RoleKey, moduleKey: string): boolean {
  const modulePermissions: Record<string, string> = {
    dashboard: 'dashboard:view',
    machines: 'machines:view',
    maintenance: 'maintenance:view',
    breakdowns: 'breakdowns:view',
    inventory: 'inventory:view',
    forecasting: 'forecasting:view',
    suppliers: 'suppliers:view',
    warranty: 'warranty:view',
    service_history: 'service_history:view',
    predictive: 'predictive:view',
    notifications: 'notifications:view',
    audit: 'audit:view',
  };
  const perm = modulePermissions[moduleKey];
  if (!perm) return false;
  return hasPermission(role, perm);
}
