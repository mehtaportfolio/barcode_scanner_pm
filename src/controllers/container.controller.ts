import { Request, Response } from 'express';
import { containerService } from '../services/container.service';
import { errorResponse, successResponse } from '../utils/response';

export const containerController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body && typeof req.body === 'object' ? req.body : {};
      const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

      if (!user) {
        res.status(401).json(errorResponse('Authentication required.'));
        return;
      }

      const data = await containerService.create(payload);
      res.status(201).json(successResponse(data, 'Container created successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create container.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

      if (!user) {
        res.status(401).json(errorResponse('Authentication required.'));
        return;
      }

      const data = await containerService.list({
        userId: user?.id,
        role: user?.role,
      });
      res.json(successResponse(data, 'Containers retrieved successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to list containers.';
      res.status(500).json(errorResponse(message));
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

      if (!user) {
        res.status(401).json(errorResponse('Authentication required.'));
        return;
      }

      const containerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await containerService.getById(containerId, {
        userId: user?.id,
        role: user?.role,
      });
      res.json(successResponse(data, 'Container retrieved successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to retrieve container.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async close(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

      if (!user) {
        res.status(401).json(errorResponse('Authentication required.'));
        return;
      }

      const containerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await containerService.close(containerId, {
        userId: user?.id,
        role: user?.role,
      });
      res.json(successResponse(data, 'Container closed successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to close container.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async reopen(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

      if (!user) {
        res.status(401).json(errorResponse('Authentication required.'));
        return;
      }

      const containerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await containerService.reopen(containerId, {
        userId: user?.id,
        role: user?.role,
      });
      res.json(successResponse(data, 'Container reopened successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reopen container.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

      if (!user) {
        res.status(401).json(errorResponse('Authentication required.'));
        return;
      }

      const containerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await containerService.delete(containerId, {
        userId: user?.id,
        role: user?.role,
      });
      res.json(successResponse(data, 'Container deleted successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete container.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },
};
