import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { EmployeeStatus } from '@prisma/client';

const router = Router();
router.use(authenticateToken);

// GET /api/employees - List with filters
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { departmentId, positionId, status, search } = req.query;

    const where: any = {};

    if (departmentId) {
      where.departmentId = String(departmentId);
    }

    if (positionId) {
      where.positionId = String(positionId);
    }

    if (status) {
      where.status = status as EmployeeStatus;
    }

    if (search) {
      const q = String(search);
      where.OR = [
        { fullName: { contains: q } },
        { employeeCode: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        position: true,
        user: {
          select: { id: true, username: true, role: true, isActive: true }
        },
        _count: {
          select: {
            assignedAssets: true,
            managedWarehouses: true,
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        position: true,
        user: {
          select: { id: true, username: true, role: true, isActive: true, lastLoginAt: true }
        },
        assignedAssets: {
          include: { category: true }
        },
        managedWarehouses: true,
      }
    });

    if (!employee) {
      res.status(404).json({ success: false, message: 'Nhân viên không tồn tại.' });
      return;
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
});

// POST /api/employees
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { employeeCode, fullName, email, phone, gender, status, departmentId, positionId, joinDate } = req.body;

    if (!employeeCode || !fullName || !departmentId || !positionId) {
      res.status(400).json({ success: false, message: 'Mã NV, Họ tên, Phòng ban và Chức vụ là bắt buộc.' });
      return;
    }

    // Check code unique
    const existingCode = await prisma.employee.findUnique({
      where: { employeeCode: employeeCode.trim().toUpperCase() }
    });
    if (existingCode) {
      res.status(400).json({ success: false, message: `Mã nhân viên '${employeeCode}' đã tồn tại.` });
      return;
    }

    // Check email unique if provided
    if (email && email.trim()) {
      const existingEmail = await prisma.employee.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (existingEmail) {
        res.status(400).json({ success: false, message: `Email '${email}' đã được sử dụng bởi nhân viên khác.` });
        return;
      }
    }

    // Verify department exists
    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) {
      res.status(400).json({ success: false, message: 'Phòng ban được chọn không tồn tại.' });
      return;
    }

    // Verify position exists
    const pos = await prisma.position.findUnique({ where: { id: positionId } });
    if (!pos) {
      res.status(400).json({ success: false, message: 'Chức vụ được chọn không tồn tại.' });
      return;
    }

    const newEmp = await prisma.employee.create({
      data: {
        employeeCode: employeeCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        email: email?.trim().toLowerCase() || null,
        phone: phone?.trim() || null,
        gender: gender || null,
        status: (status as EmployeeStatus) || EmployeeStatus.ACTIVE,
        departmentId,
        positionId,
        joinDate: joinDate ? new Date(joinDate) : null,
      },
      include: {
        department: true,
        position: true,
        user: true,
      }
    });

    res.status(201).json({ success: true, message: 'Thêm mới nhân viên thành công!', data: newEmp });
  } catch (error) {
    next(error);
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { employeeCode, fullName, email, phone, gender, status, departmentId, positionId, joinDate } = req.body;

    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) {
      res.status(404).json({ success: false, message: 'Nhân viên không tồn tại.' });
      return;
    }

    // Check code if changed
    if (employeeCode && employeeCode.trim().toUpperCase() !== emp.employeeCode) {
      const existingCode = await prisma.employee.findUnique({
        where: { employeeCode: employeeCode.trim().toUpperCase() }
      });
      if (existingCode) {
        res.status(400).json({ success: false, message: `Mã nhân viên '${employeeCode}' đã tồn tại.` });
        return;
      }
    }

    // Check email if changed
    if (email && email.trim().toLowerCase() !== emp.email) {
      const existingEmail = await prisma.employee.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (existingEmail) {
        res.status(400).json({ success: false, message: `Email '${email}' đã được sử dụng bởi nhân viên khác.` });
        return;
      }
    }

    // Verify dept if changed
    if (departmentId && departmentId !== emp.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!dept) {
        res.status(400).json({ success: false, message: 'Phòng ban không tồn tại.' });
        return;
      }
    }

    // Verify pos if changed
    if (positionId && positionId !== emp.positionId) {
      const pos = await prisma.position.findUnique({ where: { id: positionId } });
      if (!pos) {
        res.status(400).json({ success: false, message: 'Chức vụ không tồn tại.' });
        return;
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        employeeCode: employeeCode ? employeeCode.trim().toUpperCase() : undefined,
        fullName: fullName ? fullName.trim() : undefined,
        email: email !== undefined ? (email ? email.trim().toLowerCase() : null) : undefined,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
        gender: gender !== undefined ? gender : undefined,
        status: status ? (status as EmployeeStatus) : undefined,
        departmentId: departmentId || undefined,
        positionId: positionId || undefined,
        joinDate: joinDate !== undefined ? (joinDate ? new Date(joinDate) : null) : undefined,
      },
      include: {
        department: true,
        position: true,
        user: true,
      }
    });

    res.json({ success: true, message: 'Cập nhật thông tin nhân viên thành công!', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/employees/:id - Strict relational check
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const emp = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        managedWarehouses: true,
        assignedAssets: true,
        _count: {
          select: {
            fromHandovers: true,
            toHandovers: true,
          }
        }
      }
    });

    if (!emp) {
      res.status(404).json({ success: false, message: 'Nhân viên không tồn tại.' });
      return;
    }

    if (emp.user) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa nhân viên '${emp.fullName}' vì đang được liên kết với tài khoản người dùng '${emp.user.username}'. Vui lòng hủy liên kết hoặc xóa tài khoản trước.`
      });
      return;
    }

    if (emp.assignedAssets.length > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa nhân viên '${emp.fullName}' vì đang giữ ${emp.assignedAssets.length} tài sản. Vui lòng làm thủ tục thu hồi tài sản trước khi xóa.`
      });
      return;
    }

    if (emp.managedWarehouses.length > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa nhân viên '${emp.fullName}' vì đang là thủ kho của ${emp.managedWarehouses.length} kho. Vui lòng chuyển giao quyền quản lý kho trước.`
      });
      return;
    }

    await prisma.employee.delete({ where: { id } });

    res.json({ success: true, message: `Đã xóa nhân viên '${emp.fullName}' thành công.` });
  } catch (error) {
    next(error);
  }
});

export default router;
