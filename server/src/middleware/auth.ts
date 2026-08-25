import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    employeeId: string | null;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'assetone_super_secret_jwt_key_2026';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để truy cập hệ thống.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          }
        }
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Tài khoản không hợp lệ hoặc đã bị khóa.' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
    };

    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện chức năng này.' });
      return;
    }
    next();
  };
};
