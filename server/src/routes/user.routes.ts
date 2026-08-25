import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();
router.use(authenticateToken);

// GET /api/users - List all users
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/', requireRoles(['ADMIN']), async (req: Request, res: Response, next) => {
  try {
    const { username, password, role, employeeId, isActive } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Tên đăng nhập và Mật khẩu là bắt buộc.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() }
    });
    if (existingUser) {
      res.status(400).json({ success: false, message: `Tên đăng nhập '${username}' đã tồn tại.` });
      return;
    }

    if (employeeId) {
      const emp = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: true }
      });

      if (!emp) {
        res.status(400).json({ success: false, message: 'Nhân viên được chọn không tồn tại.' });
        return;
      }

      if (emp.user) {
        res.status(400).json({
          success: false,
          message: `Nhân viên '${emp.fullName}' đã được gán cho tài khoản '${emp.user.username}'.`
        });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        passwordHash,
        role: (role as UserRole) || UserRole.IT_STAFF,
        employeeId: employeeId || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Tạo tài khoản người dùng thành công!', data: newUser });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', requireRoles(['ADMIN']), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { password, role, employeeId, isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      return;
    }

    // Check employee mapping uniqueness if changed
    if (employeeId && employeeId !== user.employeeId) {
      const emp = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: true }
      });

      if (!emp) {
        res.status(400).json({ success: false, message: 'Nhân viên không tồn tại.' });
        return;
      }

      if (emp.user && emp.user.id !== id) {
        res.status(400).json({
          success: false,
          message: `Nhân viên '${emp.fullName}' đã được liên kết với tài khoản '${emp.user.username}'.`
        });
        return;
      }
    }

    let passwordHash: string | undefined = undefined;
    if (password && password.trim()) {
      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        role: role ? (role as UserRole) : undefined,
        employeeId: employeeId !== undefined ? (employeeId || null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      }
    });

    res.json({ success: true, message: 'Cập nhật tài khoản thành công!', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireRoles(['ADMIN']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      return;
    }

    if (user.username === 'admin') {
      res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên mặc định (admin).' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: `Đã xóa tài khoản '${user.username}' thành công.` });
  } catch (error) {
    next(error);
  }
});

export default router;
