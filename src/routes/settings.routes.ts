import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updatePasswordSchema } from '../validators/settings.validator';

const router = Router();

router.get('/', settingsController.getSettings);
router.get('/users', settingsController.listUsers);
router.post('/users', validate(createUserSchema), settingsController.createUser);
router.delete('/users/:id', settingsController.deleteUser);
router.put('/users/:id/password', validate(updatePasswordSchema), settingsController.updatePassword);

export default router;
