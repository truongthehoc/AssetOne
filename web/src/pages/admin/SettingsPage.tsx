import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Building2,
  Cpu,
  Save,
  RefreshCw,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'organization' | 'software'>('organization');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Tab 1: Organization State
  const [orgData, setOrgData] = useState({
    ORG_NAME: 'Bệnh viện Đa khoa Quốc tế AssetOne',
    TAX_CODE: '0109887766',
    PHONE: '024 3888 9999',
    EMAIL: 'contact@assetone.vn',
    WEBSITE: 'https://assetone.vn',
    ADDRESS: 'Số 88 Đường Cầu Giấy, Quận Cầu Giấy, TP. Hà Nội',
    LOGO_URL: '',
    FAVICON_URL: '',
  });

  // Tab 2: Software State
  const [softwareData, setSoftwareData] = useState({
    APP_NAME: 'AssetOne',
    APP_VERSION: 'v1.0.0 Enterprise',
    DEVELOPER_NAME: 'Ban Phát triển Hệ thống CNTT',
    COPYRIGHT_TEXT: '© 2026 AssetOne. All rights reserved.',
    SUPPORT_HOTLINE: '1900 6868',
    SUPPORT_EMAIL: 'support@assetone.vn',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [orgRes, softRes] = await Promise.all([
        api.get('/settings/group/ORGANIZATION_INFO'),
        api.get('/settings/group/SOFTWARE_INFO'),
      ]);

      if (orgRes.data.success) {
        setOrgData((prev) => ({ ...prev, ...orgRes.data.data }));
      }
      if (softRes.data.success) {
        setSoftwareData((prev) => ({ ...prev, ...softRes.data.data }));
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải cấu hình hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/settings/group/ORGANIZATION_INFO', { settings: orgData });
      success('Lưu thông tin đơn vị thành công!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Lưu cấu hình đơn vị thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/settings/group/SOFTWARE_INFO', { settings: softwareData });
      success('Lưu thông tin phần mềm thành công!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Lưu cấu hình phần mềm thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 rounded-xl border border-coral-100 dark:border-coral-900">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Cấu Hình Hệ Thống</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý thông tin pháp lý đơn vị, thương hiệu và thông số phần mềm
            </p>
          </div>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('organization')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'organization'
                ? 'border-coral-600 text-coral-700 dark:text-coral-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Tab 1: Thông Tin Đơn Vị</span>
          </button>

          <button
            onClick={() => setActiveTab('software')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'software'
                ? 'border-coral-600 text-coral-700 dark:text-coral-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Tab 2: Thông Tin Phần Mềm</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'organization' && (
            <form onSubmit={handleSaveOrg} className="space-y-5 max-w-3xl">
              <div className="p-3 bg-coral-50 dark:bg-coral-950/30 border border-coral-200 dark:border-coral-800 rounded-xl flex items-start gap-2.5 text-xs text-coral-900 dark:text-coral-300">
                <Info className="w-4 h-4 text-coral-600 dark:text-coral-400 shrink-0 mt-0.5" />
                <span>
                  Thông tin đơn vị sẽ được tự động đồng bộ hiển thị lên thanh tiêu đề hệ thống và tiêu đề các biên bản in ấn xuất phiếu bàn giao, kiểm kê, thanh lý.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên cơ quan / Đơn vị sử dụng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên cơ quan / đơn vị"
                    value={orgData.ORG_NAME}
                    onChange={(e) => setOrgData({ ...orgData, ORG_NAME: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã số thuế"
                    value={orgData.TAX_CODE}
                    onChange={(e) => setOrgData({ ...orgData, TAX_CODE: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại liên hệ"
                    value={orgData.PHONE}
                    onChange={(e) => setOrgData({ ...orgData, PHONE: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hòm thư điện tử (Email)
                  </label>
                  <input
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    value={orgData.EMAIL}
                    onChange={(e) => setOrgData({ ...orgData, EMAIL: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website đơn vị
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ website"
                    value={orgData.WEBSITE}
                    onChange={(e) => setOrgData({ ...orgData, WEBSITE: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Địa chỉ trụ sở chính
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ trụ sở"
                    value={orgData.ADDRESS}
                    onChange={(e) => setOrgData({ ...orgData, ADDRESS: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đường dẫn Logo (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập đường dẫn logo"
                    value={orgData.LOGO_URL}
                    onChange={(e) => setOrgData({ ...orgData, LOGO_URL: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đường dẫn Favicon (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập đường dẫn favicon"
                    value={orgData.FAVICON_URL}
                    onChange={(e) => setOrgData({ ...orgData, FAVICON_URL: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin đơn vị'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'software' && (
            <form onSubmit={handleSaveSoftware} className="space-y-5 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên phần mềm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên phần mềm"
                    value={softwareData.APP_NAME}
                    onChange={(e) => setSoftwareData({ ...softwareData, APP_NAME: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phiên bản phát hành
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập phiên bản"
                    value={softwareData.APP_VERSION}
                    onChange={(e) => setSoftwareData({ ...softwareData, APP_VERSION: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Người / Đơn vị phát triển
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên đơn vị phát triển"
                    value={softwareData.DEVELOPER_NAME}
                    onChange={(e) => setSoftwareData({ ...softwareData, DEVELOPER_NAME: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thông tin bản quyền (Copyright)
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập thông tin bản quyền"
                    value={softwareData.COPYRIGHT_TEXT}
                    onChange={(e) => setSoftwareData({ ...softwareData, COPYRIGHT_TEXT: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hotline hỗ trợ kỹ thuật
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập hotline hỗ trợ"
                    value={softwareData.SUPPORT_HOTLINE}
                    onChange={(e) => setSoftwareData({ ...softwareData, SUPPORT_HOTLINE: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email hỗ trợ kỹ thuật
                  </label>
                  <input
                    type="email"
                    placeholder="Nhập email hỗ trợ"
                    value={softwareData.SUPPORT_EMAIL}
                    onChange={(e) => setSoftwareData({ ...softwareData, SUPPORT_EMAIL: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin phần mềm'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
