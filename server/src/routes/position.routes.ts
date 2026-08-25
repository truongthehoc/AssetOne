import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// GET /api/positions - List all positions
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const positions = await prisma.position.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: positions });
  } catch (error) {
    next(error);
  }
});

// GET /api/positions/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const position = await prisma.position.findUnique({
      where: { id: req.params.id },
      include: {
        employees: {
          include: { department: true }
        },
        _count: {
          select: { employees: true }
        }
      }
    });

    if (!position) {
      res.status(404).json({ success: false, message: 'Chức danh / Chức vụ không tồn tại.' });
      return;
    }

    res.json({ success: true, data: position });
  } catch (error) {
    next(error);
  }
});

// POST /api/positions
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name) {
      res.status(400).json({ success: false, message: 'Mã chức vụ và Tên chức vụ là bắt buộc.' });
      return;
    }

    const existing = await prisma.position.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (existing) {
      res.status(400).json({ success: false, message: `Mã chức vụ '${code}' đã tồn tại.` });
      return;
    }

    const position = await prisma.position.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
      },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Tạo chức vụ thành công!', data: position });
  } catch (error) {
    next(error);
  }
});

// PUT /api/positions/:id
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;

    const pos = await prisma.position.findUnique({ where: { id } });
    if (!pos) {
      res.status(404).json({ success: false, message: 'Chức danh / Chức vụ không tồn tại.' });
      return;
    }

    if (code && code.trim().toUpperCase() !== pos.code) {
      const existing = await prisma.position.findUnique({ where: { code: code.trim().toUpperCase() } });
      if (existing) {
        res.status(400).json({ success: false, message: `Mã chức vụ '${code}' đã tồn tại.` });
        return;
      }
    }

    const updated = await prisma.position.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        name: name ? name.trim() : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
      },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    res.json({ success: true, message: 'Cập nhật chức vụ thành công!', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/positions/:id - Check employee assignment
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const pos = await prisma.position.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    if (!pos) {
      res.status(404).json({ success: false, message: 'Chức vụ không tồn tại.' });
      return;
    }

    if (pos._count.employees > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa chức vụ '${pos.name}' vì đang có ${pos._count.employees} nhân viên giữ chức vụ này. Vui lòng cập nhật chức vụ cho nhân viên trước.`
      });
      return;
    }

    await prisma.position.delete({ where: { id } });

    res.json({ success: true, message: `Đã xóa chức vụ '${pos.name}' thành công.` });
  } catch (error) {
    next(error);
  }
});

export default router;
