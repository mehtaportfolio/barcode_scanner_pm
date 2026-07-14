import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/response';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    res.json(successResponse(result, 'Login successful.'));
  },

  async listUsers(req: Request, res: Response): Promise<void> {
    const result = await authService.listUsers();
    res.json(successResponse(result, 'Usernames retrieved successfully.'));
  },
};
