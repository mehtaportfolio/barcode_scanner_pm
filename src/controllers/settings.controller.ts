import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { errorResponse, successResponse } from '../utils/response';

export const settingsController = {
  async getSettings(_req: Request, res: Response): Promise<void> {
    res.json(successResponse({ theme: 'light' }, 'Settings placeholder'));
  },

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data = await settingsService.createUser(req.body);
      res.status(201).json(successResponse(data, 'User created successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create user.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async listUsers(_req: Request, res: Response): Promise<void> {
    try {
      const data = await settingsService.listUsers();
      res.json(successResponse(data, 'Users retrieved successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to retrieve users.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await settingsService.deleteUser(userId);
      res.json(successResponse(data, 'User deleted successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete user.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await settingsService.updatePassword(userId, req.body);
      res.json(successResponse(data, 'Password updated successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update password.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },
};
