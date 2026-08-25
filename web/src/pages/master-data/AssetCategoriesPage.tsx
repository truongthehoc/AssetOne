import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  Search,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  code: string;
  name: string;
  prefixCode: string;
  icon: string | null;
  expectedLifespanMonths: number;
  description: string | null;
  _count?: { assets: number };
}

export const AssetCategoriesPage: React.FC = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    prefixCode: 'ASSET',
    icon: 'Monitor',
    expectedLifespanMonths: 36,
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/asset-categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh mục loại tài sản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCat(null);
    setFormData({
      code: '',
      name: '',
      prefixCode: 'ASSET',
      icon: 'Monitor',
      expectedLifespanMonths: 36,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCat(cat);
    setFormData({
      code: cat.code,
      name: cat.name,
      prefixCode: cat.prefixCode,
      icon: cat.icon || 'Monitor',
      expectedLifespanMonths: cat.expectedLifespanMonths,
      description: cat.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingCat) {
        await api.put(`/asset-categories/${editingCat.id}`, formData);
        success(`Cập nhật loại tài sản '${formData.name}' thành công!`);
      } else {
        await api.post('/asset-categories', formData);
        success(`Tạo mới loại tài sản '${formData.name}' thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu loại tài sản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCat) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/asset-categories/${deleteConfirmCat.id}`);
      success(res.data.message || 'Xóa loại tài sản thành công!');
      setDeleteConfirmCat(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể xóa loại tài sản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.prefixCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 rounded-xl border border-coral-100 dark:border-coral-900">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Danh Mục Loại Tài Sản</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Phân loại danh mục trang thiết bị, quy định tiền tố sinh mã tài sản và thời gian khấu hao
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
            <span>Thêm loại tài sản</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm loại tài sản"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Tổng số: <span className="font-bold text-slate-800 dark:text-white">{filteredList.length}</span> loại tài sản
        </div>
      </div>

      {/* Data Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-36">Mã & Tiền tố</th>
                <th className="py-3.5 px-4">Tên loại tài sản</th>
                <th className="py-3.5 px-4 text-center w-36">Khấu hao</th>
                <th className="py-3.5 px-4 text-center w-32">Số tài sản</th>
                <th className="py-3.5 px-4">Mô tả chi tiết</th>
                <th className="py-3.5 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Đang tải danh mục loại tài sản...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy loại tài sản nào.
                  </td>
                </tr>
              ) : (
                filteredList.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-coral-100 dark:bg-coral-950 text-coral-800 dark:text-coral-300 font-bold text-xs flex items-center justify-center font-mono">
                          {cat.prefixCode}
                        </span>
                        <span className="font-mono font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                          {cat.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-100 dark:border-blue-900">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{cat.expectedLifespanMonths} tháng</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-coral-50 dark:bg-coral-950 text-coral-700 dark:text-coral-300 font-bold text-xs border border-coral-100 dark:border-coral-900">
                        <Boxes className="w-3.5 h-3.5 text-coral-600 dark:text-coral-400" />
                        <span>{cat._count?.assets || 0}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCat(cat)}
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
        title={editingCat ? `Chỉnh sửa loại tài sản: ${editingCat.name}` : 'Thêm mới loại tài sản'}
        subtitle="Thiết lập danh mục trang thiết bị, tiền tố mã và thời gian khấu hao"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mã phân loại <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập mã loại tài sản"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên loại tài sản <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên loại tài sản"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiền tố mã tài sản
                </label>
                <input
                  type="text"
                  placeholder="Nhập tiền tố mã tài sản (Không bắt buộc)"
                  value={formData.prefixCode}
                  onChange={(e) => setFormData({ ...formData, prefixCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Khấu hao (tháng)
                </label>
                <input
                  type="number"
                  placeholder="Nhập thời gian khấu hao"
                  value={formData.expectedLifespanMonths}
                  onChange={(e) => setFormData({ ...formData, expectedLifespanMonths: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mô tả
              </label>
              <textarea
                rows={4}
                placeholder="Nhập mô tả loại tài sản"
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
              {isSubmitting ? 'Đang lưu...' : editingCat ? 'Lưu thay đổi' : 'Tạo mới loại tài sản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmCat}
        onClose={() => setDeleteConfirmCat(null)}
        onConfirm={handleDelete}
        title={`Xóa loại tài sản: ${deleteConfirmCat?.name}`}
        message={`Bạn có chắc muốn xóa loại tài sản '${deleteConfirmCat?.name}'? Hệ thống sẽ ngăn chặn nếu đã có tài sản thuộc loại này.`}
        confirmText="Xóa loại tài sản"
        isLoading={isSubmitting}
      />
    </div>
  );
};
