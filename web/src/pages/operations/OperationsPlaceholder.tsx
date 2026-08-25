import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Boxes,
  Radio,
  Wrench,
  QrCode,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const OperationsPlaceholder: React.FC = () => {
  const location = useLocation();

  const configs: Record<string, { title: string; desc: string; icon: any; nextPhase: string[] }> = {
    '/operations/assets': {
      title: 'Danh mục Tài sản & Chi tiết Phần cứng',
      desc: 'Quản lý toàn bộ vòng đời thiết bị, thông số CPU/RAM/Serial/Ổ cứng & Dung lượng C/D, in biên bản bàn giao PDF và tạo mã QR tem nhãn',
      icon: Boxes,
      nextPhase: [
        'Hiển thị thanh dung lượng ổ cứng (Total / Used / Free) và chi tiết Serial từng thanh RAM',
        'Cấp phát & Thu hồi tài sản kèm tự động tạo Biên bản Bàn giao chuẩn tiếng Việt',
        'Tạo mã QR cho từng thiết bị và in tem nhãn decal dán máy',
      ],
    },
    '/operations/discovery': {
      title: 'Thiết bị Chờ duyệt (Agent Discovery Queue)',
      desc: 'Hàng đợi các máy trạm trong mạng LAN cài đặt Agent gửi thông tin cấu hình phần cứng và phần mềm về máy chủ',
      icon: Radio,
      nextPhase: [
        'Tiếp nhận payload tự động từ AssetOne Agent (Windows Service)',
        'Admin xem cấu hình chi tiết và bấm "Định danh tài sản" để đưa vào danh mục chính thức',
        'Bỏ qua hoặc ẩn các máy trạm vãng lai không thuộc diện quản lý',
      ],
    },
    '/operations/maintenance': {
      title: 'Bảo trì Tài sản & Lịch sửa chữa',
      desc: 'Quản lý kế hoạch bảo dưỡng định kỳ, nhật ký sửa chữa linh kiện và biên bản bàn giao sửa chữa',
      icon: Wrench,
      nextPhase: [
        'Lập lịch bảo dưỡng định kỳ (vệ sinh PC, tra keo tản nhiệt định kỳ 6 tháng/lần)',
        'Ghi nhận phiếu sự cố, linh kiện thay thế, chi phí và kỹ thuật viên xử lý',
        'Tự động sinh Biên bản Gửi/Nhận sửa chữa có chữ ký',
      ],
    },
    '/operations/audit': {
      title: 'Kiểm kê Tài sản bằng mã QR',
      desc: 'Quản lý các đợt kiểm kê tài sản và tích hợp trình quét mã QR qua Camera điện thoại/tablet để đối soát thực tế',
      icon: QrCode,
      nextPhase: [
        'Mở đợt kiểm kê theo phòng ban hoặc toàn cơ quan',
        'Nhân viên IT dùng Camera quét mã tem QR dán trên vỏ máy để đối soát tức thời',
        'Báo cáo tự động: Tỉ lệ hoàn thành, tài sản khớp, tài sản sai vị trí/người dùng',
      ],
    },
    '/operations/drift-alerts': {
      title: 'Biến động Cấu hình & Cảnh báo Bất thường',
      desc: 'Hệ thống tự động so khớp Baseline để phát hiện rút/tráo RAM, thay đổi ổ cứng, GPU hoặc cạn kiệt dung lượng đĩa',
      icon: Activity,
      nextPhase: [
        'Cảnh báo đỏ (Critical): Rút bớt RAM, đổi Serial thanh RAM, thay ổ cứng',
        'Cảnh báo vàng (Warning): Dung lượng ổ C/D dưới 10GB hoặc dưới 15%',
        'Phát hiện cài đặt phần mềm ngoài danh mục hoặc gỡ phần mềm bảo mật',
      ],
    },
  };

  const current = configs[location.pathname] || {
    title: 'Phân hệ Quản lý Vận hành',
    desc: 'Tính năng sẽ được triển khai chi tiết ở Phase 2 cùng với AssetOne Agent',
    icon: Boxes,
    nextPhase: [],
  };

  const Icon = current.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{current.title}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{current.desc}</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Nền tảng Danh mục & Ràng buộc đã hoàn tất:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200/60 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Phòng ban cây phân cấp (Khoa/Phòng)</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200/60 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Chức danh & Nhân viên phụ trách</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200/60 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Phân loại tài sản, Kho lưu trữ & Nhà cung cấp</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200/60 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cơ chế bảo mật User map Nhân viên & RBAC</span>
            </div>
          </div>
        </div>

        {current.nextPhase.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Nội dung sẵn sàng tích hợp tiếp theo (Phase 2):
            </h2>
            <div className="space-y-2">
              {current.nextPhase.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
