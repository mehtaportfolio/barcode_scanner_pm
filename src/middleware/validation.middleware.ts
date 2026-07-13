import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

const getValidationMessage = (error: ZodError): string => {
  const firstIssue = error.issues[0];
  if (firstIssue?.message) {
    return firstIssue.message;
  }

  return 'Validation failed';
};

export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const result = schema.safeParse(body);

  if (!result.success) {
    const validationError = new Error(getValidationMessage(result.error));
    (validationError as Error & { statusCode?: number }).statusCode = 400;
    next(validationError);
    return;
  }

  req.body = result.data;
  next();
};
