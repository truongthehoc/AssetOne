import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import {
  Menu,
  Sun,
  Moon,
  Search,
  User,
  LogOut,
  Building2,
  ChevronDown,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/dashboard':
        return 'Tổng Quan Hệ Thống & Tài Sản';
      case '/operations/assets':
        return 'Danh Mục & Thông Số Cấu Hình Tài Sản';
      case '/operations/discovery':
        return 'Hàng Đợi Thiết Bị Chờ Duyệt (Agent LAN)';
      case '/operations/maintenance':
        return 'Kế Hoạch & Lịch Sử Bảo Trì Tài Sản';
      case '/operations/audit':
        return 'Đợt Kiểm Kê & Quét Mã QR Đối Soát';
      case '/operations/drift-alerts':
        return 'Cảnh Báo Biến Động Cấu Hình & Linh Kiện';
      case '/master-data/departments':
        return 'Danh Mục Phòng Ban';
      case '/master-data/positions':
        return 'Danh Mục Chức Danh / Chức Vụ';
      case '/master-data/employees':
        return 'Danh Sách Nhân Viên & Phân Bổ Phòng Ban';
      case '/master-data/asset-categories':
        return 'Phân Loại Tài Sản & Vòng Đời Thiết Bị';
      case '/master-data/warehouses':
        return 'Danh Mục Kho Lưu Trữ & Thủ Kho';
      case '/master-data/vendors':
        return 'Danh Mục Nhà Cung Cấp & Hợp Đồng';
      case '/admin/profile':
        return 'Thông Tin Tài Khoản & Đổi Mật Khẩu';
      case '/admin/users':
        return 'Quản Trị Người Dùng & Phân Quyền';
      case '/admin/settings':
        return 'Cấu Hình Đơn Vị & Thông Tin Phần Mềm';
      case '/admin/backup-settings':
        return 'Sao Lưu, Khôi Phục & Cài Đặt Tham Số';
      default:
        return 'Quản Lý Tài Sản Thông Tin';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs font-sans">
      {/* Left side: Hamburger on mobile + Dynamic Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white tracking-tight line-clamp-1">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Right side: Global Search + Theme Toggle + User Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input Box */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tài sản, thiết bị, serial..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-amber-50 dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700 text-amber-600 dark:text-amber-400 hover:scale-105 transition shadow-xs"
          title={theme === 'light' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng'}
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* User Profile Header */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-coral-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-coral-400/30">
              {user?.employee?.fullName
                ? user.employee.fullName.charAt(0).toUpperCase()
                : user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {user?.employee?.fullName || user?.username}
              </div>
              <div className="text-[10px] font-bold text-coral-600 dark:text-coral-400 uppercase tracking-wider">
                {user?.role || 'ADMIN'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-sm font-bold text-slate-800 dark:text-white">
                    {user?.employee?.fullName || user?.username}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {user?.employee?.email || `${user?.username}@assetone.local`}
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-coral-50 dark:bg-coral-950 text-coral-700 dark:text-coral-300 border border-coral-200 dark:border-coral-800">
                      <Shield className="w-3 h-3" />
                      <span>{user?.role || 'ADMIN'}</span>
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/admin/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Thông tin tài khoản & Đổi mật khẩu</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Cấu hình đơn vị & Phần mềm</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full text-left transition font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất khỏi hệ thống</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
