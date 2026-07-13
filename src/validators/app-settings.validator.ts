import { z } from 'zod';

export const updateAppSettingsSchema = z.object({
  appEnabled: z.boolean(),
  maintenance: z.boolean(),
  forceUpdate: z.boolean(),
  minimumVersion: z.string().min(1, 'Minimum version is required.'),
  latestVersion: z.string().min(1, 'Latest version is required.'),
  expiryDate: z.string().nullable().optional(),
  message: z.string().min(1, 'Message is required.'),
});
