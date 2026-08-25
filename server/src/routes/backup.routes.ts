import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { BackupType, BackupStatus } from '@prisma/client';

const router = Router();
router.use(authenticateToken);

const BACKUP_DIR = path.join(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// GET /api/backup/logs - List all backups
router.get('/logs', async (req: Request, res: Response, next) => {
  try {
    const logs = await prisma.backupLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const serializedLogs = logs.map(log => ({
      ...log,
      fileSize: Number(log.fileSize),
    }));

    res.json({ success: true, data: serializedLogs });
  } catch (error) {
    next(error);
  }
});

// POST /api/backup/create - Create instant manual backup
router.post('/create', requireRoles(['ADMIN']), async (req: Request, res: Response, next) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `assetone_backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Export all data from database
    const [
      departments,
      positions,
      employees,
      users,
      assetCategories,
      warehouses,
      vendors,
      systemSettings,
      assets,
      handoverRecords,
      maintenanceLogs,
    ] = await Promise.all([
      prisma.department.findMany(),
      prisma.position.findMany(),
      prisma.employee.findMany(),
      prisma.user.findMany({ select: { id: true, username: true, role: true, employeeId: true, isActive: true, avatarUrl: true, createdAt: true } }),
      prisma.assetCategory.findMany(),
      prisma.warehouse.findMany(),
      prisma.vendor.findMany(),
      prisma.systemSetting.findMany(),
      prisma.asset.findMany(),
      prisma.handoverRecord.findMany(),
      prisma.maintenanceLog.findMany(),
    ]);

    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        departments,
        positions,
        employees,
        users,
        assetCategories,
        warehouses,
        vendors,
        systemSettings,
        assets,
        handoverRecords,
        maintenanceLogs,
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(filepath, jsonString, 'utf-8');
    const stats = fs.statSync(filepath);

    const backupLog = await prisma.backupLog.create({
      data: {
        filename,
        fileSize: BigInt(stats.size),
        type: BackupType.MANUAL,
        status: BackupStatus.SUCCESS,
        notes: `Sao lưu toàn bộ hệ thống (${Object.keys(backupData.data).length} bảng dữ liệu).`,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bản sao lưu dữ liệu thành công!',
      data: {
        ...backupLog,
        fileSize: Number(backupLog.fileSize),
      }
    });
  } catch (error: any) {
    console.error('Backup error:', error);
    await prisma.backupLog.create({
      data: {
        filename: 'failed_backup.json',
        fileSize: BigInt(0),
        type: BackupType.MANUAL,
        status: BackupStatus.FAILED,
        notes: error.message || 'Lỗi không xác định khi tạo sao lưu.',
      }
    }).catch(() => {});

    next(error);
  }
});

// GET /api/backup/download/:filename
router.get('/download/:filename', requireRoles(['ADMIN']), (req: Request, res: Response) => {
  const { filename } = req.params;
  const filepath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filepath)) {
    res.status(404).json({ success: false, message: 'File sao lưu không tồn tại trên máy chủ.' });
    return;
  }

  res.download(filepath, filename);
});

// POST /api/backup/restore - Restore from backup JSON
router.post('/restore', requireRoles(['ADMIN']), async (req: Request, res: Response, next) => {
  try {
    const { backupContent } = req.body;

    if (!backupContent || !backupContent.data) {
      res.status(400).json({ success: false, message: 'Nội dung file sao lưu không hợp lệ.' });
      return;
    }

    const {
      departments,
      positions,
      assetCategories,
      warehouses,
      vendors,
      systemSettings,
    } = backupContent.data;

    // Restore master settings
    if (systemSettings && Array.isArray(systemSettings)) {
      for (const item of systemSettings) {
        await prisma.systemSetting.upsert({
          where: { key: item.key },
          create: { key: item.key, value: item.value, group: item.group },
          update: { value: item.value, group: item.group },
        });
      }
    }

    // Restore positions
    if (positions && Array.isArray(positions)) {
      for (const pos of positions) {
        await prisma.position.upsert({
          where: { id: pos.id },
          create: { id: pos.id, code: pos.code, name: pos.name, description: pos.description },
          update: { code: pos.code, name: pos.name, description: pos.description },
        });
      }
    }

    // Restore asset categories
    if (assetCategories && Array.isArray(assetCategories)) {
      for (const cat of assetCategories) {
        await prisma.assetCategory.upsert({
          where: { id: cat.id },
          create: {
            id: cat.id,
            code: cat.code,
            name: cat.name,
            prefixCode: cat.prefixCode || 'ASSET',
            icon: cat.icon || 'Monitor',
            expectedLifespanMonths: cat.expectedLifespanMonths || 36,
            description: cat.description,
          },
          update: {
            code: cat.code,
            name: cat.name,
            prefixCode: cat.prefixCode,
            icon: cat.icon,
            expectedLifespanMonths: cat.expectedLifespanMonths,
            description: cat.description,
          },
        });
      }
    }

    res.json({ success: true, message: 'Khôi phục dữ liệu từ bản sao lưu thành công!' });
  } catch (error) {
    next(error);
  }
});

export default router;
