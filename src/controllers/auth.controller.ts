import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/response';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    res.json(successResponse(result, 'Login successful.'));
  },

  async listUsers(_req: Request, res: Response): Promise<void> {
    console.log('[AUTH] GET /api/auth/users request received');
    const result = await authService.listUsers();
    console.log('[AUTH] GET /api/auth/users result', result);
    res.json(successResponse(result, 'Usernames retrieved successfully.'));
  },
};
