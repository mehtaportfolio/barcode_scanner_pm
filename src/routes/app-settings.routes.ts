import { Router } from 'express';
import { appSettingsController } from '../controllers/app-settings.controller';
import { validate } from '../middleware/validation.middleware';
import { updateAppSettingsSchema } from '../validators/app-settings.validator';

const router = Router();

router.get('/', appSettingsController.getAppSettings);
router.put('/', validate(updateAppSettingsSchema), appSettingsController.updateAppSettings);

export default router;
