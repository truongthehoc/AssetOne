import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  Search,
  RefreshCw,
  Phone,
  Mail,
  User,
} from 'lucide-react';

interface VendorItem {
  id: string;
  code: string;
  name: string;
  taxCode: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
  notes: string | null;
  _count?: { assets: number };
}

export const VendorsPage: React.FC = () => {
  const { success, error } = useToast();
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [deleteConfirmVendor, setDeleteConfirmVendor] = useState<VendorItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taxCode: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors');
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách nhà cung cấp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      code: '',
      name: '',
      taxCode: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VendorItem) => {
    setEditingVendor(v);
    setFormData({
      code: v.code,
      name: v.name,
      taxCode: v.taxCode || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      contactPerson: v.contactPerson || '',
      notes: v.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingVendor) {
        await api.put(`/vendors/${editingVendor.id}`, formData);
        success(`Cập nhật nhà cung cấp '${formData.name}' thành công!`);
      } else {
        await api.post('/vendors', formData);
        success(`Tạo mới nhà cung cấp '${formData.name}' thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhà cung cấp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmVendor) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/vendors/${deleteConfirmVendor.id}`);
      success(res.data.message || 'Xóa nhà cung cấp thành công!');
      setDeleteConfirmVendor(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể xóa nhà cung cấp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      (v.taxCode && v.taxCode.includes(search)) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Danh Mục Nhà Cung Cấp</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý danh sách các đối tác cung cấp thiết bị, thông tin liên hệ và bảo hành
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
            <span>Thêm nhà cung cấp</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà cung cấp"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Tổng số: <span className="font-bold text-slate-800 dark:text-white">{filteredList.length}</span> đối tác
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-36">Mã NCC</th>
                <th className="py-3.5 px-4">Tên nhà cung cấp</th>
                <th className="py-3.5 px-4 w-36">Mã số thuế</th>
                <th className="py-3.5 px-4">Liên hệ</th>
                <th className="py-3.5 px-4">Địa chỉ</th>
                <th className="py-3.5 px-4 text-center w-28">Tài sản</th>
                <th className="py-3.5 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách nhà cung cấp...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy nhà cung cấp nào.
                  </td>
                </tr>
              ) : (
                filteredList.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3.5 px-4 font-mono font-bold text-coral-700 dark:text-coral-400">{v.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{v.name}</div>
                      {v.contactPerson && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{v.contactPerson}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">{v.taxCode || '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                        {v.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{v.phone}</span>
                          </div>
                        )}
                        {v.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{v.email}</span>
                          </div>
                        )}
                        {!v.phone && !v.email && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{v.address || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-coral-50 dark:bg-coral-950 text-coral-700 dark:text-coral-300 font-bold text-xs border border-coral-100 dark:border-coral-900">
                        <Boxes className="w-3 h-3 text-coral-600 dark:text-coral-400" />
                        <span>{v._count?.assets || 0}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmVendor(v)}
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
        title={editingVendor ? `Chỉnh sửa nhà cung cấp: ${editingVendor.name}` : 'Thêm mới nhà cung cấp'}
        subtitle="Quản lý hồ sơ đối tác, mã số thuế, liên hệ và địa chỉ"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã nhà cung cấp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập mã nhà cung cấp"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã số thuế
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã số thuế"
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên công ty / Nhà cung cấp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên nhà cung cấp"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Người liên hệ
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên người liên hệ"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại liên hệ"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Địa chỉ trụ sở
              </label>
              <input
                type="text"
                placeholder="Nhập địa chỉ trụ sở"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú
              </label>
              <textarea
                rows={4}
                placeholder="Nhập ghi chú"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {isSubmitting ? 'Đang lưu...' : editingVendor ? 'Lưu thay đổi' : 'Tạo mới nhà cung cấp'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmVendor}
        onClose={() => setDeleteConfirmVendor(null)}
        onConfirm={handleDelete}
        title={`Xóa nhà cung cấp: ${deleteConfirmVendor?.name}`}
        message={`Bạn có chắc muốn xóa nhà cung cấp '${deleteConfirmVendor?.name}'? Hệ thống sẽ ngăn chặn nếu đã có tài sản mua từ nhà cung cấp này.`}
        confirmText="Xóa nhà cung cấp"
        isLoading={isSubmitting}
      />
    </div>
  );
};
