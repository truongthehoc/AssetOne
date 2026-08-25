import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// GET /api/warehouses
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        managerEmployee: {
          include: { department: true, position: true }
        },
        _count: { select: { assets: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: warehouses });
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouses
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { code, name, location, managerEmployeeId, description } = req.body;

    if (!code || !name) {
      res.status(400).json({ success: false, message: 'Mã kho và Tên kho là bắt buộc.' });
      return;
    }

    const existing = await prisma.warehouse.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (existing) {
      res.status(400).json({ success: false, message: `Mã kho '${code}' đã tồn tại.` });
      return;
    }

    if (managerEmployeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: managerEmployeeId } });
      if (!emp) {
        res.status(400).json({ success: false, message: 'Nhân viên quản lý kho không tồn tại.' });
        return;
      }
    }

    const wh = await prisma.warehouse.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        location: location?.trim() || null,
        managerEmployeeId: managerEmployeeId || null,
        description: description?.trim() || null,
      },
      include: {
        managerEmployee: {
          include: { department: true, position: true }
        },
        _count: { select: { assets: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Tạo kho lưu trữ thành công!', data: wh });
  } catch (error) {
    next(error);
  }
});

// PUT /api/warehouses/:id
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { code, name, location, managerEmployeeId, description } = req.body;

    const wh = await prisma.warehouse.findUnique({ where: { id } });
    if (!wh) {
      res.status(404).json({ success: false, message: 'Kho lưu trữ không tồn tại.' });
      return;
    }

    if (code && code.trim().toUpperCase() !== wh.code) {
      const existing = await prisma.warehouse.findUnique({ where: { code: code.trim().toUpperCase() } });
      if (existing) {
        res.status(400).json({ success: false, message: `Mã kho '${code}' đã tồn tại.` });
        return;
      }
    }

    if (managerEmployeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: managerEmployeeId } });
      if (!emp) {
        res.status(400).json({ success: false, message: 'Nhân viên quản lý kho không tồn tại.' });
        return;
      }
    }

    const updated = await prisma.warehouse.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        name: name ? name.trim() : undefined,
        location: location !== undefined ? (location?.trim() || null) : undefined,
        managerEmployeeId: managerEmployeeId !== undefined ? (managerEmployeeId || null) : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
      },
      include: {
        managerEmployee: {
          include: { department: true, position: true }
        },
        _count: { select: { assets: true } }
      }
    });

    res.json({ success: true, message: 'Cập nhật kho thành công!', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/warehouses/:id
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const wh = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: { select: { assets: true } }
      }
    });

    if (!wh) {
      res.status(404).json({ success: false, message: 'Kho không tồn tại.' });
      return;
    }

    if (wh._count.assets > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa kho '${wh.name}' vì đang có ${wh._count.assets} tài sản lưu trữ trong kho này.`
      });
      return;
    }

    await prisma.warehouse.delete({ where: { id } });
    res.json({ success: true, message: `Đã xóa kho '${wh.name}' thành công.` });
  } catch (error) {
    next(error);
  }
});

export default router;
