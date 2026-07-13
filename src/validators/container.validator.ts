import { z } from 'zod';

export const createContainerSchema = z.object({
  containerNumber: z.string().trim().min(1, 'Container number is required.'),
});

export const closeContainerSchema = z.object({
  id: z.string().min(1),
});
