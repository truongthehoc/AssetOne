import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { SearchableSelect } from '../../components/common/SearchableSelect.js';
import {
  Network,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Users,
  Boxes,
  Search,
  RefreshCw,
} from 'lucide-react';

interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  level: number;
  orderIndex: number;
  description: string | null;
  children?: DepartmentItem[];
  parent?: { name: string } | null;
  _count?: {
    employees: number;
    children: number;
    assets: number;
  };
}

export const DepartmentsPage: React.FC = () => {
  const { success, error } = useToast();
  const [treeData, setTreeData] = useState<DepartmentItem[]>([]);
  const [flatList, setFlatList] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parentId: '',
    orderIndex: 0,
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments/tree');
      if (res.data.success) {
        setTreeData(res.data.data);
        setFlatList(res.data.rawList || []);
        
        // Auto expand all level 1 nodes initially
        const initialExp: Record<string, boolean> = {};
        res.data.data.forEach((node: DepartmentItem) => {
          initialExp[node.id] = true;
          if (node.children) {
            node.children.forEach((c) => (initialExp[c.id] = true));
          }
        });
        setExpandedNodes((prev) => ({ ...initialExp, ...prev }));
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách phòng ban.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = (presetParentId: string | null = null) => {
    setEditingDept(null);
    setFormData({
      code: '',
      name: '',
      parentId: presetParentId || '',
      orderIndex: 0,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      parentId: dept.parentId || '',
      orderIndex: dept.orderIndex,
      description: dept.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
        success(`Cập nhật phòng ban '${formData.name}' thành công!`);
      } else {
        await api.post('/departments', formData);
        success(`Tạo mới phòng ban '${formData.name}' thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phòng ban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmDept) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/departments/${deleteConfirmDept.id}`);
      success(res.data.message || 'Xóa phòng ban thành công!');
      setDeleteConfirmDept(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể xóa phòng ban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper render tree row recursively
  const renderTreeRows = (nodes: DepartmentItem[], depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = !!expandedNodes[node.id];
      const isMatchesSearch =
        !search ||
        node.name.toLowerCase().includes(search.toLowerCase()) ||
        node.code.toLowerCase().includes(search.toLowerCase());

      return (
        <React.Fragment key={node.id}>
          {isMatchesSearch && (
            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group border-b border-slate-100 dark:border-slate-800 text-xs">
              <td className="py-3.5 px-4 font-mono font-bold text-coral-700 dark:text-coral-400">{node.code}</td>
              <td className="py-3.5 px-4">
                <div
                  className="flex items-center gap-2"
                  style={{ paddingLeft: `${depth * 24}px` }}
                >
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(node.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-coral-600 dark:text-coral-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <span className="w-6 inline-block text-slate-300 dark:text-slate-600 text-center">•</span>
                  )}
                  <span
                    className={`font-medium ${
                      node.level === 1
                        ? 'font-bold text-slate-900 dark:text-white text-sm'
                        : node.level === 2
                        ? 'font-semibold text-slate-800 dark:text-slate-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {node.name}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-4 text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    node.level === 1
                      ? 'bg-coral-100 dark:bg-coral-950 text-coral-800 dark:text-coral-300'
                      : node.level === 2
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Cấp {node.level}
                </span>
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-100 dark:border-emerald-900">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{node._count?.employees || 0}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-xs border border-amber-100 dark:border-amber-900">
                  <Boxes className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{node._count?.assets || 0}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                {node.description || '—'}
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleOpenAddModal(node.id)}
                    className="p-1.5 text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950 rounded-lg transition"
                    title="Thêm phòng ban con trực thuộc"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(node)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmDept(node)}
                    className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                    title="Xóa phòng ban"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )}
          {hasChildren && isExpanded && renderTreeRows(node.children!, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 rounded-xl border border-coral-100 dark:border-coral-900">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Danh Mục Phòng Ban</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý cơ cấu tổ chức phòng ban và các đơn vị trực thuộc
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenAddModal(null)}
            className="flex items-center gap-2 px-4 py-2 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phòng ban mới</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng ban"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Tổng số: <span className="font-bold text-slate-800 dark:text-white">{flatList.length}</span> phòng ban
        </div>
      </div>

      {/* Tree Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-36">Mã phòng ban</th>
                <th className="py-3.5 px-4">Tên phòng ban / Bộ phận</th>
                <th className="py-3.5 px-4 text-center w-28">Cấp bậc</th>
                <th className="py-3.5 px-4 text-center w-28">Nhân viên</th>
                <th className="py-3.5 px-4 text-center w-28">Tài sản</th>
                <th className="py-3.5 px-4">Mô tả</th>
                <th className="py-3.5 px-4 text-right w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Đang tải dữ liệu cây phòng ban...
                  </td>
                </tr>
              ) : treeData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Chưa có phòng ban nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                renderTreeRows(treeData)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Slide-Over Drawer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Chỉnh sửa phòng ban: ${editingDept.name}` : 'Thêm mới phòng ban'}
        subtitle="Điền thông tin chi tiết phòng ban để lưu vào hệ thống"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã phòng ban <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập mã phòng ban"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên phòng ban <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên phòng ban"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phòng ban cha trực thuộc (Để trống nếu là phòng ban gốc)
              </label>
              <SearchableSelect
                value={formData.parentId}
                onChange={(val) => setFormData({ ...formData, parentId: val })}
                options={[
                  { value: '', label: '-- Là phòng ban gốc --' },
                  ...flatList
                    .filter((d) => !editingDept || d.id !== editingDept.id)
                    .map((d) => ({
                      value: d.id,
                      label: `${'— '.repeat(d.level - 1)}${d.name}`,
                      sublabel: `Cấp ${d.level}`,
                    })),
                ]}
                placeholder="-- Là phòng ban gốc --"
                searchPlaceholder="Gõ tên phòng ban để tìm..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mô tả
              </label>
              <textarea
                rows={4}
                placeholder="Nhập mô tả phòng ban"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Sticky Bottom Action Buttons */}
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
              {isSubmitting ? 'Đang lưu...' : editingDept ? 'Lưu thay đổi' : 'Tạo mới phòng ban'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmDept}
        onClose={() => setDeleteConfirmDept(null)}
        onConfirm={handleDelete}
        title={`Xóa phòng ban: ${deleteConfirmDept?.name}`}
        message={`Bạn có chắc chắn muốn xóa phòng ban '${deleteConfirmDept?.name}'? Hệ thống sẽ kiểm tra ràng buộc: không thể xóa nếu còn phòng ban con, nhân viên hoặc tài sản trực thuộc.`}
        confirmText="Xóa phòng ban"
        isLoading={isSubmitting}
      />
    </div>
  );
};
