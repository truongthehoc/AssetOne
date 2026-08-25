import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../lib/api.js';
import {
  Boxes,
  Lock,
  User,
  ArrowRight,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
        navigate('/dashboard');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Đăng nhập không thành công.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-coral-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-coral-500 to-rose-600 text-white shadow-xl shadow-coral-500/30 mb-4">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Asset<span className="text-coral-400">One</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">
            Hệ thống Quản lý Tài sản Thông tin & Endpoint Discovery
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-base font-bold text-white mb-1 text-center">Đăng nhập Hệ thống</h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            Nhập tài khoản quản trị để truy cập vào bảng điều khiển
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-slate-900/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-slate-900/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-coral-600 to-coral-700 hover:from-coral-500 hover:to-coral-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-coral-600/30 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Tài khoản mặc định:</div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
              <span>user: <strong className="text-coral-300">admin</strong></span>
              <span>•</span>
              <span>pass: <strong className="text-coral-300">admin123</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          © 2026 AssetOne Enterprise. All rights reserved.
        </div>
      </div>
    </div>
  );
};
