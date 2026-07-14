import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

router.get('/users', authenticate, authController.listUsers);
router.post('/login', validate(loginSchema), authController.login);

export default router;
