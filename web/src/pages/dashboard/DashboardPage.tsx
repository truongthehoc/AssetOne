import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Boxes,
  Network,
  Users,
  Award,
  Layers,
  Warehouse,
  Truck,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  Database,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    departmentsCount: 0,
    employeesCount: 0,
    positionsCount: 0,
    categoriesCount: 0,
    warehousesCount: 0,
    vendorsCount: 0,
    usersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [deptRes, empRes, posRes, catRes, whRes, venRes, userRes] = await Promise.all([
          api.get('/departments'),
          api.get('/employees'),
          api.get('/positions'),
          api.get('/asset-categories'),
          api.get('/warehouses'),
          api.get('/vendors'),
          api.get('/users'),
        ]);

        setStats({
          departmentsCount: deptRes.data.data?.length || 0,
          employeesCount: empRes.data.data?.length || 0,
          positionsCount: posRes.data.data?.length || 0,
          categoriesCount: catRes.data.data?.length || 0,
          warehousesCount: whRes.data.data?.length || 0,
          vendorsCount: venRes.data.data?.length || 0,
          usersCount: userRes.data.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const masterDataCards = [
    {
      title: 'Phòng ban',
      count: stats.departmentsCount,
      unit: 'phòng ban',
      desc: 'Cơ cấu tổ chức phòng ban và đơn vị trực thuộc',
      icon: Network,
      path: '/master-data/departments',
      color: 'bg-coral-50 text-coral-600 border-coral-100 dark:bg-coral-950/40 dark:text-coral-400 dark:border-coral-900',
    },
    {
      title: 'Chức danh / Chức vụ',
      count: stats.positionsCount,
      unit: 'chức danh',
      desc: 'Danh mục vị trí chức danh và vai trò chuyên môn',
      icon: Award,
      path: '/master-data/positions',
      color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    },
    {
      title: 'Nhân sự & Nhân viên',
      count: stats.employeesCount,
      unit: 'nhân viên',
      desc: 'Hồ sơ nhân sự gán với Phòng ban và Chức vụ',
      icon: Users,
      path: '/master-data/employees',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    },
    {
      title: 'Loại tài sản',
      count: stats.categoriesCount,
      unit: 'loại thiết bị',
      desc: 'Phân loại tài sản, tiền tố sinh mã và vòng đời',
      icon: Layers,
      path: '/master-data/asset-categories',
      color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
    },
    {
      title: 'Kho lưu trữ',
      count: stats.warehousesCount,
      unit: 'kho',
      desc: 'Kho chứa thiết bị và nhân sự thủ kho phụ trách',
      icon: Warehouse,
      path: '/master-data/warehouses',
      color: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
    },
    {
      title: 'Nhà cung cấp',
      count: stats.vendorsCount,
      unit: 'đối tác',
      desc: 'Nhà cung cấp máy tính, linh kiện và bảo hành',
      icon: Truck,
      path: '/master-data/vendors',
      color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-500/20 text-coral-300 text-xs font-semibold mb-3 border border-coral-500/30">
              <span className="w-2 h-2 rounded-full bg-coral-400 animate-pulse" />
              <span>AssetOne Enterprise v1.0.0</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Xin chào, {user?.employee?.fullName || user?.username}!
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              Hệ thống Quản lý Tài sản Thông tin & Endpoint Discovery đã sẵn sàng. Danh mục hệ thống và cơ chế bảo mật quan hệ dữ liệu đang hoạt động hoàn hảo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/settings"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition backdrop-blur-sm border border-white/10"
            >
              Cấu hình hệ thống
            </Link>
            <Link
              to="/admin/backup-settings"
              className="px-4 py-2.5 bg-coral-600 hover:bg-coral-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-coral-600/30"
            >
              Sao lưu & Tham số
            </Link>
          </div>
        </div>
      </div>

      {/* Master Data Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-coral-500" />
            <span>Danh mục Hệ thống (Master Data)</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Cơ sở dữ liệu nền tảng đã sẵn sàng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterDataCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.path}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-coral-200 dark:hover:border-coral-800 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-coral-500 transition" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{card.count}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.unit}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Admin Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User & Security card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 rounded-xl border border-coral-100 dark:border-coral-900">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quản trị Người dùng & Phân quyền</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tài khoản liên kết hồ sơ nhân sự</span>
                </div>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">{stats.usersCount} users</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Hệ thống hỗ trợ phân quyền vai trò (Admin, Cán bộ IT, Ban Lãnh đạo, Người xem) và liên kết 1-1 trực tiếp với Nhân viên để đồng bộ quyền hạn và phòng ban.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <span>Quản lý tài khoản người dùng</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Database & Backup status card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cơ sở Dữ liệu MySQL & Sao lưu</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Database Engine: MariaDB / MySQL 8.0</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Toàn vẹn khóa ngoại (Foreign Key Constraints), bảng cây phân cấp và các trường dữ liệu JSON cho phần cứng/ổ đĩa đã được cấu hình chặt chẽ.
            </p>
          </div>
          <Link
            to="/admin/backup-settings"
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <span>Cấu hình Sao lưu & Dải IP quét</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
