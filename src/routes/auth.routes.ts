import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

// Public endpoint used by the login screen to list available usernames.
// Authentication is not required because this resource is used before sign-in.
router.get('/users', authController.listUsers);
router.post('/login', validate(loginSchema), authController.login);

export default router;
