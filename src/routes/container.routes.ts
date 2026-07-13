import { Router } from 'express';
import { containerController } from '../controllers/container.controller';
import { validate } from '../middleware/validation.middleware';
import { createContainerSchema } from '../validators/container.validator';

const router = Router();

router.post('/', validate(createContainerSchema), containerController.create);
router.put('/:id/close', containerController.close);
router.put('/:id/reopen', containerController.reopen);
router.delete('/:id', containerController.delete);
router.get('/', containerController.list);
router.get('/:id', containerController.getById);

export default router;
