import type {
  Factory,
  Department,
  Machine,
  MachineComponent,
  MaintenanceSchedule,
  Breakdown,
  SparePart,
  InventoryTransaction,
  Warehouse,
  Supplier,
  PurchaseRequest,
  PurchaseOrder,
  Warranty,
  ServiceRecord,
  AppNotification,
  AuditLog,
  User,
  KPIData,
  ForecastData,
  MachineStatus,
  CriticalityLevel,
  MaintenanceType,
  MaintenancePriority,
  MaintenanceStatus,
  BreakdownStatus,
  BreakdownSeverity,
  PartCategory,
  TransactionType,
  WarrantyStatus,
  SupplierStatus,
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  WorkOrderPart,
} from '@/types';

// Deterministic pseudo-random generator for reproducible seed data
let seed = 42;
function rand(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((rand() * (max - min) + min).toFixed(decimals));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = randInt(0, copy.length - 1);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

const today = new Date('2026-08-28');
function daysFromNow(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function daysAgo(days: number): string {
  return daysFromNow(-days);
}

// ── Factories & Departments ──────────────────────────────────────────────
export const factories: Factory[] = [
  {
    id: 'fac-001',
    name: 'Detroit Assembly Plant',
    location: 'Detroit, Michigan',
    country: 'USA',
    manager: 'Robert Chen',
    established: '1998-03-15',
    departments: [],
  },
  {
    id: 'fac-002',
    name: 'Stuttgart Precision Works',
    location: 'Stuttgart, Baden-Württemberg',
    country: 'Germany',
    manager: 'Hans Mueller',
    established: '1985-07-01',
    departments: [],
  },
  {
    id: 'fac-003',
    name: 'Osaka Electronics Facility',
    location: 'Osaka, Kansai',
    country: 'Japan',
    manager: 'Takeshi Yamamoto',
    established: '2005-11-20',
    departments: [],
  },
];

export const departments: Department[] = [
  { id: 'dep-001', name: 'Engine Assembly', factory_id: 'fac-001', production_lines: ['Line A', 'Line B', 'Line C'] },
  { id: 'dep-002', name: 'Body Welding', factory_id: 'fac-001', production_lines: ['Line A', 'Line B'] },
  { id: 'dep-003', name: 'Paint Shop', factory_id: 'fac-001', production_lines: ['Line A'] },
  { id: 'dep-004', name: 'Final Assembly', factory_id: 'fac-001', production_lines: ['Line A', 'Line B'] },
  { id: 'dep-005', name: 'CNC Machining', factory_id: 'fac-002', production_lines: ['Line A', 'Line B', 'Line C'] },
  { id: 'dep-006', name: 'Stamping', factory_id: 'fac-002', production_lines: ['Line A'] },
  { id: 'dep-007', name: 'Quality Control', factory_id: 'fac-002', production_lines: ['Line A', 'Line B'] },
  { id: 'dep-008', name: 'PCB Assembly', factory_id: 'fac-003', production_lines: ['Line A', 'Line B'] },
  { id: 'dep-009', name: 'Surface Mount', factory_id: 'fac-003', production_lines: ['Line A'] },
  { id: 'dep-010', name: 'Testing & Packaging', factory_id: 'fac-003', production_lines: ['Line A', 'Line B'] },
];

factories.forEach((f) => {
  f.departments = departments.filter((d) => d.factory_id === f.id);
});

// ── Users ─────────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: 'usr-001', name: 'Sarah Mitchell', email: 'sarah.mitchell@smartmaint.com', role: 'super_admin', role_name: 'Super Admin', avatar_color: '#1f5cf5', last_active: daysAgo(0) },
  { id: 'usr-002', name: 'Robert Chen', email: 'robert.chen@smartmaint.com', role: 'factory_manager', role_name: 'Factory Manager', avatar_color: '#059669', factory_id: 'fac-001', last_active: daysAgo(0) },
  { id: 'usr-003', name: 'Hans Mueller', email: 'hans.mueller@smartmaint.com', role: 'factory_manager', role_name: 'Factory Manager', avatar_color: '#d97706', factory_id: 'fac-002', last_active: daysAgo(1) },
  { id: 'usr-004', name: 'James Patterson', email: 'james.patterson@smartmaint.com', role: 'maintenance_manager', role_name: 'Maintenance Manager', avatar_color: '#dc2626', factory_id: 'fac-001', last_active: daysAgo(0) },
  { id: 'usr-005', name: 'Maria Garcia', email: 'maria.garcia@smartmaint.com', role: 'maintenance_manager', role_name: 'Maintenance Manager', avatar_color: '#7c3aed', factory_id: 'fac-002', last_active: daysAgo(0) },
  { id: 'usr-006', name: 'David Kim', email: 'david.kim@smartmaint.com', role: 'maintenance_engineer', role_name: 'Maintenance Engineer', avatar_color: '#0891b2', factory_id: 'fac-001', last_active: daysAgo(0) },
  { id: 'usr-007', name: 'Lisa Anderson', email: 'lisa.anderson@smartmaint.com', role: 'maintenance_engineer', role_name: 'Maintenance Engineer', avatar_color: '#be185d', factory_id: 'fac-001', last_active: daysAgo(2) },
  { id: 'usr-008', name: 'Klaus Weber', email: 'klaus.weber@smartmaint.com', role: 'maintenance_engineer', role_name: 'Maintenance Engineer', avatar_color: '#0369a1', factory_id: 'fac-002', last_active: daysAgo(0) },
  { id: 'usr-009', name: 'Yuki Tanaka', email: 'yuki.tanaka@smartmaint.com', role: 'maintenance_engineer', role_name: 'Maintenance Engineer', avatar_color: '#15803d', factory_id: 'fac-003', last_active: daysAgo(1) },
  { id: 'usr-010', name: 'Michael Brown', email: 'michael.brown@smartmaint.com', role: 'inventory_manager', role_name: 'Inventory Manager', avatar_color: '#9333ea', factory_id: 'fac-001', last_active: daysAgo(0) },
  { id: 'usr-011', name: 'Emma Schmidt', email: 'emma.schmidt@smartmaint.com', role: 'inventory_manager', role_name: 'Inventory Manager', avatar_color: '#e11d48', factory_id: 'fac-002', last_active: daysAgo(0) },
  { id: 'usr-012', name: 'Daniel Foster', email: 'daniel.foster@smartmaint.com', role: 'procurement_officer', role_name: 'Procurement Officer', avatar_color: '#0d9488', last_active: daysAgo(0) },
  { id: 'usr-013', name: 'Jennifer Walsh', email: 'jennifer.walsh@smartmaint.com', role: 'procurement_officer', role_name: 'Procurement Officer', avatar_color: '#ca8a04', last_active: daysAgo(1) },
  { id: 'usr-014', name: 'Bosch Industrial', email: 'sales@bosch-industrial.com', role: 'supplier', role_name: 'Supplier', avatar_color: '#475569', last_active: daysAgo(3) },
  { id: 'usr-015', name: 'SKF Bearings', email: 'orders@skf.com', role: 'supplier', role_name: 'Supplier', avatar_color: '#64748b', last_active: daysAgo(5) },
];

// ── Machine Components ────────────────────────────────────────────────────
const componentTemplates: Omit<MachineComponent, 'id'>[] = [
  { name: 'Main Drive Motor', part_number: 'MTR-2200', category: 'electrical', current_status: 'ok', expected_life_hours: 20000 },
  { name: 'Hydraulic Pump', part_number: 'HYP-1500', category: 'hydraulic', current_status: 'ok', expected_life_hours: 15000 },
  { name: 'Spindle Bearing Set', part_number: 'BRG-008', category: 'mechanical', current_status: 'warning', expected_life_hours: 12000 },
  { name: 'Servo Controller', part_number: 'SVC-300', category: 'electronic', current_status: 'ok', expected_life_hours: 25000 },
  { name: 'Pneumatic Cylinder', part_number: 'PNC-450', category: 'pneumatic', current_status: 'ok', expected_life_hours: 18000 },
  { name: 'Coolant Pump', part_number: 'CLP-200', category: 'mechanical', current_status: 'critical', expected_life_hours: 8000 },
  { name: 'PLC Module', part_number: 'PLC-900', category: 'electronic', current_status: 'ok', expected_life_hours: 30000 },
  { name: 'Gearbox Assembly', part_number: 'GBX-500', category: 'mechanical', current_status: 'ok', expected_life_hours: 22000 },
  { name: 'Linear Guide Rail', part_number: 'LGR-120', category: 'mechanical', current_status: 'warning', expected_life_hours: 16000 },
  { name: 'Safety Light Curtain', part_number: 'SLC-100', category: 'safety', current_status: 'ok', expected_life_hours: 50000 },
  { name: 'VFD Drive', part_number: 'VFD-750', category: 'electrical', current_status: 'ok', expected_life_hours: 20000 },
  { name: 'Lubrication Unit', part_number: 'LUB-050', category: 'lubricant', current_status: 'ok', expected_life_hours: 10000 },
];

function genComponents(machineIdx: number): MachineComponent[] {
  const count = randInt(5, 9);
  const selected = pickN(componentTemplates, count);
  return selected.map((c, i) => ({
    ...c,
    id: `cmp-${machineIdx}-${i}`,
    last_replaced: daysAgo(randInt(30, 800)),
    current_status: rand() > 0.75 ? (rand() > 0.5 ? 'warning' : 'critical') : 'ok',
  }));
}

// ── Machines ───────────────────────────────────────────────────────────────
const machineTypes = ['CNC Milling Center', 'Robotic Welder', 'Conveyor System', 'Hydraulic Press', 'Injection Molder', 'Laser Cutter', 'Assembly Robot', 'Stamping Press', 'Paint Robot', 'Testing Station'];
const manufacturers = ['Siemens', 'Bosch Rexroth', 'Mitsubishi Electric', 'Fanuc', 'ABB', 'Kuka', 'DMG Mori', 'Trumpf', 'Yaskawa', 'Okuma'];
const machineNames: Record<string, string[]> = {
  'CNC Milling Center': ['DMC-630 V', 'VMC-1000', 'NXV-700A'],
  'Robotic Welder': ['KR-210 R2700', 'ARC-1500', 'MA-1440'],
  'Conveyor System': ['CVX-2000', 'BeltPro-500', 'RollerCon-300'],
  'Hydraulic Press': ['HPS-400', 'PressMax-800', 'HPU-250'],
  'Injection Molder': ['IM-300T', 'EngelVictory-200', 'Arburg-470'],
  'Laser Cutter': ['TruLaser-3030', 'LC-3015', 'Bystronic-3015'],
  'Assembly Robot': ['IRB-6700', 'M-710ic', 'RS-010N'],
  'Stamping Press': ['SP-600', 'StampPro-400', 'SPS-800'],
  'Paint Robot': ['PR-200', 'PaintMate-10', 'EPX-1250'],
  'Testing Station': ['TS-500', 'TestPro-200', 'TS-1000'],
};

const statuses: MachineStatus[] = ['operational', 'operational', 'operational', 'operational', 'maintenance', 'breakdown', 'idle'];
const criticalities: CriticalityLevel[] = ['critical', 'high', 'medium', 'low'];

export const machines: Machine[] = [];
let machineCounter = 0;
factories.forEach((factory) => {
  const facDepts = departments.filter((d) => d.factory_id === factory.id);
  facDepts.forEach((dept) => {
    const machineCount = randInt(3, 6);
    for (let i = 0; i < machineCount; i++) {
      machineCounter++;
      const type = pick(machineTypes);
      const manufacturer = pick(manufacturers);
      const model = pick(machineNames[type] || [type.split(' ')[0] + '-100']);
      const status = pick(statuses);
      const operating_hours = randInt(2000, 45000);
      const total_downtime_hours = randInt(8, 520);
      const failure_count = randInt(0, 6);
      const mtbf = failure_count > 0 ? Math.round(operating_hours / failure_count) : randInt(8000, 20000);
      const mttr = randInt(2, 48);
      const health_score = status === 'breakdown' ? randInt(15, 45) : status === 'maintenance' ? randInt(50, 75) : randInt(65, 98);
      const risk_level = health_score >= 80 ? 'low' : health_score >= 60 ? 'medium' : health_score >= 40 ? 'high' : 'critical';

      machines.push({
        id: `mch-${String(machineCounter).padStart(3, '0')}`,
        machine_id: `M-${String(machineCounter).padStart(4, '0')}`,
        name: `${model} #${machineCounter}`,
        factory_id: factory.id,
        factory_name: factory.name,
        department_id: dept.id,
        department_name: dept.name,
        production_line: pick(dept.production_lines),
        type,
        manufacturer,
        model,
        serial_number: `SN${randInt(100000, 999999)}`,
        installation_date: daysAgo(randInt(180, 3600)),
        criticality: pick(criticalities),
        status,
        operating_hours,
        total_downtime_hours,
        health_score,
        risk_level,
        last_maintenance: daysAgo(randInt(5, 120)),
        next_maintenance: daysFromNow(randInt(-10, 30)),
        components: genComponents(machineCounter),
        mtbf_hours: mtbf,
        mttr_hours: mttr,
        failure_count_30d: randInt(0, 3),
      });
    }
  });
});

// ── Warehouses ──────────────────────────────────────────────────────────────
export const warehouses: Warehouse[] = [
  { id: 'wh-001', name: 'Central Warehouse Detroit', location: 'Detroit, MI', factory_id: 'fac-001', capacity: 50000, utilized: 38500, manager: 'Michael Brown' },
  { id: 'wh-002', name: 'Stuttgart Parts Depot', location: 'Stuttgart, DE', factory_id: 'fac-002', capacity: 40000, utilized: 31200, manager: 'Emma Schmidt' },
  { id: 'wh-003', name: 'Osaka Component Store', location: 'Osaka, JP', factory_id: 'fac-003', capacity: 30000, utilized: 22800, manager: 'Yuki Tanaka' },
  { id: 'wh-004', name: 'Overflow Storage Detroit', location: 'Detroit, MI', factory_id: 'fac-001', capacity: 20000, utilized: 8200, manager: 'Michael Brown' },
];

// ── Suppliers ───────────────────────────────────────────────────────────────
export const suppliers: Supplier[] = [
  { id: 'sup-001', name: 'Bosch Industrial Supply', contact_person: 'Markus Bauer', email: 'sales@bosch-industrial.com', phone: '+49 711 400 0', address: 'Stuttgart, Germany', rating: 4.8, status: 'preferred', lead_time_days: 7, on_time_delivery_rate: 96, quality_rate: 99, parts_supplied: 142, total_orders: 318, total_value: 2840000, established: '2010-01-15' },
  { id: 'sup-002', name: 'SKF Bearing Co.', contact_person: 'Erik Lindqvist', email: 'orders@skf.com', phone: '+46 31 337 0', address: 'Gothenburg, Sweden', rating: 4.6, status: 'active', lead_time_days: 10, on_time_delivery_rate: 92, quality_rate: 97, parts_supplied: 89, total_orders: 215, total_value: 1450000, established: '2012-06-01' },
  { id: 'sup-003', name: 'Siemens Automation', contact_person: 'Thomas Wagner', email: 'parts@siemens-auto.com', phone: '+49 89 636 0', address: 'Munich, Germany', rating: 4.9, status: 'preferred', lead_time_days: 5, on_time_delivery_rate: 98, quality_rate: 99, parts_supplied: 76, total_orders: 402, total_value: 3650000, established: '2008-03-20' },
  { id: 'sup-004', name: 'Parker Hannifin', contact_person: 'Jennifer Park', email: 'hydraulics@parker.com', phone: '+1 216 896 3000', address: 'Cleveland, OH, USA', rating: 4.3, status: 'active', lead_time_days: 14, on_time_delivery_rate: 88, quality_rate: 95, parts_supplied: 54, total_orders: 167, total_value: 890000, established: '2015-09-10' },
  { id: 'sup-005', name: 'SMC Pneumatics', contact_person: 'Hiroshi Sato', email: 'orders@smc-pneumatics.com', phone: '+81 3 5207 8100', address: 'Tokyo, Japan', rating: 4.5, status: 'active', lead_time_days: 12, on_time_delivery_rate: 90, quality_rate: 96, parts_supplied: 67, total_orders: 198, total_value: 1120000, established: '2013-04-05' },
  { id: 'sup-006', name: 'Omron Electronics', contact_person: 'Chen Wei', email: 'supply@omron-electronics.com', phone: '+86 755 8373 8888', address: 'Shenzhen, China', rating: 3.9, status: 'active', lead_time_days: 21, on_time_delivery_rate: 82, quality_rate: 91, parts_supplied: 43, total_orders: 134, total_value: 560000, established: '2017-11-12' },
  { id: 'sup-007', name: 'ABB Robotics Parts', contact_person: 'Anna Bergstrom', email: 'parts@abb-robotics.com', phone: '+41 43 317 7111', address: 'Zurich, Switzerland', rating: 4.7, status: 'preferred', lead_time_days: 8, on_time_delivery_rate: 95, quality_rate: 98, parts_supplied: 38, total_orders: 156, total_value: 1980000, established: '2011-02-18' },
  { id: 'sup-008', name: 'DiscountParts Inc.', contact_person: 'Tom Harris', email: 'sales@discountparts.com', phone: '+1 312 555 0144', address: 'Chicago, IL, USA', rating: 2.8, status: 'blacklisted', lead_time_days: 30, on_time_delivery_rate: 65, quality_rate: 78, parts_supplied: 12, total_orders: 45, total_value: 89000, established: '2019-08-01' },
];

// ── Spare Parts ─────────────────────────────────────────────────────────────
const partCategories: PartCategory[] = ['mechanical', 'electrical', 'hydraulic', 'pneumatic', 'electronic', 'consumable', 'lubricant', 'safety'];
const partNames: Record<PartCategory, string[]> = {
  mechanical: ['Precision Bearing Set', 'Spindle Assembly', 'Gearbox Unit', 'Linear Guide Rail', 'Coupling Set', 'Drive Shaft', 'Ball Screw', 'Linear Actuator'],
  electrical: ['Main Drive Motor 15kW', 'Servo Motor 7.5kW', 'VFD Drive 22kW', 'Power Supply Unit 24V', 'Contactor 40A', 'Circuit Breaker 63A', 'Motor Starter', 'Transformer 5kVA'],
  hydraulic: ['Hydraulic Pump A10VSO', 'Hydraulic Valve 4WE6', 'Hydraulic Cylinder 100mm', 'Pressure Relief Valve', 'Hydraulic Hose 1/2"', 'Accumulator 10L', 'Flow Control Valve', 'Check Valve'],
  pneumatic: ['Pneumatic Cylinder 50mm', 'Solenoid Valve 1/4"', 'Air Filter Regulator', 'Pneumatic Fitting Set', 'Silencer M5', 'Pneumatic Hose 8mm', 'Pressure Switch', 'Quick Connect Coupling'],
  electronic: ['PLC CPU Module', 'Servo Controller 3kW', 'HMI Touch Panel 7"', 'I/O Module 16DI', 'Communication Module', 'Encoder Cable 5m', 'Safety Relay', 'Signal Converter'],
  consumable: ['Cutting Tool Set HSS', 'Welding Wire 1.2mm', 'Lubricant Grease 1kg', 'Sandpaper Belt 100grit', 'Coolant Concentrate 20L', 'Cleaning Solvent 5L', 'Adhesive 50ml', 'Protective Film'],
  lubricant: ['Hydraulic Oil ISO 46 20L', 'Gear Oil 220 20L', 'Way Lube 68 5L', 'Grease NLGI-2 1kg', 'Cutting Fluid 10L', 'Compressor Oil 20L', 'Chain Lube 5L', 'Anti-seize Compound'],
  safety: ['Safety Light Curtain 300mm', 'Emergency Stop Button', 'Safety Door Switch', 'Pressure Mat 600x400', 'Safety Relay Module', 'Warning Light Amber', 'Lockout Tagout Kit', 'Guard Interlock'],
};

export const spareParts: SparePart[] = [];
let partCounter = 0;
suppliers.forEach((supplier) => {
  if (supplier.status === 'blacklisted') return;
  const partCount = randInt(8, 16);
  for (let i = 0; i < partCount; i++) {
    partCounter++;
    const category = pick(partCategories);
    const name = pick(partNames[category]);
    const min_stock = randInt(5, 30);
    const max_stock = min_stock * randInt(3, 6);
    const reorder_point = min_stock + randInt(5, 15);
    const current_stock = randInt(0, max_stock);
    const reserved_stock = randInt(0, Math.floor(current_stock * 0.3));
    const warehouse = pick(warehouses);
    const movement = rand() > 0.65 ? 'fast' : rand() > 0.4 ? 'medium' : 'slow';
    const monthlyConsumption = Array.from({ length: 12 }, () => randInt(0, movement === 'fast' ? 80 : movement === 'medium' ? 30 : 10));
    const stock_status =
      current_stock === 0 ? 'out_of_stock' :
      current_stock <= min_stock ? 'critical' :
      current_stock <= reorder_point ? 'low_stock' :
      current_stock > max_stock * 1.2 ? 'overstock' : 'in_stock';

    spareParts.push({
      id: `prt-${String(partCounter).padStart(3, '0')}`,
      part_number: `${category.substring(0, 3).toUpperCase()}-${String(partCounter).padStart(4, '0')}`,
      name,
      category,
      description: `${name} — compatible with industrial machinery. OEM-grade quality.`,
      compatible_machines: pickN(machines, randInt(2, 6)).map((m) => m.machine_id),
      current_stock,
      reserved_stock,
      min_stock,
      max_stock,
      reorder_point,
      unit_cost: randFloat(5, 3500, 2),
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.name,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      lead_time_days: supplier.lead_time_days,
      last_restocked: daysAgo(randInt(1, 60)),
      batch_number: `B${randInt(20240000, 20249999)}`,
      movement_class: movement,
      monthly_consumption: monthlyConsumption,
      stock_status,
    });
  }
});

// ── Maintenance Schedules ───────────────────────────────────────────────────
const maintenanceTypes: MaintenanceType[] = ['preventive', 'preventive', 'preventive', 'corrective', 'predictive', 'inspection'];
const priorities: MaintenancePriority[] = ['low', 'medium', 'high', 'urgent'];
const maintenanceStatuses: MaintenanceStatus[] = ['scheduled', 'scheduled', 'in_progress', 'completed', 'completed', 'overdue'];
const technicians = users.filter((u) => u.role === 'maintenance_engineer');
const checklistTemplates = [
  ['Inspect drive belts for wear', 'Check oil levels', 'Test emergency stops', 'Calibrate sensors', 'Clean filters'],
  ['Lubricate all moving parts', 'Check hydraulic pressure', 'Inspect electrical connections', 'Test safety circuits', 'Verify alignment'],
  ['Check bearing temperature', 'Inspect coolant system', 'Test PLC programs', 'Clean optical sensors', 'Check pneumatic seals'],
  ['Verify spindle runout', 'Inspect way covers', 'Check lubrication system', 'Test axis movement', 'Inspect cable carriers'],
];

export const maintenanceSchedules: MaintenanceSchedule[] = [];
machines.forEach((machine, idx) => {
  const scheduleCount = randInt(2, 5);
  for (let i = 0; i < scheduleCount; i++) {
    const type = pick(maintenanceTypes);
    const status = pick(maintenanceStatuses);
    const tech = pick(technicians);
    const offset = randInt(-25, 35);
    const scheduledDate = daysFromNow(offset);
    const isCompleted = status === 'completed';
    const checklistItems = pick(checklistTemplates);
    const estHours = randFloat(2, 16, 1);

    maintenanceSchedules.push({
      id: `sch-${String(idx * 5 + i + 1).padStart(4, '0')}`,
      machine_id: machine.id,
      machine_name: machine.name,
      machine_id_code: machine.machine_id,
      type,
      priority: pick(priorities),
      status,
      scheduled_date: scheduledDate,
      completed_date: isCompleted ? daysAgo(randInt(1, 30)) : undefined,
      assigned_technician: tech.name,
      technician_id: tech.id,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} maintenance for ${machine.name} — ${machine.type}`,
      checklist: checklistItems.map((task, ci) => ({ id: `chk-${idx}-${i}-${ci}`, task, completed: isCompleted || rand() > 0.5 })),
      estimated_hours: estHours,
      actual_hours: isCompleted ? randFloat(estHours * 0.8, estHours * 1.3, 1) : undefined,
      cost: randFloat(200, 8000, 2),
      recurring: type === 'preventive',
      interval_days: type === 'preventive' ? pick([7, 14, 30, 60, 90, 180]) : 0,
      factory_id: machine.factory_id,
      factory_name: machine.factory_name,
    });
  }
});

// ── Breakdowns ──────────────────────────────────────────────────────────────
const breakdownStatuses: BreakdownStatus[] = ['reported', 'diagnosing', 'in_repair', 'resolved', 'resolved', 'closed'];
const severities: BreakdownSeverity[] = ['minor', 'major', 'severe', 'critical'];
const symptomsList = [
  'Unusual vibration detected on spindle axis',
  'Hydraulic pressure drop below threshold',
  'Motor overheating — temperature exceeded 85°C',
  'PLC communication error on axis 3',
  'Pneumatic cylinder failed to extend',
  'Bearing noise increasing — abnormal sound',
  'Coolant leak detected under machine base',
  'Servo drive fault code E-7301',
  'Encoder signal loss on rotary axis',
  'Emergency stop circuit intermittent failure',
];
const rootCauses = [
  'Bearing wear due to insufficient lubrication',
  'Hydraulic seal degradation from age',
  'Motor winding insulation breakdown',
  'PLC firmware bug in motion control module',
  'Pneumatic seal failure from contamination',
  'Bearing race spalling — end of service life',
  'Coolant pump impeller erosion',
  'Servo drive power stage failure',
  'Encoder cable chafing at cable carrier',
  'Safety relay contact oxidation',
];
const correctiveActions = [
  'Replaced bearing set and re-lubricated assembly',
  'Replaced hydraulic seals and flushed system',
  'Rewound motor and replaced insulation',
  'Updated PLC firmware to v4.2.1',
  'Replaced pneumatic cylinder and installed filter',
  'Replaced bearing set and adjusted preload',
  'Replaced coolant pump and sealed connections',
  'Replaced servo drive unit',
  'Replaced encoder cable and secured routing',
  'Replaced safety relay and cleaned contacts',
];

export const breakdowns: Breakdown[] = [];
machines.forEach((machine, idx) => {
  const breakdownCount = randInt(0, 4);
  for (let i = 0; i < breakdownCount; i++) {
    const status = pick(breakdownStatuses);
    const isResolved = status === 'resolved' || status === 'closed';
    const symptomIdx = randInt(0, symptomsList.length - 1);
    const partsReplaced: WorkOrderPart[] = rand() > 0.4 ? pickN(spareParts, randInt(1, 3)).map((p) => ({
      part_id: p.id, part_name: p.name, part_number: p.part_number, quantity: randInt(1, 4), unit_cost: p.unit_cost,
    })) : [];

    breakdowns.push({
      id: `brk-${String(idx * 4 + i + 1).padStart(4, '0')}`,
      breakdown_id: `BD-${String(idx * 4 + i + 1).padStart(5, '0')}`,
      machine_id: machine.id,
      machine_name: machine.name,
      machine_id_code: machine.machine_id,
      factory_id: machine.factory_id,
      factory_name: machine.factory_name,
      reported_date: daysAgo(randInt(1, 180)),
      reported_by: pick(users.filter((u) => u.role === 'maintenance_engineer' || u.role === 'maintenance_manager')).name,
      assigned_technician: pick(technicians).name,
      status,
      severity: pick(severities),
      symptoms: symptomsList[symptomIdx],
      root_cause: isResolved ? rootCauses[symptomIdx] : undefined,
      corrective_action: isResolved ? correctiveActions[symptomIdx] : undefined,
      downtime_hours: randFloat(1, 72, 1),
      parts_replaced: partsReplaced,
      repair_cost: randFloat(200, 15000, 2),
      resolved_date: isResolved ? daysAgo(randInt(0, 30)) : undefined,
      priority: pick(priorities),
    });
  }
});

// ── Inventory Transactions ─────────────────────────────────────────────────
const transactionTypes: TransactionType[] = ['stock_in', 'stock_out', 'stock_out', 'reserved', 'returned', 'adjusted'];
export const inventoryTransactions: InventoryTransaction[] = [];
spareParts.forEach((part, idx) => {
  const txCount = randInt(5, 15);
  for (let i = 0; i < txCount; i++) {
    const type = pick(transactionTypes);
    const qty = randInt(1, 50);
    inventoryTransactions.push({
      id: `txn-${String(idx * 15 + i + 1).padStart(5, '0')}`,
      part_id: part.id,
      part_name: part.name,
      part_number: part.part_number,
      type,
      quantity: qty,
      balance_after: Math.max(0, part.current_stock + randInt(-20, 20)),
      reference: type === 'stock_out' ? `WO-${randInt(10000, 19999)}` : type === 'stock_in' ? `PO-${randInt(20000, 29999)}` : `ADJ-${randInt(30000, 39999)}`,
      reference_type: type === 'stock_out' ? 'work_order' : type === 'stock_in' ? 'purchase_order' : type === 'returned' ? 'return' : 'adjustment',
      performed_by: pick(users.filter((u) => u.role === 'inventory_manager' || u.role === 'maintenance_engineer')).name,
      warehouse_id: part.warehouse_id,
      timestamp: daysAgo(randInt(0, 90)) + `T${String(randInt(8, 17)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:00Z`,
      notes: type === 'adjusted' ? 'Cycle count adjustment' : undefined,
    });
  }
});

// ── Purchase Requests & Orders ──────────────────────────────────────────────
const requestStatuses: PurchaseRequestStatus[] = ['draft', 'pending_approval', 'pending_approval', 'approved', 'approved', 'rejected', 'ordered', 'received', 'cancelled'];
const orderStatuses: PurchaseOrderStatus[] = ['draft', 'sent', 'confirmed', 'confirmed', 'partial', 'received', 'received', 'cancelled'];

export const purchaseRequests: PurchaseRequest[] = [];
export const purchaseOrders: PurchaseOrder[] = [];
for (let i = 0; i < 25; i++) {
  const items = pickN(spareParts, randInt(1, 4)).map((p) => ({
    part_id: p.id, part_name: p.name, part_number: p.part_number, quantity: randInt(5, 50), unit_cost: p.unit_cost, total: 0,
  }));
  items.forEach((it) => (it.total = it.quantity * it.unit_cost));
  const totalValue = items.reduce((s, it) => s + it.total, 0);
  const status = pick(requestStatuses);
  purchaseRequests.push({
    id: `prq-${String(i + 1).padStart(3, '0')}`,
    request_number: `PR-${String(i + 1001).padStart(5, '0')}`,
    requested_by: pick(users.filter((u) => u.role === 'procurement_officer' || u.role === 'inventory_manager')).name,
    department: pick(departments).name,
    status,
    priority: pick(priorities),
    items,
    total_value: parseFloat(totalValue.toFixed(2)),
    created_date: daysAgo(randInt(1, 60)),
    required_date: daysFromNow(randInt(5, 45)),
    approved_by: status === 'approved' || status === 'ordered' || status === 'received' ? 'Sarah Mitchell' : undefined,
    justification: pick(['Stock below reorder point', 'Scheduled maintenance requirement', 'Breakdown repair — urgent need', 'New machine setup', 'Routine restock']),
  });
}

for (let i = 0; i < 20; i++) {
  const supplier = pick(suppliers.filter((s) => s.status !== 'blacklisted'));
  const items = pickN(spareParts, randInt(1, 5)).map((p) => ({
    part_id: p.id, part_name: p.name, part_number: p.part_number, quantity: randInt(10, 100), unit_cost: p.unit_cost, total: 0,
  }));
  items.forEach((it) => (it.total = it.quantity * it.unit_cost));
  const totalValue = items.reduce((s, it) => s + it.total, 0);
  const status = pick(orderStatuses);
  const expectedDelivery = daysFromNow(randInt(-5, 30));
  purchaseOrders.push({
    id: `po-${String(i + 1).padStart(3, '0')}`,
    order_number: `PO-${String(i + 2001).padStart(5, '0')}`,
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    status,
    items,
    total_value: parseFloat(totalValue.toFixed(2)),
    order_date: daysAgo(randInt(1, 45)),
    expected_delivery: expectedDelivery,
    actual_delivery: status === 'received' ? daysAgo(randInt(0, 10)) : undefined,
    created_by: pick(users.filter((u) => u.role === 'procurement_officer')).name,
    delivery_progress: status === 'received' ? 100 : status === 'partial' ? randInt(30, 70) : status === 'confirmed' ? 15 : status === 'sent' ? 5 : 0,
  });
}

// ── Warranties ──────────────────────────────────────────────────────────────
const warrantyProviders = ['Siemens Service', 'Bosch Rexroth Care', 'Mitsubishi Electric Warranty', 'ABB Service Pro', 'Fanuc Maintenance Plus', 'Kuka Care Plus'];
const warrantyCoverages = ['Full parts and labor', 'Parts only', 'Parts and labor with on-site support', 'Extended coverage with preventive maintenance'];
export const warranties: Warranty[] = [];
machines.forEach((machine, idx) => {
  if (rand() > 0.3) {
    const startOffset = randInt(-1000, -100);
    const durationDays = randInt(365, 2555);
    const start = daysAgo(-startOffset);
    const end = daysFromNow(startOffset + durationDays);
    const daysRemaining = Math.ceil((new Date(end).getTime() - today.getTime()) / 86400000);
    const status: WarrantyStatus = daysRemaining < 0 ? 'expired' : daysRemaining < 60 ? 'expiring_soon' : 'active';

    warranties.push({
      id: `war-${String(idx + 1).padStart(3, '0')}`,
      warranty_number: `WR-${String(idx + 3001).padStart(5, '0')}`,
      machine_id: machine.id,
      machine_name: machine.name,
      machine_id_code: machine.machine_id,
      type: 'machine',
      start_date: start,
      end_date: end,
      status,
      provider: pick(warrantyProviders),
      coverage: pick(warrantyCoverages),
      terms: 'Standard manufacturer warranty terms and conditions apply. Covers manufacturing defects and component failures under normal use.',
      days_remaining: daysRemaining,
    });
  }
  // Component warranties
  machine.components.filter((c) => rand() > 0.6).forEach((comp, ci) => {
    const startOffset = randInt(-800, -50);
    const durationDays = randInt(180, 1095);
    const start = daysAgo(-startOffset);
    const end = daysFromNow(startOffset + durationDays);
    const daysRemaining = Math.ceil((new Date(end).getTime() - today.getTime()) / 86400000);
    const status: WarrantyStatus = daysRemaining < 0 ? 'expired' : daysRemaining < 60 ? 'expiring_soon' : 'active';

    warranties.push({
      id: `warc-${String(idx).padStart(3, '0')}-${ci}`,
      warranty_number: `WRC-${String(idx * 10 + ci + 4001).padStart(5, '0')}`,
      machine_id: machine.id,
      machine_name: machine.name,
      machine_id_code: machine.machine_id,
      component_id: comp.id,
      component_name: comp.name,
      type: 'component',
      start_date: start,
      end_date: end,
      status,
      provider: pick(warrantyProviders),
      coverage: pick(warrantyCoverages),
      terms: 'Component-level warranty covering defects and premature failure.',
      days_remaining: daysRemaining,
    });
  });
});

// ── Service Records ────────────────────────────────────────────────────────
export const serviceRecords: ServiceRecord[] = [];
machines.forEach((machine, idx) => {
  const recordCount = randInt(3, 12);
  for (let i = 0; i < recordCount; i++) {
    const partsReplaced: WorkOrderPart[] = rand() > 0.5 ? pickN(spareParts, randInt(1, 3)).map((p) => ({
      part_id: p.id, part_name: p.name, part_number: p.part_number, quantity: randInt(1, 3), unit_cost: p.unit_cost,
    })) : [];
    const laborHours = randFloat(1, 24, 1);
    const laborCost = laborHours * randFloat(45, 95, 2);
    const partsCost = partsReplaced.reduce((s, p) => s + p.quantity * p.unit_cost, 0);
    const serviceDate = daysAgo(randInt(5, 365));
    const type = pick(maintenanceTypes);

    serviceRecords.push({
      id: `srv-${String(idx * 12 + i + 1).padStart(5, '0')}`,
      service_id: `SR-${String(idx * 12 + i + 5001).padStart(5, '0')}`,
      machine_id: machine.id,
      machine_name: machine.name,
      machine_id_code: machine.machine_id,
      date: serviceDate,
      technician: pick(technicians).name,
      type,
      problem_description: pick(symptomsList),
      diagnosis: pick(rootCauses),
      parts_replaced: partsReplaced,
      labor_hours: laborHours,
      labor_cost: parseFloat(laborCost.toFixed(2)),
      parts_cost: parseFloat(partsCost.toFixed(2)),
      total_cost: parseFloat((laborCost + partsCost).toFixed(2)),
      downtime_hours: randFloat(0.5, 48, 1),
      root_cause: pick(rootCauses),
      corrective_action: pick(correctiveActions),
      attachments: rand() > 0.7 ? ['service_report.pdf', 'photos.zip'] : [],
      factory_id: machine.factory_id,
    });
  }
});

// ── Notifications ───────────────────────────────────────────────────────────
export const notifications: AppNotification[] = [
  { id: 'ntf-001', type: 'maintenance_overdue', priority: 'critical', title: 'Overdue Maintenance Alert', message: 'M-0003 (DMC-630 V #3) has overdue preventive maintenance — 5 days past due', module: 'Maintenance', timestamp: daysAgo(0) + 'T08:30:00Z', read: false, action_url: '/maintenance', target_roles: ['super_admin', 'factory_manager', 'maintenance_manager'] },
  { id: 'ntf-002', type: 'critical_stock', priority: 'critical', title: 'Critical Stock Shortage', message: 'Spindle Bearing Set (MEC-0003) is at 2 units — below minimum of 10', module: 'Inventory', timestamp: daysAgo(0) + 'T07:15:00Z', read: false, action_url: '/inventory', target_roles: ['super_admin', 'inventory_manager', 'procurement_officer'] },
  { id: 'ntf-003', type: 'breakdown', priority: 'critical', title: 'Machine Breakdown Reported', message: 'M-0007 (KR-210 R2700 #7) reported with severe vibration — repair in progress', module: 'Breakdowns', timestamp: daysAgo(0) + 'T06:45:00Z', read: false, action_url: '/breakdowns', target_roles: ['super_admin', 'factory_manager', 'maintenance_manager', 'maintenance_engineer'] },
  { id: 'ntf-004', type: 'warranty_expiry', priority: 'warning', title: 'Warranty Expiring Soon', message: 'M-0012 (HPS-400 #12) warranty expires in 28 days', module: 'Warranty', timestamp: daysAgo(1) + 'T14:20:00Z', read: false, action_url: '/warranty', target_roles: ['super_admin', 'factory_manager', 'maintenance_manager'] },
  { id: 'ntf-005', type: 'maintenance_due', priority: 'warning', title: 'Upcoming Maintenance Reminder', message: '5 machines have preventive maintenance scheduled within 7 days', module: 'Maintenance', timestamp: daysAgo(1) + 'T09:00:00Z', read: true, action_url: '/maintenance', target_roles: ['super_admin', 'factory_manager', 'maintenance_manager', 'maintenance_engineer'] },
  { id: 'ntf-006', type: 'low_stock', priority: 'warning', title: 'Low Stock Alert', message: 'Hydraulic Pump A10VSO (HYD-0012) is at 15 units — below reorder point of 25', module: 'Inventory', timestamp: daysAgo(1) + 'T11:30:00Z', read: false, action_url: '/inventory', target_roles: ['super_admin', 'inventory_manager', 'procurement_officer'] },
  { id: 'ntf-007', type: 'purchase_approval', priority: 'info', title: 'Purchase Request Awaiting Approval', message: 'PR-1003 for $24,500 requires manager approval', module: 'Procurement', timestamp: daysAgo(2) + 'T10:15:00Z', read: false, action_url: '/suppliers', target_roles: ['super_admin', 'factory_manager', 'procurement_officer'] },
  { id: 'ntf-008', type: 'supplier_delay', priority: 'warning', title: 'Delayed Supplier Delivery', message: 'PO-2007 from Omron Electronics is 3 days past expected delivery', module: 'Procurement', timestamp: daysAgo(2) + 'T15:45:00Z', read: true, action_url: '/suppliers', target_roles: ['super_admin', 'procurement_officer'] },
  { id: 'ntf-009', type: 'critical_stock', priority: 'critical', title: 'Stock-Out Risk Predicted', message: 'Forecast predicts Main Drive Motor 15kW (ELE-0008) will stock out in 12 days', module: 'Forecasting', timestamp: daysAgo(3) + 'T08:00:00Z', read: true, action_url: '/forecasting', target_roles: ['super_admin', 'inventory_manager', 'procurement_officer'] },
  { id: 'ntf-010', type: 'system', priority: 'info', title: 'System Update', message: 'Predictive maintenance engine recalculated health scores for all machines', module: 'System', timestamp: daysAgo(3) + 'T03:00:00Z', read: true, target_roles: ['super_admin', 'factory_manager', 'maintenance_manager'] },
];

// ── Audit Logs ──────────────────────────────────────────────────────────────
const auditActions = [
  { action: 'CREATE', module: 'Machines' },
  { action: 'UPDATE', module: 'Machines' },
  { action: 'CREATE', module: 'Maintenance' },
  { action: 'UPDATE', module: 'Maintenance' },
  { action: 'COMPLETE', module: 'Maintenance' },
  { action: 'CREATE', module: 'Breakdowns' },
  { action: 'UPDATE', module: 'Breakdowns' },
  { action: 'RESOLVE', module: 'Breakdowns' },
  { action: 'STOCK_OUT', module: 'Inventory' },
  { action: 'STOCK_IN', module: 'Inventory' },
  { action: 'ADJUST', module: 'Inventory' },
  { action: 'CREATE', module: 'Procurement' },
  { action: 'APPROVE', module: 'Procurement' },
  { action: 'REJECT', module: 'Procurement' },
  { action: 'CREATE', module: 'Warranty' },
  { action: 'CLAIM', module: 'Warranty' },
  { action: 'LOGIN', module: 'Auth' },
  { action: 'LOGOUT', module: 'Auth' },
  { action: 'UPDATE', module: 'Settings' },
];
const ipAddresses = ['192.168.1.10', '192.168.1.24', '10.0.0.45', '172.16.5.20', '192.168.2.33', '10.0.1.12'];
const devices = ['Chrome / Windows 11', 'Firefox / macOS 14', 'Edge / Windows 11', 'Safari / iOS 17', 'Chrome / Android 14', 'Chrome / macOS 14'];

export const auditLogs: AuditLog[] = [];
for (let i = 0; i < 60; i++) {
  const user = pick(users);
  const auditAction = pick(auditActions);
  auditLogs.push({
    id: `aud-${String(i + 1).padStart(4, '0')}`,
    user: user.name,
    user_role: user.role,
    action: auditAction.action,
    module: auditAction.module,
    entity_id: auditAction.module !== 'Auth' && auditAction.module !== 'Settings' ? `ENT-${randInt(1000, 9999)}` : undefined,
    entity_type: auditAction.module !== 'Auth' && auditAction.module !== 'Settings' ? auditAction.module.toLowerCase().replace(/s$/, '') : undefined,
    previous_value: auditAction.action === 'UPDATE' ? 'Status: scheduled' : undefined,
    updated_value: auditAction.action === 'UPDATE' ? 'Status: in_progress' : undefined,
    timestamp: daysAgo(randInt(0, 14)) + `T${String(randInt(6, 20)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}Z`,
    ip_address: pick(ipAddresses),
    device: pick(devices),
  });
}
auditLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

// ── KPI Computation ─────────────────────────────────────────────────────────
export const kpiData: KPIData = {
  total_machines: machines.length,
  operational_machines: machines.filter((m) => m.status === 'operational').length,
  machines_under_maintenance: machines.filter((m) => m.status === 'maintenance').length,
  breakdown_count: machines.filter((m) => m.status === 'breakdown').length,
  total_downtime_hours: parseFloat(machines.reduce((s, m) => s + m.total_downtime_hours, 0).toFixed(0)),
  upcoming_maintenance: maintenanceSchedules.filter((s) => s.status === 'scheduled' && new Date(s.scheduled_date) >= today).length,
  overdue_maintenance: maintenanceSchedules.filter((s) => s.status === 'overdue').length,
  low_stock_parts: spareParts.filter((p) => p.stock_status === 'low_stock').length,
  critical_stock_parts: spareParts.filter((p) => p.stock_status === 'critical' || p.stock_status === 'out_of_stock').length,
  maintenance_cost_ytd: parseFloat(serviceRecords.reduce((s, r) => s + r.total_cost, 0).toFixed(0)),
  inventory_value: parseFloat(spareParts.reduce((s, p) => s + p.current_stock * p.unit_cost, 0).toFixed(0)),
  avg_supplier_performance: parseFloat((suppliers.filter((s) => s.status !== 'blacklisted').reduce((s, sup) => s + sup.on_time_delivery_rate, 0) / suppliers.filter((s) => s.status !== 'blacklisted').length).toFixed(1)),
  open_purchase_orders: purchaseOrders.filter((p) => p.status === 'sent' || p.status === 'confirmed' || p.status === 'partial').length,
  active_warranties: warranties.filter((w) => w.status === 'active').length,
  expiring_warranties: warranties.filter((w) => w.status === 'expiring_soon').length,
};

// ── Forecast Data ───────────────────────────────────────────────────────────
export const forecastData: ForecastData[] = spareParts.map((part) => {
  const avgMonthly = part.monthly_consumption.reduce((s, v) => s + v, 0) / 12;
  const forecasted = Array.from({ length: 3 }, () => Math.max(0, Math.round(avgMonthly * (0.8 + rand() * 0.5))));
  const safetyStock = Math.ceil(avgMonthly * (part.lead_time_days / 30) * 1.5);
  const recommendedReorder = Math.max(0, Math.ceil((avgMonthly * 3 + safetyStock) - part.current_stock));
  const stockOutRisk = part.current_stock <= part.min_stock ? randInt(60, 95) : part.current_stock <= part.reorder_point ? randInt(25, 60) : randInt(0, 25);
  const excess = part.current_stock > part.max_stock * 1.2;

  return {
    part_id: part.id,
    part_name: part.name,
    part_number: part.part_number,
    historical_consumption: part.monthly_consumption,
    forecasted_consumption: forecasted,
    recommended_reorder_qty: recommendedReorder,
    safety_stock: safetyStock,
    stock_out_risk: stockOutRisk,
    excess_inventory: excess,
    movement_class: part.movement_class,
    current_stock: part.current_stock,
  };
});

// ── Chart Data ──────────────────────────────────────────────────────────────
export const downtimeTrendData = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(today);
  month.setMonth(month.getMonth() - (11 - i));
  return {
    month: month.toLocaleString('en', { month: 'short' }),
    planned: randInt(20, 80),
    unplanned: randInt(10, 60),
  };
});

export const maintenanceCostTrendData = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(today);
  month.setMonth(month.getMonth() - (11 - i));
  return {
    month: month.toLocaleString('en', { month: 'short' }),
    preventive: randInt(5000, 25000),
    corrective: randInt(8000, 45000),
  };
});

export const breakdownFrequencyData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  breakdowns: randInt(1, 12),
}));

export const sparePartConsumptionData = spareParts
  .filter((p) => p.movement_class === 'fast')
  .slice(0, 8)
  .map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    consumed: p.monthly_consumption.reduce((s, v) => s + v, 0),
  }))
  .sort((a, b) => b.consumed - a.consumed);

export const inventoryTurnoverData = Array.from({ length: 6 }, (_, i) => ({
  quarter: `Q${i + 1}`,
  turnover: randFloat(2, 8, 1),
}));

export const preventiveVsCorrectiveData = [
  { name: 'Preventive', value: maintenanceSchedules.filter((s) => s.type === 'preventive').length, color: '#3479ff' },
  { name: 'Corrective', value: maintenanceSchedules.filter((s) => s.type === 'corrective').length, color: '#f59e0b' },
  { name: 'Predictive', value: maintenanceSchedules.filter((s) => s.type === 'predictive').length, color: '#10b981' },
  { name: 'Inspection', value: maintenanceSchedules.filter((s) => s.type === 'inspection').length, color: '#8b5cf6' },
];

export const machineReliabilityData = machines
  .slice(0, 10)
  .map((m) => ({
    name: m.machine_id,
    reliability: m.health_score,
    mtbf: m.mtbf_hours,
  }))
  .sort((a, b) => b.reliability - a.reliability);
