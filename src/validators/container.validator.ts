import { z } from 'zod';

export const createContainerSchema = z.object({
  containerNumber: z.string().trim().min(1, 'Container number is required.').max(100, 'Container number is too long.'),
});

export const containerIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Container ID is required.'),
});
