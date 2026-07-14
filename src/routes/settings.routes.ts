import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updatePasswordSchema } from '../validators/settings.validator';

const router = Router();

router.get('/', settingsController.getSettings);
router.get('/users', authorize(['admin']), settingsController.listUsers);
router.post('/users', authorize(['admin']), validate(createUserSchema), settingsController.createUser);
router.delete('/users/:id', authorize(['admin']), settingsController.deleteUser);
router.put('/users/:id/password', authorize(['admin']), validate(updatePasswordSchema), settingsController.updatePassword);

export default router;
