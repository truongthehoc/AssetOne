import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// GET /api/vendors
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: { select: { assets: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
});

// POST /api/vendors
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { code, name, taxCode, phone, email, address, contactPerson, notes } = req.body;

    if (!code || !name) {
      res.status(400).json({ success: false, message: 'Mã nhà cung cấp và Tên nhà cung cấp là bắt buộc.' });
      return;
    }

    const existing = await prisma.vendor.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (existing) {
      res.status(400).json({ success: false, message: `Mã nhà cung cấp '${code}' đã tồn tại.` });
      return;
    }

    const vendor = await prisma.vendor.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        taxCode: taxCode?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        address: address?.trim() || null,
        contactPerson: contactPerson?.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        _count: { select: { assets: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Tạo nhà cung cấp thành công!', data: vendor });
  } catch (error) {
    next(error);
  }
});

// PUT /api/vendors/:id
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { code, name, taxCode, phone, email, address, contactPerson, notes } = req.body;

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      res.status(404).json({ success: false, message: 'Nhà cung cấp không tồn tại.' });
      return;
    }

    if (code && code.trim().toUpperCase() !== vendor.code) {
      const existing = await prisma.vendor.findUnique({ where: { code: code.trim().toUpperCase() } });
      if (existing) {
        res.status(400).json({ success: false, message: `Mã nhà cung cấp '${code}' đã tồn tại.` });
        return;
      }
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        name: name ? name.trim() : undefined,
        taxCode: taxCode !== undefined ? (taxCode?.trim() || null) : undefined,
        phone: phone !== undefined ? (phone?.trim() || null) : undefined,
        email: email !== undefined ? (email?.trim().toLowerCase() || null) : undefined,
        address: address !== undefined ? (address?.trim() || null) : undefined,
        contactPerson: contactPerson !== undefined ? (contactPerson?.trim() || null) : undefined,
        notes: notes !== undefined ? (notes?.trim() || null) : undefined,
      },
      include: {
        _count: { select: { assets: true } }
      }
    });

    res.json({ success: true, message: 'Cập nhật nhà cung cấp thành công!', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vendors/:id
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        _count: { select: { assets: true } }
      }
    });

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Nhà cung cấp không tồn tại.' });
      return;
    }

    if (vendor._count.assets > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa nhà cung cấp '${vendor.name}' vì đang có ${vendor._count.assets} tài sản liên kết với nhà cung cấp này.`
      });
      return;
    }

    await prisma.vendor.delete({ where: { id } });
    res.json({ success: true, message: `Đã xóa nhà cung cấp '${vendor.name}' thành công.` });
  } catch (error) {
    next(error);
  }
});

export default router;
