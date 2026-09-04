import {
  factories, departments, machines, maintenanceSchedules, breakdowns,
  spareParts, inventoryTransactions, warehouses, suppliers,
  purchaseRequests, purchaseOrders, warranties, serviceRecords,
  notifications, auditLogs, users, kpiData, forecastData,
  downtimeTrendData, maintenanceCostTrendData, breakdownFrequencyData,
  sparePartConsumptionData, inventoryTurnoverData, preventiveVsCorrectiveData,
  machineReliabilityData,
} from '@/data/seed';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  filters?: Record<string, string | undefined>;
}

function paginate<T>(items: T[], params: QueryParams): PaginatedResult<T> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

function sortItems<T>(items: T[], sortBy?: string, sortDir?: 'asc' | 'desc'): T[] {
  if (!sortBy) return items;
  const dir = sortDir === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortBy];
    const bv = (b as Record<string, unknown>)[sortBy];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
}

function searchItems<T>(items: T[], search: string, fields: string[]): T[] {
  if (!search) return items;
  const q = search.toLowerCase();
  return items.filter((item) => {
    const record = item as Record<string, unknown>;
    return fields.some((f) => String(record[f] ?? '').toLowerCase().includes(q));
  });
}

function filterItems<T>(items: T[], filters: Record<string, string | undefined>): T[] {
  const activeFilters = Object.entries(filters).filter(([, v]) => v != null && v !== '' && v !== 'all');
  if (activeFilters.length === 0) return items;
  return items.filter((item) => {
    const record = item as Record<string, unknown>;
    return activeFilters.every(([key, val]) => String(record[key] ?? '').toLowerCase() === String(val).toLowerCase());
  });
}

function query<T>(items: T[], params: QueryParams, searchFields: string[]): PaginatedResult<T> {
  let result = searchItems(items, params.search || '', searchFields);
  result = filterItems(result, params.filters || {});
  result = sortItems(result, params.sortBy, params.sortDir);
  return paginate(result, params);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── API ─────────────────────────────────────────────────────────────────────
export const api = {
  async getMachines(params: QueryParams = {}) {
    await delay(150);
    return query(machines, params, ['name', 'machine_id', 'manufacturer', 'model', 'serial_number', 'type']);
  },
  async getMachine(id: string) {
    await delay(100);
    return machines.find((m) => m.id === id) || null;
  },
  async getMaintenanceSchedules(params: QueryParams = {}) {
    await delay(150);
    return query(maintenanceSchedules, params, ['machine_name', 'machine_id_code', 'assigned_technician', 'description']);
  },
  async getBreakdowns(params: QueryParams = {}) {
    await delay(150);
    return query(breakdowns, params, ['machine_name', 'machine_id_code', 'symptoms', 'assigned_technician', 'breakdown_id']);
  },
  async getSpareParts(params: QueryParams = {}) {
    await delay(150);
    return query(spareParts, params, ['name', 'part_number', 'supplier_name', 'warehouse_name']);
  },
  async getInventoryTransactions(params: QueryParams = {}) {
    await delay(150);
    return query(inventoryTransactions, params, ['part_name', 'part_number', 'reference', 'performed_by']);
  },
  async getSuppliers(params: QueryParams = {}) {
    await delay(150);
    return query(suppliers, params, ['name', 'contact_person', 'email', 'address']);
  },
  async getPurchaseRequests(params: QueryParams = {}) {
    await delay(150);
    return query(purchaseRequests, params, ['request_number', 'requested_by', 'department']);
  },
  async getPurchaseOrders(params: QueryParams = {}) {
    await delay(150);
    return query(purchaseOrders, params, ['order_number', 'supplier_name', 'created_by']);
  },
  async getWarranties(params: QueryParams = {}) {
    await delay(150);
    return query(warranties, params, ['warranty_number', 'machine_name', 'machine_id_code', 'provider', 'component_name']);
  },
  async getServiceRecords(params: QueryParams = {}) {
    await delay(150);
    return query(serviceRecords, params, ['service_id', 'machine_name', 'machine_id_code', 'technician', 'problem_description']);
  },
  async getNotifications(params: QueryParams = {}) {
    await delay(100);
    return query(notifications, params, ['title', 'message', 'module']);
  },
  async getAuditLogs(params: QueryParams = {}) {
    await delay(150);
    return query(auditLogs, params, ['user', 'action', 'module', 'entity_id']);
  },
  async getFactories() {
    await delay(100);
    return factories;
  },
  async getDepartments() {
    await delay(100);
    return departments;
  },
  async getWarehouses() {
    await delay(100);
    return warehouses;
  },
  async getUsers() {
    await delay(100);
    return users;
  },
  async getUsersPaginated(params: QueryParams = {}) {
    await delay(100);
    return query(users, params, ['name', 'email', 'role_name', 'phone']);
  },
  async getKPIs() {
    await delay(100);
    return kpiData;
  },
  async getForecastData() {
    await delay(200);
    return forecastData;
  },
  async getDowntimeTrend() {
    await delay(100);
    return downtimeTrendData;
  },
  async getMaintenanceCostTrend() {
    await delay(100);
    return maintenanceCostTrendData;
  },
  async getBreakdownFrequency() {
    await delay(100);
    return breakdownFrequencyData;
  },
  async getSparePartConsumption() {
    await delay(100);
    return sparePartConsumptionData;
  },
  async getInventoryTurnover() {
    await delay(100);
    return inventoryTurnoverData;
  },
  async getPreventiveVsCorrective() {
    await delay(100);
    return preventiveVsCorrectiveData;
  },
  async getMachineReliability() {
    await delay(100);
    return machineReliabilityData;
  },
};
