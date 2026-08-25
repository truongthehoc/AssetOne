// Shared interfaces and types for AssetOne

export type UserRole = 'ADMIN' | 'IT_STAFF' | 'EXECUTIVE' | 'VIEWER';
export type EmployeeStatus = 'ACTIVE' | 'PROBATION' | 'RESIGNED';
export type AssetStatus = 'IN_USE' | 'IN_STORAGE' | 'MAINTENANCE' | 'LIQUIDATED';
export type DeviceStatus = 'UNASSIGNED' | 'ASSIGNED' | 'IGNORED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HandoverType = 'ALLOCATE' | 'RECALL' | 'REPAIR_SEND' | 'REPAIR_RECEIVE' | 'LIQUIDATE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AuditSessionStatus = 'ACTIVE' | 'COMPLETED';
export type AuditMatchStatus = 'MATCHED' | 'WRONG_LOCATION' | 'WRONG_USER' | 'NOT_FOUND';

export interface IDepartment {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  level: number;
  orderIndex: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: IDepartment | null;
  children?: IDepartment[];
  _count?: {
    employees: number;
    children: number;
    assets: number;
  };
}

export interface IPosition {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
}

export interface IEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  status: EmployeeStatus;
  departmentId: string;
  positionId: string;
  joinDate: string | null;
  createdAt: string;
  updatedAt: string;
  department?: IDepartment;
  position?: IPosition;
  user?: IUser | null;
}

export interface IUser {
  id: string;
  username: string;
  role: UserRole;
  employeeId: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: IEmployee | null;
}

export interface IAssetCategory {
  id: string;
  code: string;
  name: string;
  prefixCode: string;
  icon: string | null;
  expectedLifespanMonths: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface IWarehouse {
  id: string;
  code: string;
  name: string;
  location: string | null;
  managerEmployeeId: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  managerEmployee?: IEmployee | null;
  _count?: {
    assets: number;
  };
}

export interface IVendor {
  id: string;
  code: string;
  name: string;
  taxCode: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface IOrganizationSettings {
  name: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface ISoftwareSettings {
  name: string;
  version: string;
  vendor: string;
  copyright: string;
  supportPhone: string;
  supportEmail: string;
  releaseDate: string;
}

export interface IScanParameters {
  ipRanges: string;
  agentHeartbeatMinutes: number;
  offlineThresholdDays: number;
  autoDiscoverEnabled: boolean;
}

export interface IAlertThresholds {
  diskWarningPercent: number;
  diskCriticalPercent: number;
  alertRamChange: boolean;
  alertDiskChange: boolean;
  alertGpuChange: boolean;
  alertMotherboardChange: boolean;
  alertUnapprovedSoftware: boolean;
}

export interface IBackupSchedule {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string; // e.g. "02:00"
  keepBackupsCount: number;
}

export interface IBackupLog {
  id: string;
  filename: string;
  fileSize: number;
  type: 'AUTO' | 'MANUAL';
  status: 'SUCCESS' | 'FAILED';
  notes: string | null;
  createdAt: string;
}
