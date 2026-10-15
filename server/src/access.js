export const ACCESS_ROLES = ['super_admin', 'manager', 'supplier', 'inventory_manager'];

export const roleForUser = (user) => {
  if (ACCESS_ROLES.includes(user.accessRole)) return user.accessRole;
  return user.isOwner ? 'super_admin' : 'manager';
};

export const RECORD_ACCESS = {
  super_admin: {
    read: ['machines', 'spares', 'suppliers', 'warranties', 'services', 'schedules', 'inspections', 'supplyOrders', 'partWarranties', 'partServices'],
    write: ['machines', 'spares', 'suppliers', 'warranties', 'services', 'schedules', 'inspections', 'supplyOrders', 'partWarranties', 'partServices'],
    delete: ['machines', 'spares', 'suppliers', 'warranties', 'services', 'schedules', 'inspections', 'supplyOrders', 'partWarranties', 'partServices'],
  },
  manager: {
    read: ['machines', 'warranties', 'services', 'schedules', 'inspections'],
    write: ['machines', 'warranties', 'services', 'schedules', 'inspections'],
    delete: ['machines', 'warranties', 'services', 'schedules', 'inspections'],
  },
  supplier: { read: ['machines', 'suppliers', 'spares', 'supplyOrders'], write: [], delete: [] },
  inventory_manager: {
    read: ['suppliers', 'spares', 'supplyOrders', 'partWarranties', 'partServices'],
    write: ['spares', 'supplyOrders', 'partWarranties', 'partServices'],
    delete: ['spares', 'supplyOrders', 'partWarranties'],
  },
};

export const canAccessRecords = (user, action, kind) =>
  RECORD_ACCESS[roleForUser(user)][action].includes(kind);

export const requireRoles = (...roles) => (req, res, next) =>
  roles.includes(roleForUser(req.user))
    ? next()
    : res.status(403).json({ error: 'You do not have permission to access this module.' });