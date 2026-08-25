import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import {
  Boxes,
  CheckCircle2,
  UserCheck,
  Wrench,
  TrendingDown,
  Monitor,
  Laptop,
  Printer,
  Radio,
  Tv,
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  RefreshCw,
  HardDrive,
  Cpu,
  Building2,
  MapPin,
  FileText,
  User,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AssetItem {
  id: string;
  assetCode: string;
  name: string;
  categoryId: string;
  warehouseId: string | null;
  departmentId: string | null;
  assignedEmployeeId: string | null;
  vendorId: string | null;
  status: 'IN_USE' | 'IN_STORAGE' | 'MAINTENANCE' | 'LIQUIDATED';
  purchasePrice: number | null;
  purchaseDate: string | null;
  qrCodeToken: string;
  notes: string | null;
  category?: { id: string; name: string; prefixCode: string; icon: string };
  warehouse?: { id: string; name: string };
  department?: { id: string; name: string };
  assignedEmployee?: { id: string; fullName: string; employeeCode: string };
  vendor?: { id: string; name: string };
  hardwareSnapshots?: Array<{
    cpuInfo: any;
    ramSlots: any;
    storageDrives: any;
  }>;
}

export const AssetsPage: React.FC = () => {
  const { success, error } = useToast();
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<AssetItem | null>(null);
  const [viewingQrAsset, setViewingQrAsset] = useState<AssetItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    assetCode: '',
    name: '',
    categoryId: '',
    warehouseId: '',
    departmentId: '',
    assignedEmployeeId: '',
    vendorId: '',
    status: 'IN_STORAGE',
    purchasePrice: '',
    purchaseDate: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, deptRes, empRes, whRes, venRes] = await Promise.all([
        api.get('/asset-categories'),
        api.get('/departments'),
        api.get('/employees'),
        api.get('/warehouses'),
        api.get('/vendors'),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (whRes.data.success) setWarehouses(whRes.data.data);
      if (venRes.data.success) setVendors(venRes.data.data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    const prefix = categories[0]?.prefixCode || 'TS';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      assetCode: `${prefix}-${randomSuffix}`,
      name: '',
      categoryId: categories[0]?.id || '',
      warehouseId: warehouses[0]?.id || '',
      departmentId: '',
      assignedEmployeeId: '',
      vendorId: vendors[0]?.id || '',
      status: 'IN_STORAGE',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: AssetItem) => {
    setEditingAsset(asset);
    setFormData({
      assetCode: asset.assetCode,
      name: asset.name,
      categoryId: asset.categoryId,
      warehouseId: asset.warehouseId || '',
      departmentId: asset.departmentId || '',
      assignedEmployeeId: asset.assignedEmployeeId || '',
      vendorId: asset.vendorId || '',
      status: asset.status,
      purchasePrice: asset.purchasePrice ? String(asset.purchasePrice) : '',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      notes: asset.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleCategoryChange = (catId: string) => {
    const selectedCat = categories.find((c) => c.id === catId);
    const prefix = selectedCat?.prefixCode || 'TS';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      assetCode: !editingAsset ? `${prefix}-${randomSuffix}` : prev.assetCode,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      success(
        editingAsset
          ? `Cập nhật thông tin tài sản '${formData.assetCode}' thành công!`
          : `Thêm mới tài sản '${formData.assetCode}' vào kho thành công!`
      );
    }, 400);
  };

  // Status Counts
  const totalAssetsCount = assets.length;
  const readyCount = assets.filter((a) => a.status === 'IN_STORAGE').length;
  const inUseCount = assets.filter((a) => a.status === 'IN_USE').length;
  const maintenanceCount = assets.filter((a) => a.status === 'MAINTENANCE').length;
  const liquidatedCount = assets.filter((a) => a.status === 'LIQUIDATED').length;

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* 1. THỐNG KÊ THEO TRẠNG THÁI TÀI SẢN */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-coral-500"></span>
            <span>Thống Kê Theo Trạng Thái Tài Sản</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tổng cộng: <strong className="text-slate-800 dark:text-white">{totalAssetsCount}</strong> tài sản
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1 */}
          <div
            onClick={() => setStatusFilter('')}
            className={`cursor-pointer bg-gradient-to-br from-blue-50/80 to-blue-100/40 dark:from-blue-950/30 dark:to-slate-900 border rounded-2xl p-4 transition-all hover:shadow-md ${
              statusFilter === ''
                ? 'border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                : 'border-blue-200/80 dark:border-blue-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Tất Cả Tài Sản</span>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-950 dark:text-white mb-0.5">{totalAssetsCount}</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Toàn bộ kho quản lý</div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setStatusFilter('IN_STORAGE')}
            className={`cursor-pointer bg-gradient-to-br from-emerald-50/80 to-teal-100/40 dark:from-emerald-950/30 dark:to-slate-900 border rounded-2xl p-4 transition-all hover:shadow-md ${
              statusFilter === 'IN_STORAGE'
                ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                : 'border-emerald-200/80 dark:border-emerald-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Sẵn Sàng Cấp Phát</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-950 dark:text-white mb-0.5">{readyCount}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Sẵn sàng bàn giao</div>
          </div>

          {/* Card 3 (Coral Highlight) */}
          <div
            onClick={() => setStatusFilter('IN_USE')}
            className={`cursor-pointer bg-gradient-to-br from-coral-50/80 to-rose-100/40 dark:from-coral-950/30 dark:to-slate-900 border rounded-2xl p-4 transition-all hover:shadow-md ${
              statusFilter === 'IN_USE'
                ? 'border-coral-400 ring-2 ring-coral-400/20 shadow-xs'
                : 'border-coral-200/80 dark:border-coral-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-coral-900 dark:text-coral-200">Đang Sử Dụng</span>
              <div className="w-7 h-7 rounded-lg bg-coral-500 text-white flex items-center justify-center shadow-xs">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-coral-950 dark:text-white mb-0.5">{inUseCount}</div>
            <div className="text-[11px] text-coral-600 dark:text-coral-400 font-medium">Đã cấp phát cán bộ</div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => setStatusFilter('MAINTENANCE')}
            className={`cursor-pointer bg-gradient-to-br from-purple-50/80 to-indigo-100/40 dark:from-purple-950/30 dark:to-slate-900 border rounded-2xl p-4 transition-all hover:shadow-md ${
              statusFilter === 'MAINTENANCE'
                ? 'border-purple-400 ring-2 ring-purple-400/20 shadow-xs'
                : 'border-purple-200/80 dark:border-purple-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Đang Bảo Trì</span>
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-950 dark:text-white mb-0.5">{maintenanceCount}</div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Đang bảo dưỡng/sửa</div>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => setStatusFilter('LIQUIDATED')}
            className={`cursor-pointer bg-gradient-to-br from-amber-50/80 to-orange-100/40 dark:from-amber-950/30 dark:to-slate-900 border rounded-2xl p-4 transition-all hover:shadow-md ${
              statusFilter === 'LIQUIDATED'
                ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                : 'border-amber-200/80 dark:border-amber-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Chờ / Đã Thanh Lý</span>
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-950 dark:text-white mb-0.5">{liquidatedCount}</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Xuất hủy/thanh lý</div>
          </div>
        </div>
      </div>

      {/* 2. THỐNG KÊ THEO LOẠI THIẾT BỊ & DANH MỤC */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2.5">
          <span className="w-2 h-2 rounded-full bg-coral-500"></span>
          <span>Thống Kê Theo Loại Thiết Bị & Danh Mục</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div
            onClick={() => setCategoryFilter(categoryFilter === 'CAT_PC' ? '' : 'CAT_PC')}
            className={`cursor-pointer bg-white dark:bg-slate-900 p-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-sm ${
              categoryFilter === 'CAT_PC'
                ? 'border-coral-500 ring-2 ring-coral-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Máy Tính Để Bàn</div>
                <div className="text-[10px] text-slate-400">Desktop PC</div>
              </div>
            </div>
            <span className="text-sm font-black text-coral-600 dark:text-coral-400">0</span>
          </div>

          <div
            onClick={() => setCategoryFilter(categoryFilter === 'CAT_LAPTOP' ? '' : 'CAT_LAPTOP')}
            className={`cursor-pointer bg-white dark:bg-slate-900 p-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-sm ${
              categoryFilter === 'CAT_LAPTOP'
                ? 'border-coral-500 ring-2 ring-coral-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Máy Tính Xách Tay</div>
                <div className="text-[10px] text-slate-400">Laptop / Notebook</div>
              </div>
            </div>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">0</span>
          </div>

          <div
            onClick={() => setCategoryFilter(categoryFilter === 'CAT_PRINTER' ? '' : 'CAT_PRINTER')}
            className={`cursor-pointer bg-white dark:bg-slate-900 p-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-sm ${
              categoryFilter === 'CAT_PRINTER'
                ? 'border-coral-500 ring-2 ring-coral-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Máy In & Scanner</div>
                <div className="text-[10px] text-slate-400">Printer / Photo</div>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">0</span>
          </div>

          <div
            onClick={() => setCategoryFilter(categoryFilter === 'CAT_SERVER' ? '' : 'CAT_SERVER')}
            className={`cursor-pointer bg-white dark:bg-slate-900 p-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-sm ${
              categoryFilter === 'CAT_SERVER'
                ? 'border-coral-500 ring-2 ring-coral-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Thiết Bị Mạng & Server</div>
                <div className="text-[10px] text-slate-400">Router, Switch, Server</div>
              </div>
            </div>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">0</span>
          </div>

          <div
            onClick={() => setCategoryFilter(categoryFilter === 'CAT_MONITOR' ? '' : 'CAT_MONITOR')}
            className={`cursor-pointer bg-white dark:bg-slate-900 p-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-sm ${
              categoryFilter === 'CAT_MONITOR'
                ? 'border-coral-500 ring-2 ring-coral-500/20'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Màn Hình & Khác</div>
                <div className="text-[10px] text-slate-400">Monitors & Other</div>
              </div>
            </div>
            <span className="text-sm font-black text-purple-600 dark:text-purple-400">0</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ACTION TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tài sản, thiết bị, người sử dụng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-coral-600 hover:bg-coral-700 text-white rounded-full font-bold text-xs transition shadow-sm shadow-coral-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Tài Sản Thủ Công</span>
          </button>
        </div>
      </div>

      {/* 4. ASSET TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-36">MÃ TÀI SẢN / QR</th>
                <th className="py-3.5 px-4">TÊN MÁY & ĐỊA CHỈ IP</th>
                <th className="py-3.5 px-4">LOẠI TÀI SẢN</th>
                <th className="py-3.5 px-4">CẤU HÌNH (RAM/DISK/CPU)</th>
                <th className="py-3.5 px-4">BỘ PHẬN & NGƯỜI DÙNG</th>
                <th className="py-3.5 px-4">VỊ TRÍ</th>
                <th className="py-3.5 px-4 text-center w-32">TRẠNG THÁI</th>
                <th className="py-3.5 px-4 text-right w-28">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Chưa có tài sản nào trong danh mục
                      </span>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Bạn có thể thêm tài sản thủ công hoặc cài đặt AssetOne Agent để tự động quét và thu thập từ mạng LAN
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-coral-700 dark:text-coral-400">
                      {item.assetCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.category?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      Chưa gắn Agent
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.department?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.warehouse?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sẵn sàng
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer Add / Edit Asset */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? `Chỉnh sửa tài sản: ${editingAsset.assetCode}` : 'Thêm mới tài sản thủ công'}
        subtitle="Nhập thông số tài sản, phân loại, kho lưu trữ và nhà cung cấp"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loại tài sản <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.prefixCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã tài sản <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập mã tài sản"
                  value={formData.assetCode}
                  onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên tài sản / Model thiết bị <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên thiết bị / model"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kho lưu trữ ban đầu
                </label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="">-- Chưa nhập kho --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nhà cung cấp
                </label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end gap-3 sticky bottom-0 z-10 shadow-xs">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-coral-600 hover:bg-coral-700 rounded-xl transition shadow-md shadow-coral-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : editingAsset ? 'Lưu thay đổi' : 'Tạo mới tài sản'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
