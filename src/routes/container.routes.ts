import { Router } from 'express';
import { containerController } from '../controllers/container.controller';
import { validate, validateParams } from '../middleware/validation.middleware';
import { containerIdParamSchema, createContainerSchema } from '../validators/container.validator';

const router = Router();

router.post('/', validate(createContainerSchema), containerController.create);
router.put('/:id/close', validateParams(containerIdParamSchema), containerController.close);
router.put('/:id/reopen', validateParams(containerIdParamSchema), containerController.reopen);
router.delete('/:id', validateParams(containerIdParamSchema), containerController.delete);
router.get('/', containerController.list);
router.get('/:id', validateParams(containerIdParamSchema), containerController.getById);

export default router;
