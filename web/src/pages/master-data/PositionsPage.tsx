import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  RefreshCw,
} from 'lucide-react';

interface PositionItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  _count?: {
    employees: number;
  };
}

export const PositionsPage: React.FC = () => {
  const { success, error } = useToast();
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<PositionItem | null>(null);
  const [deleteConfirmPos, setDeleteConfirmPos] = useState<PositionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/positions');
      if (res.data.success) {
        setPositions(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách chức vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPos(null);
    setFormData({ code: '', name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pos: PositionItem) => {
    setEditingPos(pos);
    setFormData({
      code: pos.code,
      name: pos.name,
      description: pos.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingPos) {
        await api.put(`/positions/${editingPos.id}`, formData);
        success(`Cập nhật chức vụ '${formData.name}' thành công!`);
      } else {
        await api.post('/positions', formData);
        success(`Tạo mới chức vụ '${formData.name}' thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu chức vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPos) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/positions/${deleteConfirmPos.id}`);
      success(res.data.message || 'Xóa chức vụ thành công!');
      setDeleteConfirmPos(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể xóa chức vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = positions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Danh Mục Chức Danh / Chức Vụ</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý danh sách các vị trí chức danh công việc trong đơn vị
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
            <span>Thêm chức danh mới</span>
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm chức danh / chức vụ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Tổng số: <span className="font-bold text-slate-800 dark:text-white">{filteredList.length}</span> chức danh
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-40">Mã chức vụ</th>
                <th className="py-3.5 px-4">Tên chức danh / Chức vụ</th>
                <th className="py-3.5 px-4 text-center w-36">Số nhân viên</th>
                <th className="py-3.5 px-4">Mô tả</th>
                <th className="py-3.5 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Đang tải danh sách chức vụ...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy chức danh nào.
                  </td>
                </tr>
              ) : (
                filteredList.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3.5 px-4 font-mono font-bold text-coral-700 dark:text-coral-400">{pos.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">{pos.name}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-100 dark:border-emerald-900">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{pos._count?.employees || 0}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-sm truncate">{pos.description || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(pos)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmPos(pos)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                          title="Xóa chức danh"
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
        title={editingPos ? `Chỉnh sửa chức vụ: ${editingPos.name}` : 'Thêm mới chức vụ'}
        subtitle="Điền thông tin vị trí chức danh công việc"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mã chức vụ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập mã chức vụ"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên chức vụ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên chức vụ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mô tả
              </label>
              <textarea
                rows={4}
                placeholder="Nhập mô tả chức vụ"
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
              {isSubmitting ? 'Đang lưu...' : editingPos ? 'Lưu thay đổi' : 'Tạo mới chức vụ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmPos}
        onClose={() => setDeleteConfirmPos(null)}
        onConfirm={handleDelete}
        title={`Xóa chức vụ: ${deleteConfirmPos?.name}`}
        message={`Bạn có chắc muốn xóa chức vụ '${deleteConfirmPos?.name}'? Hệ thống sẽ ngăn chặn việc xóa nếu vẫn còn nhân viên đang giữ chức vụ này.`}
        confirmText="Xóa chức vụ"
        isLoading={isSubmitting}
      />
    </div>
  );
};
