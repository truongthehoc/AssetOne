import { PrismaClient, UserRole, EmployeeStatus, BackupType, BackupStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for AssetOne...');

  // 1. Seed System Settings
  console.log('⚙️ Seeding System Settings...');

  // Organization Info
  await prisma.systemSetting.upsert({
    where: { key: 'org_name' },
    update: {},
    create: { key: 'org_name', value: 'Bệnh viện Đa khoa Quốc tế AssetOne', group: 'ORGANIZATION_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'org_tax_code' },
    update: {},
    create: { key: 'org_tax_code', value: '0109887766', group: 'ORGANIZATION_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'org_phone' },
    update: {},
    create: { key: 'org_phone', value: '024 3888 9999', group: 'ORGANIZATION_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'org_email' },
    update: {},
    create: { key: 'org_email', value: 'contact@assetone.vn', group: 'ORGANIZATION_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'org_address' },
    update: {},
    create: { key: 'org_address', value: 'Số 88 Đường Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, TP. Hà Nội', group: 'ORGANIZATION_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'org_website' },
    update: {},
    create: { key: 'org_website', value: 'https://assetone.vn', group: 'ORGANIZATION_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'org_logo_url' },
    update: {},
    create: { key: 'org_logo_url', value: '', group: 'ORGANIZATION_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'org_favicon_url' },
    update: {},
    create: { key: 'org_favicon_url', value: '', group: 'ORGANIZATION_INFO' }
  });

  // Software Info
  await prisma.systemSetting.upsert({
    where: { key: 'soft_name' },
    update: {},
    create: { key: 'soft_name', value: 'AssetOne - IT Asset Management & Endpoint Discovery System', group: 'SOFTWARE_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'soft_version' },
    update: {},
    create: { key: 'soft_version', value: '1.0.0 Enterprise', group: 'SOFTWARE_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'soft_vendor' },
    update: {},
    create: { key: 'soft_vendor', value: 'AssetOne Enterprise Solutions', group: 'SOFTWARE_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'soft_copyright' },
    update: {},
    create: { key: 'soft_copyright', value: '© 2026 AssetOne. All rights reserved.', group: 'SOFTWARE_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'soft_support_phone' },
    update: {},
    create: { key: 'soft_support_phone', value: '1900 6868', group: 'SOFTWARE_INFO' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'soft_support_email' },
    update: {},
    create: { key: 'soft_support_email', value: 'support@assetone.vn', group: 'SOFTWARE_INFO' }
  });

  // Scan Parameters
  await prisma.systemSetting.upsert({
    where: { key: 'scan_ip_ranges' },
    update: {},
    create: { key: 'scan_ip_ranges', value: '192.168.1.0/24, 192.168.10.0/24, 10.0.0.0/16', group: 'SCAN_PARAMETERS' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'scan_heartbeat_minutes' },
    update: {},
    create: { key: 'scan_heartbeat_minutes', value: '15', group: 'SCAN_PARAMETERS' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'scan_offline_days' },
    update: {},
    create: { key: 'scan_offline_days', value: '3', group: 'SCAN_PARAMETERS' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'scan_auto_discover' },
    update: {},
    create: { key: 'scan_auto_discover', value: 'true', group: 'SCAN_PARAMETERS' }
  });

  // Alert Thresholds
  await prisma.systemSetting.upsert({
    where: { key: 'alert_disk_warning_percent' },
    update: {},
    create: { key: 'alert_disk_warning_percent', value: '15', group: 'ALERT_THRESHOLDS' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'alert_disk_critical_percent' },
    update: {},
    create: { key: 'alert_disk_critical_percent', value: '5', group: 'ALERT_THRESHOLDS' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'alert_ram_change' },
    update: {},
    create: { key: 'alert_ram_change', value: 'true', group: 'ALERT_THRESHOLDS' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'alert_disk_change' },
    update: {},
    create: { key: 'alert_disk_change', value: 'true', group: 'ALERT_THRESHOLDS' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'alert_gpu_change' },
    update: {},
    create: { key: 'alert_gpu_change', value: 'true', group: 'ALERT_THRESHOLDS' }
  });

  // Backup Schedule
  await prisma.systemSetting.upsert({
    where: { key: 'backup_auto_enabled' },
    update: {},
    create: { key: 'backup_auto_enabled', value: 'true', group: 'BACKUP_SCHEDULE' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'backup_frequency' },
    update: {},
    create: { key: 'backup_frequency', value: 'DAILY', group: 'BACKUP_SCHEDULE' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'backup_time' },
    update: {},
    create: { key: 'backup_time', value: '02:00', group: 'BACKUP_SCHEDULE' }
  });

  // 2. Seed Positions (Chức danh / Chức vụ)
  console.log('🏷️ Seeding Positions...');
  const posAdmin = await prisma.position.upsert({
    where: { code: 'IT_ADMIN' },
    update: {},
    create: { code: 'IT_ADMIN', name: 'Quản trị viên Hệ thống IT', description: 'Chịu trách nhiệm quản trị hệ thống, máy chủ và hạ tầng CNTT' }
  });
  const posITHead = await prisma.position.upsert({
    where: { code: 'IT_HEAD' },
    update: {},
    create: { code: 'IT_HEAD', name: 'Trưởng phòng CNTT', description: 'Quản lý toàn bộ hoạt động CNTT' }
  });
  const posNetEng = await prisma.position.upsert({
    where: { code: 'NET_ENG' },
    update: {},
    create: { code: 'NET_ENG', name: 'Kỹ sư Mạng & Hạ tầng', description: 'Vận hành và bảo trì mạng LAN/WAN' }
  });
  const posHeadDoctor = await prisma.position.upsert({
    where: { code: 'HEAD_DOCTOR' },
    update: {},
    create: { code: 'HEAD_DOCTOR', name: 'Trưởng khoa / Bác sĩ Trưởng', description: 'Quản lý khoa chuyên môn' }
  });
  const posDoctor = await prisma.position.upsert({
    where: { code: 'DOCTOR' },
    update: {},
    create: { code: 'DOCTOR', name: 'Bác sĩ Khám bệnh', description: 'Khám và điều trị' }
  });
  const posAccountant = await prisma.position.upsert({
    where: { code: 'ACCOUNTANT' },
    update: {},
    create: { code: 'ACCOUNTANT', name: 'Kế toán viên', description: 'Theo dõi tài chính và tài sản' }
  });

  // 3. Seed Hierarchical Departments (Cây Phòng ban đa tầng)
  console.log('🌲 Seeding Departments Tree...');
  
  // Level 1: Ban Giám Đốc
  const deptBGD = await prisma.department.upsert({
    where: { code: 'BGD' },
    update: {},
    create: { code: 'BGD', name: 'Ban Giám Đốc', level: 1, orderIndex: 1, description: 'Cấp lãnh đạo cao nhất của đơn vị' }
  });

  // Level 1: Khoa Khám Bệnh
  const deptKKB = await prisma.department.upsert({
    where: { code: 'KHOA_KB' },
    update: {},
    create: { code: 'KHOA_KB', name: 'Khoa Khám Bệnh', level: 1, orderIndex: 2, description: 'Khoa tiếp đón và khám bệnh ngoại trú' }
  });

  // Level 2: Các phòng khám trực thuộc Khoa Khám Bệnh
  const deptPK101 = await prisma.department.upsert({
    where: { code: 'PK_101' },
    update: {},
    create: { code: 'PK_101', name: 'Phòng Khám 101 - Nội Tổng Quát', parentId: deptKKB.id, level: 2, orderIndex: 1, description: 'Phòng khám nội khoa tổng quát tầng 1' }
  });

  const deptPK102 = await prisma.department.upsert({
    where: { code: 'PK_102' },
    update: {},
    create: { code: 'PK_102', name: 'Phòng Khám 102 - Ngoại Khoa', parentId: deptKKB.id, level: 2, orderIndex: 2, description: 'Phòng khám chuyên khoa ngoại tầng 1' }
  });

  const deptPK103 = await prisma.department.upsert({
    where: { code: 'PK_103' },
    update: {},
    create: { code: 'PK_103', name: 'Phòng Khám 103 - Nhi Khoa', parentId: deptKKB.id, level: 2, orderIndex: 3, description: 'Phòng khám chuyên khoa nhi tầng 1' }
  });

  // Level 1: Phòng CNTT
  const deptCNTT = await prisma.department.upsert({
    where: { code: 'PHONG_CNTT' },
    update: {},
    create: { code: 'PHONG_CNTT', name: 'Phòng Công Nghệ Thông Tin', level: 1, orderIndex: 3, description: 'Quản lý toàn bộ hệ thống CNTT và thiết bị thông tin' }
  });

  // Level 2: Các tổ trực thuộc Phòng CNTT
  const deptHTM = await prisma.department.upsert({
    where: { code: 'TO_HTM' },
    update: {},
    create: { code: 'TO_HTM', name: 'Tổ Quản trị Mạng & Hạ tầng', parentId: deptCNTT.id, level: 2, orderIndex: 1, description: 'Phụ trách máy chủ, switch, wifi, camera và máy trạm' }
  });

  const deptPMDL = await prisma.department.upsert({
    where: { code: 'TO_PMDL' },
    update: {},
    create: { code: 'TO_PMDL', name: 'Tổ Phần mềm & Dữ liệu', parentId: deptCNTT.id, level: 2, orderIndex: 2, description: 'Phụ trách phần mềm HIS/LIS/PACS và cơ sở dữ liệu' }
  });

  // Level 1: Phòng Kế Toán
  const deptTCKT = await prisma.department.upsert({
    where: { code: 'PHONG_TCKT' },
    update: {},
    create: { code: 'PHONG_TCKT', name: 'Phòng Tài Chính - Kế Toán', level: 1, orderIndex: 4, description: 'Quản lý tài chính, hạch toán và tài sản cố định' }
  });

  // 4. Seed Employees (Nhân viên)
  console.log('👤 Seeding Employees...');
  const empAdmin = await prisma.employee.upsert({
    where: { employeeCode: 'NV-IT-001' },
    update: {},
    create: {
      employeeCode: 'NV-IT-001',
      fullName: 'Nguyễn Văn Quản Trị',
      email: 'admin@assetone.vn',
      phone: '0988 123 456',
      gender: 'Nam',
      status: EmployeeStatus.ACTIVE,
      departmentId: deptHTM.id,
      positionId: posAdmin.id,
      joinDate: new Date('2022-01-15'),
    }
  });

  const empITHead = await prisma.employee.upsert({
    where: { employeeCode: 'NV-IT-002' },
    update: {},
    create: {
      employeeCode: 'NV-IT-002',
      fullName: 'Trần Thị Thu Hà',
      email: 'ha.tran@assetone.vn',
      phone: '0977 234 567',
      gender: 'Nữ',
      status: EmployeeStatus.ACTIVE,
      departmentId: deptCNTT.id,
      positionId: posITHead.id,
      joinDate: new Date('2021-03-01'),
    }
  });

  const empDoctor1 = await prisma.employee.upsert({
    where: { employeeCode: 'NV-BS-001' },
    update: {},
    create: {
      employeeCode: 'NV-BS-001',
      fullName: 'Bác sĩ Bùi Tiến Đạt',
      email: 'dat.bui@assetone.vn',
      phone: '0912 345 678',
      gender: 'Nam',
      status: EmployeeStatus.ACTIVE,
      departmentId: deptPK101.id,
      positionId: posDoctor.id,
      joinDate: new Date('2023-05-10'),
    }
  });

  const empAcc = await prisma.employee.upsert({
    where: { employeeCode: 'NV-KT-001' },
    update: {},
    create: {
      employeeCode: 'NV-KT-001',
      fullName: 'Hoàng Minh Tuấn',
      email: 'tuan.hoang@assetone.vn',
      phone: '0934 567 890',
      gender: 'Nam',
      status: EmployeeStatus.ACTIVE,
      departmentId: deptTCKT.id,
      positionId: posAccountant.id,
      joinDate: new Date('2022-08-20'),
    }
  });

  // 5. Seed Users & map with Employee
  console.log('🔐 Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { employeeId: empAdmin.id },
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      employeeId: empAdmin.id,
      isActive: true,
    }
  });

  const itStaffPasswordHash = await bcrypt.hash('123456', salt);
  await prisma.user.upsert({
    where: { username: 'ha.tran' },
    update: { employeeId: empITHead.id },
    create: {
      username: 'ha.tran',
      passwordHash: itStaffPasswordHash,
      role: UserRole.IT_STAFF,
      employeeId: empITHead.id,
      isActive: true,
    }
  });

  // 6. Seed Asset Categories (Loại tài sản)
  console.log('📦 Seeding Asset Categories...');
  await prisma.assetCategory.upsert({
    where: { code: 'CAT_PC' },
    update: {},
    create: { code: 'CAT_PC', name: 'Máy tính để bàn (Desktop PC)', prefixCode: 'PC', icon: 'Monitor', expectedLifespanMonths: 48, description: 'Máy tính để bàn văn phòng và chuyên dụng' }
  });
  await prisma.assetCategory.upsert({
    where: { code: 'CAT_LAPTOP' },
    update: {},
    create: { code: 'CAT_LAPTOP', name: 'Máy tính xách tay (Laptop)', prefixCode: 'LT', icon: 'Laptop', expectedLifespanMonths: 36, description: 'Laptop cấp cho cán bộ di chuyển và nhân viên' }
  });
  await prisma.assetCategory.upsert({
    where: { code: 'CAT_SERVER' },
    update: {},
    create: { code: 'CAT_SERVER', name: 'Máy chủ (Server)', prefixCode: 'SRV', icon: 'Server', expectedLifespanMonths: 60, description: 'Hệ thống máy chủ rackmount/tower' }
  });
  await prisma.assetCategory.upsert({
    where: { code: 'CAT_MONITOR' },
    update: {},
    create: { code: 'CAT_MONITOR', name: 'Màn hình hiển thị (Monitor)', prefixCode: 'MN', icon: 'Tv', expectedLifespanMonths: 48, description: 'Màn hình LCD/LED các kích thước' }
  });
  await prisma.assetCategory.upsert({
    where: { code: 'CAT_PRINTER' },
    update: {},
    create: { code: 'CAT_PRINTER', name: 'Máy in & Máy quét (Printer/Scanner)', prefixCode: 'PRN', icon: 'Printer', expectedLifespanMonths: 36, description: 'Máy in laser, in màu, máy quét barcode/tài liệu' }
  });
  await prisma.assetCategory.upsert({
    where: { code: 'CAT_NETWORK' },
    update: {},
    create: { code: 'CAT_NETWORK', name: 'Thiết bị Mạng (Switch, Router, AP)', prefixCode: 'NET', icon: 'Network', expectedLifespanMonths: 60, description: 'Switch mạng, Router Core, Firewall, Access Point Wifi' }
  });

  // 7. Seed Warehouses (Kho lưu trữ)
  console.log('🏬 Seeding Warehouses...');
  await prisma.warehouse.upsert({
    where: { code: 'KHO_IT' },
    update: {},
    create: {
      code: 'KHO_IT',
      name: 'Kho Thiết Bị CNTT (Tầng 2)',
      location: 'Tòa nhà A - Tầng 2 - Phòng 205',
      managerEmployeeId: empAdmin.id,
      description: 'Kho lưu trữ máy tính, linh kiện RAM, ổ cứng, card mạng sẵn sàng cấp phát'
    }
  });
  await prisma.warehouse.upsert({
    where: { code: 'KHO_TONG' },
    update: {},
    create: {
      code: 'KHO_TONG',
      name: 'Kho Tài Sản Tổng (Tầng 1)',
      location: 'Tòa nhà B - Tầng 1',
      managerEmployeeId: empITHead.id,
      description: 'Kho chứa thiết bị đóng thùng nguyên seal và thiết bị dự phòng lớn'
    }
  });
  await prisma.warehouse.upsert({
    where: { code: 'KHO_THANH_LY' },
    update: {},
    create: {
      code: 'KHO_THANH_LY',
      name: 'Kho Thiết Bị Chờ Thanh Lý & Hỏng',
      location: 'Tòa nhà B - Tầng Hầm B1',
      managerEmployeeId: empAdmin.id,
      description: 'Chứa máy móc hỏng, linh kiện lỗi chờ thủ tục thanh lý hủy'
    }
  });

  // 8. Seed Vendors (Nhà cung cấp)
  console.log('🏢 Seeding Vendors...');
  await prisma.vendor.upsert({
    where: { code: 'NCC_FPT' },
    update: {},
    create: {
      code: 'NCC_FPT',
      name: 'Công ty TNHH Hệ thống Thông tin FPT (FPT IS)',
      taxCode: '0101265897',
      phone: '024 7300 7300',
      email: 'contact@fpt-is.com',
      address: 'Tòa nhà FPT Cầu Giấy, Phố Duy Tân, Cầu Giấy, Hà Nội',
      contactPerson: 'Ông Vũ Tuấn Anh (Giám đốc Khách hàng)',
      notes: 'Nhà cung cấp máy chủ Dell/HP và giải pháp mạng bảo mật'
    }
  });
  await prisma.vendor.upsert({
    where: { code: 'NCC_DGW' },
    update: {},
    create: {
      code: 'NCC_DGW',
      name: 'Công ty Cổ phần Thế Giới Số (Digiworld)',
      taxCode: '0302888765',
      phone: '028 3929 0059',
      email: 'info@digiworld.com.vn',
      address: '195 Cô Bắc, Phường Cô Giang, Quận 1, TP. Hồ Chí Minh',
      contactPerson: 'Bà Nguyễn Thị Mai (Phụ trách Kênh Doanh nghiệp)',
      notes: 'Phân phối Laptop Dell, HP, ThinkPad chính hãng'
    }
  });
  await prisma.vendor.upsert({
    where: { code: 'NCC_PHONGVU' },
    update: {},
    create: {
      code: 'NCC_PHONGVU',
      name: 'Công ty Cổ phần Thương Mại - Dịch Vụ Phong Vũ',
      taxCode: '0304998811',
      phone: '1800 6867',
      email: 'cskh@phongvu.vn',
      address: 'Tầng 11, Tòa nhà Viettel, 285 Cách Mạng Tháng 8, P.12, Q.10, TP.HCM',
      contactPerson: 'Anh Lê Minh Quân (Sales Doanh nghiệp)',
      notes: 'Cung cấp linh kiện máy tính, RAM, SSD, màn hình văn phòng'
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('🔑 Default Admin Login:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
