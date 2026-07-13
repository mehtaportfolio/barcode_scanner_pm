import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { API_PREFIX } from '../utils/constants';
import appSettingsRoutes from './app-settings.routes';
import appStatusRoutes from './app-status.routes';
import authRoutes from './auth.routes';
import barcodeRoutes from './barcode.routes';
import containerRoutes from './container.routes';
import settingsRoutes from './settings.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.send('Container Scanner Backend Running');
});

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

router.use(`${API_PREFIX}/app`, appStatusRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/app-settings`, authenticate, appSettingsRoutes);
router.use(`${API_PREFIX}/containers`, authenticate, containerRoutes);
router.use(`${API_PREFIX}/barcodes`, authenticate, barcodeRoutes);
router.use(`${API_PREFIX}/settings`, authenticate, settingsRoutes);

export default router;
