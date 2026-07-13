import { Router } from 'express';
import { appStatusController } from '../controllers/app-status.controller';

const router = Router();

router.get('/status', appStatusController.getAppStatus);

export default router;
