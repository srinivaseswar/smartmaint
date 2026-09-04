// Domain types for the Smart Industrial Maintenance & Spare Parts Management System

export type RoleKey =
  | 'super_admin'
  | 'factory_manager'
  | 'maintenance_manager'
  | 'maintenance_engineer'
  | 'inventory_manager'
  | 'procurement_officer'
  | 'supplier';

export interface Role {
  key: RoleKey;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  role_name: string;
  avatar_color: string;
  factory_id?: string;
  phone?: string;
  last_active: string;
}

export type CriticalityLevel = 'critical' | 'high' | 'medium' | 'low';
export type MachineStatus = 'operational' | 'maintenance' | 'breakdown' | 'idle' | 'decommissioned';

export interface Factory {
  id: string;
  name: string;
  location: string;
  country: string;
  departments: Department[];
  manager: string;
  established: string;
}

export interface Department {
  id: string;
  name: string;
  factory_id: string;
  production_lines: string[];
}

export interface MachineComponent {
  id: string;
  name: string;
  part_number: string;
  category: string;
  current_status: 'ok' | 'warning' | 'critical' | 'replaced';
  last_replaced?: string;
  expected_life_hours?: number;
}

export interface Machine {
  id: string;
  machine_id: string;
  name: string;
  factory_id: string;
  factory_name: string;
  department_id: string;
  department_name: string;
  production_line: string;
  type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  installation_date: string;
  criticality: CriticalityLevel;
  status: MachineStatus;
  operating_hours: number;
  total_downtime_hours: number;
  health_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_maintenance: string;
  next_maintenance: string;
  components: MachineComponent[];
  mtbf_hours: number;
  mttr_hours: number;
  failure_count_30d: number;
}

export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'inspection';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface MaintenanceChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface MaintenanceSchedule {
  id: string;
  machine_id: string;
  machine_name: string;
  machine_id_code: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  scheduled_date: string;
  completed_date?: string;
  assigned_technician: string;
  technician_id: string;
  description: string;
  checklist: MaintenanceChecklistItem[];
  estimated_hours: number;
  actual_hours?: number;
  cost: number;
  recurring: boolean;
  interval_days: number;
  factory_id: string;
  factory_name: string;
}

export interface MaintenanceWorkOrder extends MaintenanceSchedule {
  parts_used: WorkOrderPart[];
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  notes?: string;
}

export interface WorkOrderPart {
  part_id: string;
  part_name: string;
  part_number: string;
  quantity: number;
  unit_cost: number;
}

export type BreakdownStatus = 'reported' | 'diagnosing' | 'in_repair' | 'resolved' | 'closed';
export type BreakdownSeverity = 'minor' | 'major' | 'severe' | 'critical';

export interface Breakdown {
  id: string;
  breakdown_id: string;
  machine_id: string;
  machine_name: string;
  machine_id_code: string;
  factory_id: string;
  factory_name: string;
  reported_date: string;
  reported_by: string;
  assigned_technician: string;
  status: BreakdownStatus;
  severity: BreakdownSeverity;
  symptoms: string;
  root_cause?: string;
  corrective_action?: string;
  downtime_hours: number;
  parts_replaced: WorkOrderPart[];
  repair_cost: number;
  resolved_date?: string;
  priority: MaintenancePriority;
}

export type PartCategory = 'mechanical' | 'electrical' | 'hydraulic' | 'pneumatic' | 'electronic' | 'consumable' | 'lubricant' | 'safety';

export interface SparePart {
  id: string;
  part_number: string;
  name: string;
  category: PartCategory;
  description: string;
  compatible_machines: string[];
  current_stock: number;
  reserved_stock: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  unit_cost: number;
  warehouse_id: string;
  warehouse_name: string;
  supplier_id: string;
  supplier_name: string;
  lead_time_days: number;
  last_restocked: string;
  batch_number?: string;
  movement_class: 'fast' | 'medium' | 'slow';
  monthly_consumption: number[];
  stock_status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock' | 'overstock';
}

export type TransactionType = 'stock_in' | 'stock_out' | 'reserved' | 'returned' | 'adjusted';

export interface InventoryTransaction {
  id: string;
  part_id: string;
  part_name: string;
  part_number: string;
  type: TransactionType;
  quantity: number;
  balance_after: number;
  reference: string;
  reference_type: 'work_order' | 'purchase_order' | 'adjustment' | 'return';
  performed_by: string;
  warehouse_id: string;
  timestamp: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  factory_id: string;
  capacity: number;
  utilized: number;
  manager: string;
}

export type SupplierStatus = 'active' | 'inactive' | 'preferred' | 'blacklisted';

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: SupplierStatus;
  lead_time_days: number;
  on_time_delivery_rate: number;
  quality_rate: number;
  parts_supplied: number;
  total_orders: number;
  total_value: number;
  established: string;
}

export type PurchaseRequestStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'received' | 'cancelled';
export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';

export interface PurchaseRequest {
  id: string;
  request_number: string;
  requested_by: string;
  department: string;
  status: PurchaseRequestStatus;
  priority: MaintenancePriority;
  items: PurchaseItem[];
  total_value: number;
  created_date: string;
  required_date: string;
  approved_by?: string;
  notes?: string;
  justification: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  status: PurchaseOrderStatus;
  items: PurchaseItem[];
  total_value: number;
  order_date: string;
  expected_delivery: string;
  actual_delivery?: string;
  created_by: string;
  delivery_progress: number;
}

export interface PurchaseItem {
  part_id: string;
  part_name: string;
  part_number: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'claimed';

export interface Warranty {
  id: string;
  warranty_number: string;
  machine_id: string;
  machine_name: string;
  machine_id_code: string;
  component_id?: string;
  component_name?: string;
  type: 'machine' | 'component';
  start_date: string;
  end_date: string;
  status: WarrantyStatus;
  provider: string;
  coverage: string;
  terms: string;
  days_remaining: number;
}

export interface ServiceRecord {
  id: string;
  service_id: string;
  machine_id: string;
  machine_name: string;
  machine_id_code: string;
  date: string;
  technician: string;
  type: MaintenanceType;
  problem_description: string;
  diagnosis: string;
  parts_replaced: WorkOrderPart[];
  labor_hours: number;
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  downtime_hours: number;
  root_cause?: string;
  corrective_action?: string;
  attachments: string[];
  factory_id: string;
}

export type NotificationType =
  | 'maintenance_due'
  | 'maintenance_overdue'
  | 'breakdown'
  | 'low_stock'
  | 'critical_stock'
  | 'warranty_expiry'
  | 'purchase_approval'
  | 'supplier_delay'
  | 'system';

export type NotificationPriority = 'info' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  module: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  target_roles: RoleKey[];
}

export interface AuditLog {
  id: string;
  user: string;
  user_role: RoleKey;
  action: string;
  module: string;
  entity_id?: string;
  entity_type?: string;
  previous_value?: string;
  updated_value?: string;
  timestamp: string;
  ip_address: string;
  device: string;
}

export interface KPIData {
  total_machines: number;
  operational_machines: number;
  machines_under_maintenance: number;
  breakdown_count: number;
  total_downtime_hours: number;
  upcoming_maintenance: number;
  overdue_maintenance: number;
  low_stock_parts: number;
  critical_stock_parts: number;
  maintenance_cost_ytd: number;
  inventory_value: number;
  avg_supplier_performance: number;
  open_purchase_orders: number;
  active_warranties: number;
  expiring_warranties: number;
}

export interface ForecastData {
  part_id: string;
  part_name: string;
  part_number: string;
  historical_consumption: number[];
  forecasted_consumption: number[];
  recommended_reorder_qty: number;
  safety_stock: number;
  stock_out_risk: number;
  excess_inventory: boolean;
  movement_class: 'fast' | 'medium' | 'slow';
  current_stock: number;
}
