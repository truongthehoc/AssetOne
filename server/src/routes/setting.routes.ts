import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// GET /api/settings - Get all settings grouped
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Group into an object
    const result: Record<string, any> = {};
    for (const item of settings) {
      if (!result[item.group]) {
        result[item.group] = {};
      }
      try {
        result[item.group][item.key] = JSON.parse(item.value);
      } catch {
        result[item.group][item.key] = item.value;
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/settings/:group
router.get('/:group', async (req: Request, res: Response, next) => {
  try {
    const { group } = req.params;
    const settings = await prisma.systemSetting.findMany({
      where: { group }
    });

    const result: Record<string, any> = {};
    for (const item of settings) {
      try {
        result[item.key] = JSON.parse(item.value);
      } catch {
        result[item.key] = item.value;
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// PUT /api/settings/:group - Update settings in a group (Admin only)
router.put('/:group', requireRoles(['ADMIN']), async (req: Request, res: Response, next) => {
  try {
    const { group } = req.params;
    const payload = req.body; // Key-value dictionary

    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ success: false, message: 'Dữ liệu cấu hình không hợp lệ.' });
      return;
    }

    const updates = Object.entries(payload).map(([key, val]) => {
      const stringValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return prisma.systemSetting.upsert({
        where: { key },
        create: {
          key,
          value: stringValue,
          group,
        },
        update: {
          value: stringValue,
          group,
        }
      });
    });

    await prisma.$transaction(updates);

    res.json({ success: true, message: 'Lưu cấu hình hệ thống thành công!' });
  } catch (error) {
    next(error);
  }
});

export default router;
