import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Database,
  Download,
  Upload,
  Calendar,
  Save,
  RefreshCw,
  FileCheck,
  Radio,
  BellRing,
} from 'lucide-react';

interface BackupLogItem {
  id: string;
  filename: string;
  fileSize: number;
  backupType: 'MANUAL' | 'AUTO';
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export const BackupSettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'backup' | 'scan' | 'alerts'>('backup');
  const [loading, setLoading] = useState(true);

  // Tab 1: Backup State
  const [backupLogs, setBackupLogs] = useState<BackupLogItem[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    BACKUP_SCHEDULE: 'DAILY_0200',
    BACKUP_AUTO_ENABLED: 'true',
    BACKUP_RETENTION_DAYS: '30',
  });

  // Tab 2: Scan Parameters State
  const [scanData, setScanData] = useState({
    SCAN_IP_RANGES: '192.168.1.0/24, 10.0.0.0/16',
    AGENT_HEARTBEAT_INTERVAL_SECONDS: '300',
    SCAN_TIMEOUT_SECONDS: '10',
    OFFLINE_THRESHOLD_MINUTES: '30',
  });

  // Tab 3: Alert Thresholds State
  const [alertData, setAlertData] = useState({
    ALERT_DISK_WARNING_PERCENT: '15',
    ALERT_DISK_CRITICAL_PERCENT: '5',
    ALERT_ON_RAM_CHANGE: 'true',
    ALERT_ON_DISK_CHANGE: 'true',
    ALERT_ON_GPU_CHANGE: 'true',
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchBackupData = async () => {
    try {
      setLoading(true);
      const [logsRes, schedRes, scanRes, alertRes] = await Promise.all([
        api.get('/backup/logs'),
        api.get('/settings/group/BACKUP_SCHEDULE'),
        api.get('/settings/group/SCAN_PARAMETERS'),
        api.get('/settings/group/ALERT_THRESHOLDS'),
      ]);

      if (logsRes.data.success) setBackupLogs(logsRes.data.data);
      if (schedRes.data.success) setScheduleData((prev) => ({ ...prev, ...schedRes.data.data }));
      if (scanRes.data.success) setScanData((prev) => ({ ...prev, ...scanRes.data.data }));
      if (alertRes.data.success) setAlertData((prev) => ({ ...prev, ...alertRes.data.data }));
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải thông số sao lưu và cấu hình.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupData();
  }, []);

  const handleCreateInstantBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const res = await api.post('/backup/create');
      if (res.data.success) {
        success(`Tạo bản sao lưu thành công: ${res.data.data.filename}`);
        fetchBackupData();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Sao lưu thất bại.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      `CẢNH BÁO QUAN TRỌNG:\nBạn có chắc chắn muốn khôi phục dữ liệu từ file '${file.name}'?\nDữ liệu hiện tại có thể bị ghi đè.`
    );
    if (!confirmed) {
      e.target.value = '';
      return;
    }

    try {
      setIsRestoring(true);
      const formData = new FormData();
      formData.append('backupFile', file);

      const res = await api.post('/backup/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        success('Khôi phục cơ sở dữ liệu thành công!');
        fetchBackupData();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Khôi phục dữ liệu thất bại.');
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await api.put('/settings/group/BACKUP_SCHEDULE', { settings: scheduleData });
      success('Lưu lịch sao lưu tự động thành công!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Lưu thất bại.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveScanParams = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await api.put('/settings/group/SCAN_PARAMETERS', { settings: scanData });
      success('Lưu tham số quét mạng LAN thành công!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Lưu thất bại.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveAlertParams = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await api.put('/settings/group/ALERT_THRESHOLDS', { settings: alertData });
      success('Lưu ngưỡng cảnh báo phần cứng thành công!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Lưu thất bại.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 rounded-xl border border-coral-100 dark:border-coral-900">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Sao Lưu, Khôi Phục & Tham Số Quét</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý an toàn dữ liệu MySQL, đặt lịch sao lưu định kỳ và thiết lập tham số mạng/cảnh báo
            </p>
          </div>
        </div>

        <button
          onClick={fetchBackupData}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'backup'
                ? 'border-coral-600 text-coral-700 dark:text-coral-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Tab 1: Sao Lưu & Khôi Phục</span>
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'scan'
                ? 'border-coral-600 text-coral-700 dark:text-coral-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Tab 2: Tham Số Quét Mạng LAN</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'alerts'
                ? 'border-coral-600 text-coral-700 dark:text-coral-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Tab 3: Ngưỡng & Sự Kiện Cảnh Báo</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1 */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instant Backup Card */}
                <div className="p-5 rounded-2xl bg-coral-50/40 dark:bg-coral-950/20 border border-coral-200/80 dark:border-coral-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 text-coral-900 dark:text-coral-300 font-bold text-sm mb-1.5">
                      <Download className="w-5 h-5 text-coral-600 dark:text-coral-400" />
                      <span>Sao Lưu Dữ Liệu Tức Thời</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      Xuất toàn bộ cấu trúc bảng và bản ghi dữ liệu (Danh mục, Nhân viên, Tài sản, Cấu hình) ra file định dạng JSON chuẩn.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateInstantBackup}
                    disabled={isCreatingBackup}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-coral-600 hover:bg-coral-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isCreatingBackup ? 'Đang tạo bản sao lưu...' : 'Thực hiện Sao lưu Ngay'}</span>
                  </button>
                </div>

                {/* Restore Card */}
                <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-bold text-sm mb-1.5">
                      <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span>Khôi Phục Dữ Liệu Từ File</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      Tải lên file sao lưu `.json` hợp lệ từ máy tính để khôi phục toàn vẹn dữ liệu hệ thống.
                    </p>
                  </div>
                  <label className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-amber-600/30 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{isRestoring ? 'Đang xử lý khôi phục...' : 'Chọn File Sao Lưu Khôi Phục'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreFile}
                      disabled={isRestoring}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Schedule Settings Form */}
              <form onSubmit={handleSaveSchedule} className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-coral-600 dark:text-coral-400" />
                  <span>Cài Đặt Lịch Sao Lưu Định Kỳ Tự Động</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kích hoạt sao lưu tự động
                    </label>
                    <select
                      value={scheduleData.BACKUP_AUTO_ENABLED}
                      onChange={(e) => setScheduleData({ ...scheduleData, BACKUP_AUTO_ENABLED: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                    >
                      <option value="true">Bật sao lưu tự động</option>
                      <option value="false">Tắt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Chu kỳ sao lưu
                    </label>
                    <select
                      value={scheduleData.BACKUP_SCHEDULE}
                      onChange={(e) => setScheduleData({ ...scheduleData, BACKUP_SCHEDULE: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                    >
                      <option value="DAILY_0200">Hàng ngày lúc 02:00 sáng</option>
                      <option value="WEEKLY_SUN">Chủ nhật hàng tuần lúc 01:00 sáng</option>
                      <option value="MONTHLY_1ST">Ngày mùng 1 hàng tháng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Thời gian lưu trữ tối đa (ngày)
                    </label>
                    <input
                      type="number"
                      value={scheduleData.BACKUP_RETENTION_DAYS}
                      onChange={(e) => setScheduleData({ ...scheduleData, BACKUP_RETENTION_DAYS: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="flex items-center gap-2 px-5 py-2 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu lịch sao lưu</span>
                  </button>
                </div>
              </form>

              {/* History Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-coral-600 dark:text-coral-400" />
                  <span>Nhật Ký Các Bản Sao Lưu Đã Tạo</span>
                </h3>

                <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Tên file sao lưu</th>
                        <th className="py-3 px-4 w-32">Kích thước</th>
                        <th className="py-3 px-4 w-32">Loại sao lưu</th>
                        <th className="py-3 px-4 w-36">Thời gian tạo</th>
                        <th className="py-3 px-4 text-right w-28">Tải xuống</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {backupLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            Chưa có bản sao lưu nào. Hãy bấm "Thực hiện Sao lưu Ngay" ở trên.
                          </td>
                        </tr>
                      ) : (
                        backupLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition">
                            <td className="py-3 px-4 font-mono font-bold text-coral-700 dark:text-coral-400">{log.filename}</td>
                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                              {(log.fileSize / 1024).toFixed(1)} KB
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.backupType === 'MANUAL'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                }`}
                              >
                                {log.backupType === 'MANUAL' ? 'Thủ công' : 'Tự động'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                              {new Date(log.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <a
                                href={`http://localhost:5000/api/backup/download/${log.filename}`}
                                className="inline-flex items-center gap-1 p-1.5 text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950 rounded-lg transition font-bold"
                                title="Tải file sao lưu về máy"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 */}
          {activeTab === 'scan' && (
            <form onSubmit={handleSaveScanParams} className="space-y-5 max-w-3xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dải IP mạng LAN quét tự động (Định dạng CIDR) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập dải địa chỉ IP (định dạng CIDR)"
                  value={scanData.SCAN_IP_RANGES}
                  onChange={(e) => setScanData({ ...scanData, SCAN_IP_RANGES: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chu kỳ gửi báo cáo Heartbeat của Agent (giây)
                  </label>
                  <input
                    type="number"
                    value={scanData.AGENT_HEARTBEAT_INTERVAL_SECONDS}
                    onChange={(e) => setScanData({ ...scanData, AGENT_HEARTBEAT_INTERVAL_SECONDS: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngưỡng xác định máy trạm mất kết nối Offline (phút)
                  </label>
                  <input
                    type="number"
                    value={scanData.OFFLINE_THRESHOLD_MINUTES}
                    onChange={(e) => setScanData({ ...scanData, OFFLINE_THRESHOLD_MINUTES: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Đang lưu...' : 'Lưu tham số quét mạng'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3 */}
          {activeTab === 'alerts' && (
            <form onSubmit={handleSaveAlertParams} className="space-y-5 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngưỡng cảnh báo dung lượng đĩa Cảnh báo Vàng (%)
                  </label>
                  <input
                    type="number"
                    value={alertData.ALERT_DISK_WARNING_PERCENT}
                    onChange={(e) => setAlertData({ ...alertData, ALERT_DISK_WARNING_PERCENT: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngưỡng cảnh báo dung lượng đĩa Cảnh báo Đỏ (%)
                  </label>
                  <input
                    type="number"
                    value={alertData.ALERT_DISK_CRITICAL_PERCENT}
                    onChange={(e) => setAlertData({ ...alertData, ALERT_DISK_CRITICAL_PERCENT: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Bật / Tắt Theo Dõi Biến Động Phần Cứng Tự Động
                </h4>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertData.ALERT_ON_RAM_CHANGE === 'true'}
                      onChange={(e) => setAlertData({ ...alertData, ALERT_ON_RAM_CHANGE: e.target.checked ? 'true' : 'false' })}
                      className="w-4 h-4 text-coral-600 rounded border-slate-300 focus:ring-coral-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Giám sát rút bớt / thay đổi thanh RAM</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cảnh báo ngay lập tức nếu phát hiện thiếu dung lượng RAM hoặc Serial thanh RAM bị tráo đổi so với Baseline.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertData.ALERT_ON_DISK_CHANGE === 'true'}
                      onChange={(e) => setAlertData({ ...alertData, ALERT_ON_DISK_CHANGE: e.target.checked ? 'true' : 'false' })}
                      className="w-4 h-4 text-coral-600 rounded border-slate-300 focus:ring-coral-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Giám sát thay đổi Ổ cứng vật lý (Disk Serial)</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cảnh báo khi phát hiện ổ SSD/HDD bị tháo ra hoặc thay thế bằng ổ đĩa khác.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertData.ALERT_ON_GPU_CHANGE === 'true'}
                      onChange={(e) => setAlertData({ ...alertData, ALERT_ON_GPU_CHANGE: e.target.checked ? 'true' : 'false' })}
                      className="w-4 h-4 text-coral-600 rounded border-slate-300 focus:ring-coral-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Giám sát thay đổi Card đồ họa rời (GPU)</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cảnh báo khi card VGA đồ họa bị tháo rời khỏi máy trạm.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-coral-600 hover:bg-coral-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-coral-600/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Đang lưu...' : 'Lưu cài đặt cảnh báo'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
