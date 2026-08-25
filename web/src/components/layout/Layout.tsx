import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200 font-sans">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Fluid Content Area (Co dãn theo diện tích trình duyệt) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-7">
          <Outlet />
        </main>

        {/* Global Fluid Footer Bar */}
        <footer className="h-10 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            © 2026 Quản lý tài sản • Tất cả quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-md bg-coral-50 dark:bg-coral-950 text-coral-700 dark:text-coral-300 font-mono text-[10px] font-bold border border-coral-200/60 dark:border-coral-800">
              v1.0.0-Enterprise (build 2026.08)
            </span>
            <span className="hidden sm:inline">Phát triển bởi Đội ngũ Kỹ thuật</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
