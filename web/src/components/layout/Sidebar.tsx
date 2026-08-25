import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Boxes,
  Radio,
  Wrench,
  QrCode,
  Activity,
  Network,
  Award,
  Users,
  Layers,
  Warehouse,
  Truck,
  UserCheck,
  ShieldCheck,
  Settings,
  Database,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const isOperationsActive = location.pathname.startsWith('/operations');
  const isMasterDataActive = location.pathname.startsWith('/master-data');
  const isSystemAdminActive = location.pathname.startsWith('/admin');

  // Accordion state: auto expand the active section and collapse others
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    operations: isOperationsActive,
    masterData: isMasterDataActive,
    systemAdmin: isSystemAdminActive,
  });

  // When route changes, auto-open the active category and collapse the rest
  useEffect(() => {
    if (isOperationsActive) {
      setOpenSections({ operations: true, masterData: false, systemAdmin: false });
    } else if (isMasterDataActive) {
      setOpenSections({ operations: false, masterData: true, systemAdmin: false });
    } else if (isSystemAdminActive) {
      setOpenSections({ operations: false, masterData: false, systemAdmin: true });
    }
  }, [location.pathname]);

  const toggleSection = (key: 'operations' | 'masterData' | 'systemAdmin') => {
    setOpenSections((prev) => {
      const willOpen = !prev[key];
      if (willOpen) {
        // Accordion behavior: close other sections when opening one
        return {
          operations: key === 'operations',
          masterData: key === 'masterData',
          systemAdmin: key === 'systemAdmin',
        };
      } else {
        return { ...prev, [key]: false };
      }
    });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 dark:border-slate-800 shadow-sm ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-coral-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-coral-500/25">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Quản lý tài sản</span>
          </div>
          <span className="block text-[10px] uppercase font-bold text-coral-600 dark:text-coral-400 tracking-wider">
            AssetOne Management
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin">
        {/* 1. TỔNG QUAN */}
        <div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-coral-50 text-coral-800 border border-coral-200/80 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <LayoutGrid className="w-4 h-4 text-slate-500 group-hover:text-coral-600" />
            <span>Tổng Quan</span>
          </NavLink>
        </div>

        {/* 2. QUẢN LÝ VẬN HÀNH */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('operations')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider transition font-bold ${
              isOperationsActive
                ? 'text-coral-600 dark:text-coral-400 bg-coral-50/50 dark:bg-coral-950/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isOperationsActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
              <span>Quản Lý Vận Hành</span>
            </span>
            {openSections.operations ? (
              <ChevronDown className={`w-3.5 h-3.5 ${isOperationsActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 ${isOperationsActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
            )}
          </button>

          {openSections.operations && (
            <div className="space-y-0.5 pt-1 pl-1">
              <NavLink
                to="/operations/assets"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-4 h-4 text-slate-400" />
                  <span>Danh Mục Tài Sản</span>
                </div>
              </NavLink>

              <NavLink
                to="/operations/discovery"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-slate-400" />
                  <span>Thiết Bị Chờ Duyệt</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-coral-500 text-white rounded-full">
                  1
                </span>
              </NavLink>

              <NavLink
                to="/operations/maintenance"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Wrench className="w-4 h-4 text-slate-400" />
                <span>Bảo Trì Tài Sản</span>
              </NavLink>

              <NavLink
                to="/operations/audit"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <QrCode className="w-4 h-4 text-slate-400" />
                <span>Kiểm Kê Tài Sản</span>
              </NavLink>

              <NavLink
                to="/operations/drift-alerts"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Activity className="w-4 h-4 text-slate-400" />
                <span>Biến Động Cấu Hình</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* 3. DANH MỤC HỆ THỐNG */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('masterData')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider transition font-bold ${
              isMasterDataActive
                ? 'text-coral-600 dark:text-coral-400 bg-coral-50/50 dark:bg-coral-950/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Network className={`w-4 h-4 ${isMasterDataActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
              <span>Danh Mục Hệ Thống</span>
            </span>
            {openSections.masterData ? (
              <ChevronDown className={`w-3.5 h-3.5 ${isMasterDataActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 ${isMasterDataActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
            )}
          </button>

          {openSections.masterData && (
            <div className="space-y-0.5 pt-1 pl-1">
              <NavLink
                to="/master-data/departments"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Network className="w-4 h-4 text-slate-400" />
                <span>Phòng Ban</span>
              </NavLink>

              <NavLink
                to="/master-data/positions"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Award className="w-4 h-4 text-slate-400" />
                <span>Chức Danh / Chức Vụ</span>
              </NavLink>

              <NavLink
                to="/master-data/employees"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Nhân Viên</span>
              </NavLink>

              <NavLink
                to="/master-data/asset-categories"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Loại Tài Sản</span>
              </NavLink>

              <NavLink
                to="/master-data/warehouses"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Warehouse className="w-4 h-4 text-slate-400" />
                <span>Kho Lưu Trữ</span>
              </NavLink>

              <NavLink
                to="/master-data/vendors"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Truck className="w-4 h-4 text-slate-400" />
                <span>Nhà Cung Cấp</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* 4. QUẢN TRỊ HỆ THỐNG */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('systemAdmin')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider transition font-bold ${
              isSystemAdminActive
                ? 'text-coral-600 dark:text-coral-400 bg-coral-50/50 dark:bg-coral-950/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isSystemAdminActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
              <span>Quản Trị Hệ Thống</span>
            </span>
            {openSections.systemAdmin ? (
              <ChevronDown className={`w-3.5 h-3.5 ${isSystemAdminActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 ${isSystemAdminActive ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'}`} />
            )}
          </button>

          {openSections.systemAdmin && (
            <div className="space-y-0.5 pt-1 pl-1">
              <NavLink
                to="/admin/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Thông Tin Tài Khoản</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Người Dùng (Map NV)</span>
              </NavLink>

              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Cấu Hình Hệ Thống</span>
              </NavLink>

              <NavLink
                to="/admin/backup-settings"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-50 text-coral-800 border border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-800 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Database className="w-4 h-4 text-slate-400" />
                <span>Sao Lưu / Khôi Phục</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-[10px] font-semibold text-slate-400">
          AssetOne v1.0.0 Enterprise
        </div>
      </div>
    </aside>
  );
};
