import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Modal } from '../../components/common/Modal.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Building2,
  Award,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';

interface EmployeeItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  status: 'ACTIVE' | 'PROBATION' | 'RESIGNED';
  departmentId: string;
  positionId: string;
  joinDate: string | null;
  department?: { id: string; name: string; level: number };
  position?: { id: string; name: string };
  user?: { id: string; username: string; role: string; isActive: boolean } | null;
  _count?: {
    assignedAssets: number;
    managedWarehouses: number;
  };
}

export const EmployeesPage: React.FC = () => {
  const { success, error } = useToast();
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [posFilter, setPosFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeItem | null>(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState<EmployeeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    status: 'ACTIVE',
    departmentId: '',
    positionId: '',
    joinDate: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, posRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
        api.get('/positions'),
      ]);

      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (posRes.data.success) setPositions(posRes.data.data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmp(null);
    setFormData({
      employeeCode: '',
      fullName: '',
      email: '',
      phone: '',
      gender: 'Nam',
      status: 'ACTIVE',
      departmentId: departments[0]?.id || '',
      positionId: positions[0]?.id || '',
      joinDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: EmployeeItem) => {
    setEditingEmp(emp);
    setFormData({
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      email: emp.email || '',
      phone: emp.phone || '',
      gender: emp.gender || 'Nam',
      status: emp.status,
      departmentId: emp.departmentId,
      positionId: emp.positionId,
      joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingEmp) {
        await api.put(`/employees/${editingEmp.id}`, formData);
        success(`Cập nhật thông tin nhân viên '${formData.fullName}' thành công!`);
      } else {
        await api.post('/employees', formData);
        success(`Thêm mới nhân viên '${formData.fullName}' thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhân viên.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmEmp) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/employees/${deleteConfirmEmp.id}`);
      success(res.data.message || 'Xóa nhân viên thành công!');
      setDeleteConfirmEmp(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể xóa nhân viên.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      !search ||
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(search.toLowerCase())) ||
      (emp.phone && emp.phone.includes(search));

    const matchDept = !deptFilter || emp.departmentId === deptFilter;
    const matchPos = !posFilter || emp.positionId === posFilter;
    const matchStatus = !statusFilter || emp.status === statusFilter;

    return matchSearch && matchDept && matchPos && matchStatus;
  });

  const statusBadges: Record<string, { label: string; bg: string }> = {
    ACTIVE: { label: 'Đang làm việc', bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
    PROBATION: { label: 'Thử việc', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
    RESIGNED: { label: 'Đã nghỉ việc', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
  };

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 rounded-xl border border-coral-100 dark:border-coral-900">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Danh Sách Nhân Viên</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý danh sách nhân sự, liên kết với Phòng ban và Chức vụ
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
            <span>Thêm nhân viên mới</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {'— '.repeat(d.level - 1)} {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
          >
            <option value="">Tất cả chức vụ</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang làm việc</option>
            <option value="PROBATION">Thử việc</option>
            <option value="RESIGNED">Đã nghỉ việc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-32">Mã NV</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Phòng ban</th>
                <th className="py-3.5 px-4">Chức vụ</th>
                <th className="py-3.5 px-4">Liên hệ</th>
                <th className="py-3.5 px-4 text-center w-28">Trạng thái</th>
                <th className="py-3.5 px-4 text-center w-28">Tài khoản</th>
                <th className="py-3.5 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Đang tải dữ liệu nhân viên...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3.5 px-4 font-mono font-bold text-coral-700 dark:text-coral-400">{emp.employeeCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-coral-100 dark:bg-coral-950 text-coral-700 dark:text-coral-300 font-bold text-xs flex items-center justify-center">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <div>{emp.fullName}</div>
                          <span className="text-[11px] text-slate-400 font-normal">{emp.gender || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{emp.department?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{emp.position?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                        {emp.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{emp.email}</span>
                          </div>
                        )}
                        {emp.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                        {!emp.email && !emp.phone && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadges[emp.status]?.bg}`}>
                        {statusBadges[emp.status]?.label || emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {emp.user ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-coral-50 dark:bg-coral-950 text-coral-700 dark:text-coral-300 border border-coral-200 dark:border-coral-800">
                          <UserCheck className="w-3 h-3 text-coral-600 dark:text-coral-400" />
                          <span>{emp.user.username}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chưa map</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmEmp(emp)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                          title="Xóa nhân viên"
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
        title={editingEmp ? `Chỉnh sửa nhân viên: ${editingEmp.fullName}` : 'Thêm mới nhân viên'}
        subtitle="Quản lý hồ sơ nhân sự, phòng ban và chức danh công việc"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã nhân viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập mã nhân viên"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono uppercase bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phòng ban trực thuộc <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {'— '.repeat(d.level - 1)} {d.name} (Cấp {d.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chức danh / Chức vụ <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.positionId}
                  onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="">-- Chọn chức danh / chức vụ --</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Giới tính
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái làm việc
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="ACTIVE">Đang làm việc</option>
                  <option value="PROBATION">Thử việc</option>
                  <option value="RESIGNED">Đã nghỉ việc</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày vào làm
                </label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
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
              {isSubmitting ? 'Đang lưu...' : editingEmp ? 'Lưu thay đổi' : 'Thêm mới nhân viên'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmEmp}
        onClose={() => setDeleteConfirmEmp(null)}
        onConfirm={handleDelete}
        title={`Xóa nhân viên: ${deleteConfirmEmp?.fullName}`}
        message={`Bạn có chắc muốn xóa nhân viên '${deleteConfirmEmp?.fullName}' (${deleteConfirmEmp?.employeeCode})? Hệ thống sẽ ngăn chặn nếu nhân viên đang được liên kết với User đăng nhập, đang quản lý kho hoặc đang giữ tài sản.`}
        confirmText="Xóa nhân viên"
        isLoading={isSubmitting}
      />
    </div>
  );
};
