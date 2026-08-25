import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// GET /api/asset-categories
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const categories = await prisma.assetCategory.findMany({
      include: {
        _count: { select: { assets: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

// POST /api/asset-categories
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { code, name, prefixCode, icon, expectedLifespanMonths, description } = req.body;

    if (!code || !name) {
      res.status(400).json({ success: false, message: 'Mã loại tài sản và Tên loại tài sản là bắt buộc.' });
      return;
    }

    const existing = await prisma.assetCategory.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (existing) {
      res.status(400).json({ success: false, message: `Mã loại tài sản '${code}' đã tồn tại.` });
      return;
    }

    const cat = await prisma.assetCategory.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        prefixCode: (prefixCode || 'ASSET').trim().toUpperCase(),
        icon: icon || 'Monitor',
        expectedLifespanMonths: Number(expectedLifespanMonths) || 36,
        description: description?.trim() || null,
      },
      include: {
        _count: { select: { assets: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Tạo loại tài sản thành công!', data: cat });
  } catch (error) {
    next(error);
  }
});

// PUT /api/asset-categories/:id
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { code, name, prefixCode, icon, expectedLifespanMonths, description } = req.body;

    const cat = await prisma.assetCategory.findUnique({ where: { id } });
    if (!cat) {
      res.status(404).json({ success: false, message: 'Loại tài sản không tồn tại.' });
      return;
    }

    if (code && code.trim().toUpperCase() !== cat.code) {
      const existing = await prisma.assetCategory.findUnique({ where: { code: code.trim().toUpperCase() } });
      if (existing) {
        res.status(400).json({ success: false, message: `Mã loại tài sản '${code}' đã tồn tại.` });
        return;
      }
    }

    const updated = await prisma.assetCategory.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        name: name ? name.trim() : undefined,
        prefixCode: prefixCode ? prefixCode.trim().toUpperCase() : undefined,
        icon: icon !== undefined ? icon : undefined,
        expectedLifespanMonths: expectedLifespanMonths !== undefined ? Number(expectedLifespanMonths) : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
      },
      include: {
        _count: { select: { assets: true } }
      }
    });

    res.json({ success: true, message: 'Cập nhật loại tài sản thành công!', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/asset-categories/:id
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const cat = await prisma.assetCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { assets: true } }
      }
    });

    if (!cat) {
      res.status(404).json({ success: false, message: 'Loại tài sản không tồn tại.' });
      return;
    }

    if (cat._count.assets > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa loại tài sản '${cat.name}' vì đang có ${cat._count.assets} tài sản thuộc loại này.`
      });
      return;
    }

    await prisma.assetCategory.delete({ where: { id } });
    res.json({ success: true, message: `Đã xóa loại tài sản '${cat.name}' thành công.` });
  } catch (error) {
    next(error);
  }
});

export default router;
