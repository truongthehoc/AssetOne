import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Helper function to build tree from flat list
function buildDepartmentTree(items: any[], parentId: string | null = null): any[] {
  return items
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(item => ({
      ...item,
      children: buildDepartmentTree(items, item.id),
    }));
}

// GET /api/departments/tree - Get full hierarchical tree
router.get('/tree', async (req: Request, res: Response, next) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            employees: true,
            children: true,
            assets: true,
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { orderIndex: 'asc' },
        { name: 'asc' },
      ]
    });

    const tree = buildDepartmentTree(departments, null);
    res.json({ success: true, data: tree, rawList: departments });
  } catch (error) {
    next(error);
  }
});

// GET /api/departments - Flat list
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        parent: true,
        _count: {
          select: {
            employees: true,
            children: true,
            assets: true,
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { orderIndex: 'asc' },
        { name: 'asc' },
      ]
    });

    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
});

// GET /api/departments/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: {
        parent: true,
        children: true,
        employees: {
          include: { position: true },
        },
        _count: {
          select: {
            employees: true,
            children: true,
            assets: true,
          }
        }
      }
    });

    if (!department) {
      res.status(404).json({ success: false, message: 'Phòng ban không tồn tại.' });
      return;
    }

    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
});

// POST /api/departments - Create new
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { code, name, parentId, orderIndex, description } = req.body;

    if (!code || !name) {
      res.status(400).json({ success: false, message: 'Mã phòng ban và Tên phòng ban là bắt buộc.' });
      return;
    }

    // Check duplicate code
    const existing = await prisma.department.findUnique({ where: { code } });
    if (existing) {
      res.status(400).json({ success: false, message: `Mã phòng ban '${code}' đã tồn tại.` });
      return;
    }

    let level = 1;
    if (parentId) {
      const parent = await prisma.department.findUnique({ where: { id: parentId } });
      if (!parent) {
        res.status(400).json({ success: false, message: 'Phòng ban cha không tồn tại.' });
        return;
      }
      level = parent.level + 1;
    }

    const newDept = await prisma.department.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        parentId: parentId || null,
        level,
        orderIndex: Number(orderIndex) || 0,
        description: description?.trim() || null,
      },
      include: {
        parent: true,
        _count: {
          select: { employees: true, children: true, assets: true }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Tạo phòng ban thành công!', data: newDept });
  } catch (error) {
    next(error);
  }
});

// PUT /api/departments/:id - Update
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { code, name, parentId, orderIndex, description } = req.body;

    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      res.status(404).json({ success: false, message: 'Phòng ban không tồn tại.' });
      return;
    }

    // Prevent selecting itself as parent
    if (parentId === id) {
      res.status(400).json({ success: false, message: 'Một phòng ban không thể là phòng ban cha của chính nó.' });
      return;
    }

    // Prevent circular reference (setting child as parent)
    if (parentId) {
      const allDepts = await prisma.department.findMany();
      const getDescendantIds = (targetId: string): string[] => {
        const children = allDepts.filter(d => d.parentId === targetId);
        return children.reduce((acc: string[], child) => [...acc, child.id, ...getDescendantIds(child.id)], []);
      };

      const descendantIds = getDescendantIds(id);
      if (descendantIds.includes(parentId)) {
        res.status(400).json({ success: false, message: 'Không thể chọn phòng ban con/cháu làm phòng ban cha (Lỗi vòng lặp quan hệ).' });
        return;
      }
    }

    // Check duplicate code if changed
    if (code && code.trim().toUpperCase() !== dept.code) {
      const existing = await prisma.department.findUnique({ where: { code: code.trim().toUpperCase() } });
      if (existing) {
        res.status(400).json({ success: false, message: `Mã phòng ban '${code}' đã tồn tại.` });
        return;
      }
    }

    let level = 1;
    if (parentId) {
      const parent = await prisma.department.findUnique({ where: { id: parentId } });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        name: name ? name.trim() : undefined,
        parentId: parentId !== undefined ? (parentId || null) : undefined,
        level,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
      },
      include: {
        parent: true,
        _count: {
          select: { employees: true, children: true, assets: true }
        }
      }
    });

    res.json({ success: true, message: 'Cập nhật phòng ban thành công!', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/departments/:id - Strict relational check
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const dept = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            employees: true,
            assets: true,
          }
        }
      }
    });

    if (!dept) {
      res.status(404).json({ success: false, message: 'Phòng ban không tồn tại.' });
      return;
    }

    // Check if it has children
    if (dept._count.children > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa phòng ban '${dept.name}' vì đang có ${dept._count.children} phòng ban con trực thuộc. Vui lòng chuyển hoặc xóa các phòng ban con trước.`
      });
      return;
    }

    // Check if it has employees
    if (dept._count.employees > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa phòng ban '${dept.name}' vì đang có ${dept._count.employees} nhân viên trực thuộc. Vui lòng điều chuyển nhân viên trước khi xóa.`
      });
      return;
    }

    // Check if it has assets
    if (dept._count.assets > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa phòng ban '${dept.name}' vì đang có ${dept._count.assets} tài sản gán cho phòng ban này.`
      });
      return;
    }

    await prisma.department.delete({ where: { id } });

    res.json({ success: true, message: `Đã xóa phòng ban '${dept.name}' thành công.` });
  } catch (error) {
    next(error);
  }
});

export default router;
