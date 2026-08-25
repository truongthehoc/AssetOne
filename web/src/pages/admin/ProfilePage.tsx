import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../lib/api.js';
import {
  UserCheck,
  Lock,
  Building2,
  Award,
  Shield,
  Save,
  KeyRound,
  Mail,
  Phone,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile Form
  const [profileData, setProfileData] = useState({
    phone: user?.employee?.phone || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        updateUser(res.data.data);
        success('Cập nhật thông tin tài khoản thành công!');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      setIsChangingPassword(true);
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        success('Đổi mật khẩu thành công! Hãy lưu lại mật khẩu mới.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-coral-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-coral-500/20">
            {user?.employee?.fullName
              ? user.employee.fullName.charAt(0).toUpperCase()
              : user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {user?.employee?.fullName || user?.username}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-coral-50 dark:bg-coral-950 text-coral-700 dark:text-coral-300 border border-coral-200 dark:border-coral-800 uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tài khoản: <strong className="text-slate-700 dark:text-slate-200">{user?.username}</strong> • Mã NV: <strong className="text-slate-700 dark:text-slate-200">{user?.employee?.employeeCode || 'Chưa liên kết'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'profile'
                ? 'border-coral-600 text-coral-700 dark:text-coral-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Hồ Sơ & Nhân Viên Liên Kết</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'password'
                ? 'border-coral-600 text-coral-700 dark:text-coral-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Đổi Mật Khẩu</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Inherited Employee Details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-coral-600 dark:text-coral-400" />
                  <span>Thông Tin Hồ Sơ Kế Thừa Từ Nhân Viên</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Họ và tên</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                      {user?.employee?.fullName || '—'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Mã nhân viên</span>
                    <div className="text-sm font-bold font-mono text-coral-700 dark:text-coral-400 mt-1">
                      {user?.employee?.employeeCode || '—'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Phòng ban</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{user?.employee?.department?.name || '—'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Chức danh / Chức vụ</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>{user?.employee?.position?.name || '—'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Email</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{user?.employee?.email || '—'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Quyền hạn hệ thống</span>
                    <div className="text-sm font-bold text-coral-700 dark:text-coral-400 mt-1">
                      {user?.role || 'ADMIN'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Profile Information */}
              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Cập Nhật Thông Tin Liên Hệ
                </h3>

                <div className="max-w-md">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại liên hệ"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex items-center gap-2 px-5 py-2 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdatingProfile ? 'Đang lưu...' : 'Lưu thông tin'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="max-w-md space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                <KeyRound className="w-4 h-4 text-coral-600 dark:text-coral-400" />
                <span>Thiết Lập Mật Khẩu Mới</span>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu hiện tại"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Xác nhận mật khẩu mới"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isChangingPassword ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
