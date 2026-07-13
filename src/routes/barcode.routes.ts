import { Router } from 'express';
import { barcodeController } from '../controllers/barcode.controller';
import { validate } from '../middleware/validation.middleware';
import { createBarcodeSchema } from '../validators/barcode.validator';

const router = Router();

router.post('/', validate(createBarcodeSchema), barcodeController.create);
router.put('/:id', barcodeController.update);
router.delete('/:id', barcodeController.delete);

export default router;
