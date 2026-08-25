import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'assetone_super_secret_jwt_key_2026';

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        token,
        user: userWithoutPassword,
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      return;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Vui lòng điền mật khẩu hiện tại và mật khẩu mới.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    const { avatarUrl, phone, fullName } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { employee: true }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      return;
    }

    // Update avatar on User
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl },
    });

    // Update employee info if mapped
    if (user.employeeId) {
      await prisma.employee.update({
        where: { id: user.employeeId },
        data: {
          fullName: fullName || undefined,
          phone: phone !== undefined ? phone : undefined,
        }
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser!;
    res.json({ success: true, message: 'Cập nhật thông tin thành công!', data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
});

export default router;
