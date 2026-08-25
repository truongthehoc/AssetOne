import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import departmentRoutes from './routes/department.routes.js';
import positionRoutes from './routes/position.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import assetCategoryRoutes from './routes/assetCategory.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import userRoutes from './routes/user.routes.js';
import settingRoutes from './routes/setting.routes.js';
import backupRoutes from './routes/backup.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AssetOne ITAM Server',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/asset-categories', assetCategoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/backup', backupRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 AssetOne Server running on http://localhost:${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/health`);
});
