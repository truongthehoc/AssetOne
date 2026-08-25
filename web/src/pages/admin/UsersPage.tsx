import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../context/AuthContext.js';
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
  CheckCircle2,
  XCircle,
  UserCheck,
} from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  role: 'ADMIN' | 'IT_STAFF' | 'EXECUTIVE' | 'VIEWER';
  isActive: boolean;
  employeeId: string | null;
  createdAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    department?: { id: string; name: string };
    position?: { id: string; name: string };
  } | null;
}

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'IT_STAFF',
    employeeId: '',
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, empRes] = await Promise.all([
        api.get('/users'),
        api.get('/employees'),
      ]);
      if (userRes.data.success) setUsers(userRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'IT_STAFF',
      employeeId: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: UserItem) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      password: '', // Empty means keep current password
      role: u.role,
      employeeId: u.employeeId || '',
      isActive: u.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        success(`Cập nhật tài khoản '${formData.username}' thành công!`);
      } else {
        await api.post('/users', formData);
        success(`Tạo mới tài khoản '${formData.username}' thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu người dùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/users/${deleteConfirmUser.id}`);
      success(res.data.message || 'Xóa người dùng thành công!');
      setDeleteConfirmUser(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể xóa người dùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleBadges: Record<string, { label: string; bg: string }> = {
    ADMIN: { label: 'Quản trị tối cao (Admin)', bg: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' },
    IT_STAFF: { label: 'Cán bộ IT Quản trị', bg: 'bg-coral-100 dark:bg-coral-950 text-coral-800 dark:text-coral-300' },
    EXECUTIVE: { label: 'Ban Lãnh Đạo', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
    VIEWER: { label: 'Người xem báo cáo', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  };

  const filteredUsers = users.filter((u) => {
    const matchUsername = u.username.toLowerCase().includes(search.toLowerCase());
    const matchEmpName = u.employee?.fullName.toLowerCase().includes(search.toLowerCase());
    const matchDept = u.employee?.department?.name.toLowerCase().includes(search.toLowerCase());
    return matchUsername || matchEmpName || matchDept;
  });

  const selectedEmployee = employees.find((e) => e.id === formData.employeeId);

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 rounded-xl border border-coral-100 dark:border-coral-900">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Quản Trị Người Dùng & Phân Quyền</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý tài khoản đăng nhập hệ thống, phân quyền và liên kết trực tiếp với Nhân viên
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
            <span>Thêm người dùng mới</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Tổng số: <span className="font-bold text-slate-800 dark:text-white">{filteredUsers.length}</span> người dùng
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Tài khoản đăng nhập</th>
                <th className="py-3.5 px-4">Nhân viên liên kết</th>
                <th className="py-3.5 px-4">Phòng ban & Chức vụ</th>
                <th className="py-3.5 px-4">Vai trò / Quyền hạn</th>
                <th className="py-3.5 px-4 text-center w-28">Trạng thái</th>
                <th className="py-3.5 px-4 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-coral-100 dark:bg-coral-950 text-coral-800 dark:text-coral-300 flex items-center justify-center font-bold text-xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {currentUser?.id === u.id && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                                Bạn
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Ngày tạo: {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.employee ? (
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{u.employee.fullName}</div>
                          <div className="text-[11px] text-coral-700 dark:text-coral-400 font-mono font-bold">
                            {u.employee.employeeCode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa gắn nhân viên</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.employee ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.employee.department?.name || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.employee.position?.name || '—'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${roleBadges[u.role]?.bg}`}>
                        {roleBadges[u.role]?.label || u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Kích hoạt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[11px] font-semibold whitespace-nowrap">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Đã khóa</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== u.id && u.username !== 'admin' && (
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
        title={editingUser ? `Chỉnh sửa tài khoản: ${editingUser.username}` : 'Thêm mới tài khoản người dùng'}
        subtitle="Quản lý tài khoản đăng nhập, quyền hạn và liên kết hồ sơ nhân viên"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Liên kết với Nhân viên hồ sơ
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
              >
                <option value="">-- Không liên kết nhân viên (Tài khoản độc lập) --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode}) - {emp.department?.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee && (
              <div className="p-3.5 bg-coral-50 dark:bg-coral-950/40 rounded-xl border border-coral-200 dark:border-coral-800 text-xs space-y-1">
                <div className="font-bold text-coral-900 dark:text-coral-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Thông tin nhân viên kế thừa:</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Phòng ban: <strong>{selectedEmployee.department?.name}</strong> • Chức vụ: <strong>{selectedEmployee.position?.name}</strong>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono bg-white dark:bg-slate-800 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {editingUser ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu khởi tạo *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vai trò / Quyền hạn <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="ADMIN">Quản trị viên Tối cao (ADMIN)</option>
                  <option value="IT_STAFF">Cán bộ Quản trị IT (IT_STAFF)</option>
                  <option value="EXECUTIVE">Ban Lãnh Đạo (EXECUTIVE)</option>
                  <option value="VIEWER">Người xem Báo cáo (VIEWER)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái tài khoản
                </label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                >
                  <option value="true">Đang kích hoạt (Active)</option>
                  <option value="false">Khóa tài khoản (Disabled)</option>
                </select>
              </div>
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
              {isSubmitting ? 'Đang lưu...' : editingUser ? 'Lưu thay đổi' : 'Tạo mới tài khoản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleDelete}
        title={`Xóa tài khoản: ${deleteConfirmUser?.username}`}
        message={`Bạn có chắc muốn xóa tài khoản '${deleteConfirmUser?.username}'? Thao tác này sẽ xóa quyền đăng nhập của người dùng này khỏi hệ thống.`}
        confirmText="Xóa tài khoản"
        isLoading={isSubmitting}
      />
    </div>
  );
};
