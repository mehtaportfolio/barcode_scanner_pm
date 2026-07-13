import { z } from 'zod';

export const createBarcodeSchema = z.object({
  barcode: z.string().trim().min(1, 'Barcode is required.'),
  containerId: z.string().trim().min(1, 'Container ID is required.'),
});
