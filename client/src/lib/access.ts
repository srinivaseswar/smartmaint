export const ACCESS_ROLES = ['super_admin', 'manager', 'supplier', 'inventory_manager'] as const;
export type AccessRole = (typeof ACCESS_ROLES)[number];

export const ROLE_LABELS: Record<AccessRole, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  supplier: 'Supplier',
  inventory_manager: 'Spare Parts Inventory Manager',
};

export const MODULE_ACCESS = {
  super_admin: ['dashboard', 'machines', 'checks', 'people', 'messages', 'schedules', 'spares', 'suppliers', 'warranties', 'services', 'supplyOrders', 'partWarranties', 'partServices'],
  manager: ['dashboard', 'machines', 'checks', 'people', 'messages', 'schedules', 'warranties', 'services'],
  supplier: ['dashboard', 'people', 'spares', 'supplyOrders'],
  inventory_manager: ['dashboard', 'people', 'spares', 'supplyOrders', 'partWarranties', 'partServices'],
} as const satisfies Record<AccessRole, readonly string[]>;

export const ROLE_OPTIONS = ACCESS_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }));

export function canAccessModule(role: AccessRole | undefined, module: string) {
  return !!role && (MODULE_ACCESS[role] as readonly string[]).includes(module);
}

export function canWriteEntity(role: AccessRole | undefined, entity: string) {
  if (role === 'super_admin') return true;
  if (role === 'manager') return ['machines', 'warranties', 'services', 'schedules', 'inspections'].includes(entity);
  if (role === 'inventory_manager') return ['spares', 'supplyOrders', 'partWarranties', 'partServices'].includes(entity);
  return false;
}

export function canDeleteEntity(role: AccessRole | undefined, entity: string) {
  return canWriteEntity(role, entity) && !(role === 'inventory_manager' && entity === 'partServices');
}

export function canEditEntity(role: AccessRole | undefined, entity: string) {
  return canDeleteEntity(role, entity);
}