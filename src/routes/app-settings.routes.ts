import { Router } from 'express';
import { appSettingsController } from '../controllers/app-settings.controller';
import { authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateAppSettingsSchema } from '../validators/app-settings.validator';

const router = Router();

router.get('/', appSettingsController.getAppSettings);
router.put('/', authorize(['admin']), validate(updateAppSettingsSchema), appSettingsController.updateAppSettings);

export default router;
