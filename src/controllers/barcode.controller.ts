import { Request, Response } from 'express';
import { barcodeService } from '../services/barcode.service';
import { errorResponse, successResponse } from '../utils/response';

export const barcodeController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await barcodeService.create(req.body);
      res.status(201).json(successResponse(data, 'Barcode saved successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save barcode.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const barcodeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload = req.body && typeof req.body === 'object' ? req.body : {};
      const data = await barcodeService.update(barcodeId, String(payload.barcode ?? ''));
      res.json(successResponse(data, 'Barcode updated successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update barcode.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const barcodeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await barcodeService.delete(barcodeId);
      res.json(successResponse(data, 'Barcode deleted successfully.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete barcode.';
      const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
      res.status(statusCode).json(errorResponse(message));
    }
  },
};
