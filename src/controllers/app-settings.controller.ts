import { Request, Response } from 'express';
import { appSettingsService } from '../services/app-settings.service';
import { errorResponse, successResponse } from '../utils/response';

export const appSettingsController = {
  async getAppSettings(_req: Request, res: Response): Promise<void> {
    try {
      const data = await appSettingsService.getSettings();
      console.log('[app-settings] getAppSettings -> returning', data);
      res.json(successResponse(data, 'App settings retrieved successfully.'));
    } catch (error) {
      console.error('[app-settings] getAppSettings error', error);
      const message = error instanceof Error ? error.message : 'Unable to load app settings.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async updateAppSettings(req: Request, res: Response): Promise<void> {
    try {
      console.log('[app-settings] updateAppSettings payload', req.body);
      const data = await appSettingsService.updateSettings(req.body);
      console.log('[app-settings] updateAppSettings -> updated', data);
      res.json(successResponse(data, 'App settings updated successfully.'));
    } catch (error) {
      console.error('[app-settings] updateAppSettings error', error);
      const message = error instanceof Error ? error.message : 'Unable to update app settings.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },
};
