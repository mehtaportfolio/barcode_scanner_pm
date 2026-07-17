import { Request, Response } from 'express';
import { streamContainerBarcodeExport, streamHistoryBarcodeExport } from '../services/export.service';

export const exportController = {
  async containerBarcodes(req: Request, res: Response): Promise<void> {
    const containerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const format = (req.query.format === 'excel' ? 'excel' : 'csv') as 'csv' | 'excel';
    const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

    if (!containerId) {
      res.status(400).json({ success: false, message: 'Container ID is required.', data: null });
      return;
    }

    await streamContainerBarcodeExport(containerId, user?.id, res, format);
  },

  async historyBarcodes(req: Request, res: Response): Promise<void> {
    const format = (req.query.format === 'excel' ? 'excel' : 'csv') as 'csv' | 'excel';
    const user = (req as Request & { user?: { id: string; username: string; role: string } }).user;

    await streamHistoryBarcodeExport(user?.id, res, format);
  },
};
