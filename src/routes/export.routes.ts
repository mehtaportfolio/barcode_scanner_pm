import { Router } from 'express';
import { exportController } from '../controllers/export.controller';
import { validateParams } from '../middleware/validation.middleware';
import { containerIdParamSchema } from '../validators/container.validator';

const router = Router();

router.get('/history', exportController.historyBarcodes);
router.get('/:id', validateParams(containerIdParamSchema), exportController.containerBarcodes);

export default router;
