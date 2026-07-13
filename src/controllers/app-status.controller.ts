import { Request, Response } from 'express';
import { appStatusService } from '../services/app-status.service';

export const appStatusController = {
  async getAppStatus(_req: Request, res: Response): Promise<void> {
    try {
      const data = await appStatusService.getStatus();
      res.json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to retrieve application status.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  },
};
