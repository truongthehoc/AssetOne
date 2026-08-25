import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  Search,
  RefreshCw,
  MapPin,
  User,
} from 'lucide-react';

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  location: string | null;
  managerEmployeeId: string | null;
  description: string | null;
  managerEmployee?: { id: string; fullName: string; employeeCode: string } | null;
  _count?: { assets: number };
}

export const WarehousesPage: React.FC = () => {
  const { success, error } = useToast();
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null);
  const [deleteConfirmWarehouse, setDeleteConfirmWarehouse] = useState<WarehouseItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    managerEmployeeId: '',
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [whRes, empRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/employees'),
      ]);
      if (whRes.data.success) setWarehouses(whRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách kho.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingWarehouse(null);
    setFormData({
      code: '',
      name: '',
      location: '',
      managerEmployeeId: employees[0]?.id || '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (wh: WarehouseItem) => {
    setEditingWarehouse(wh);
    setFormData({
      code: wh.code,
      name: wh.name,
      location: wh.location || '',
      managerEmployeeId: wh.managerEmployeeId || '',
      description: wh.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingWarehouse) {
        await api.put(`/warehouses/${editingWarehouse.id}`, formData);
        success(`Cập nhật kho lưu trữ '${formData.name}' thành công!`);
      } else {
        await api.post('/warehouses', formData);
        success(`Tạo mới kho lưu trữ '${formData.name}' thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu kho lưu trữ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmWarehouse) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/warehouses/${deleteConfirmWarehouse.id}`);
      success(res.data.message || 'Xóa kho thành công!');
      setDeleteConfirmWarehouse(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể xóa kho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      (w.location && w.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-900">
            <WarehouseIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Danh Mục Kho Lưu Trữ</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý các điểm lưu trữ thiết bị, gán nhân sự thủ kho phụ trách
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm kho mới</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm kho lưu trữ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Tổng số: <span className="font-bold text-slate-800 dark:text-white">{filteredList.length}</span> kho lưu trữ
        </div>
      </div>

      {/* Data Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-36">Mã kho</th>
                <th className="py-3.5 px-4">Tên kho lưu trữ</th>
                <th className="py-3.5 px-4">Vị trí / Địa điểm</th>
                <th className="py-3.5 px-4">Thủ kho phụ trách</th>
                <th className="py-3.5 px-4 text-center w-32">Số tài sản</th>
                <th className="py-3.5 px-4">Mô tả</th>
                <th className="py-3.5 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải dữ liệu kho...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy kho lưu trữ nào.
                  </td>
                </tr>
              ) : (
                filteredList.map((wh) => (
                  <tr
                    key={wh.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-coral-700 dark:text-coral-400">
                      {wh.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {wh.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{wh.location || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{wh.managerEmployee?.fullName || 'Chưa chỉ định'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-coral-50 dark:bg-coral-950 text-coral-700 dark:text-coral-300 font-bold text-xs border border-coral-100 dark:border-coral-900">
                        <Boxes className="w-3.5 h-3.5 text-coral-600 dark:text-coral-400" />
                        <span>{wh._count?.assets || 0}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {wh.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(wh)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmWarehouse(wh)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Slide-over Drawer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? `Chỉnh sửa kho: ${editingWarehouse.name}` : 'Thêm mới kho lưu trữ'}
        subtitle="Quản lý địa điểm lưu trữ trang thiết bị và thủ kho phụ trách"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mã kho <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập mã kho"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên kho lưu trữ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên kho"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Địa điểm / Vị trí
              </label>
              <input
                type="text"
                placeholder="Nhập địa điểm / vị trí kho"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nhân viên phụ trách / Thủ kho
              </label>
              <select
                value={formData.managerEmployeeId}
                onChange={(e) => setFormData({ ...formData, managerEmployeeId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              >
                <option value="">-- Chưa chỉ định thủ kho --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mô tả
              </label>
              <textarea
                rows={4}
                placeholder="Nhập mô tả kho lưu trữ"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

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
              {isSubmitting ? 'Đang lưu...' : editingWarehouse ? 'Lưu thay đổi' : 'Tạo mới kho lưu trữ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmWarehouse}
        onClose={() => setDeleteConfirmWarehouse(null)}
        onConfirm={handleDelete}
        title={`Xóa kho: ${deleteConfirmWarehouse?.name}`}
        message={`Bạn có chắc muốn xóa kho '${deleteConfirmWarehouse?.name}'? Hệ thống sẽ ngăn chặn nếu còn tài sản đang nằm trong kho này.`}
        confirmText="Xóa kho"
        isLoading={isSubmitting}
      />
    </div>
  );
};
