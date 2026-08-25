import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Server Error:', err);

  // Prisma foreign key constraint violation error (P2003)
  if (err.code === 'P2003') {
    res.status(400).json({
      success: false,
      message: 'Không thể thực hiện thao tác do ràng buộc quan hệ dữ liệu đang tồn tại (Ví dụ: dữ liệu con hoặc nhân viên/tài sản liên kết đang sử dụng).',
      error: err.meta,
    });
    return;
  }

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const fields = (err.meta?.target as string[]) || [];
    res.status(400).json({
      success: false,
      message: `Giá trị '${fields.join(', ')}' đã tồn tại trong hệ thống, vui lòng nhập mã/tên khác.`,
      error: err.meta,
    });
    return;
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Bản ghi không tồn tại hoặc đã bị xóa.',
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
  });
};
