import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/response';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  const customError = err as Error & { statusCode?: number };
  if (customError.statusCode) {
    statusCode = customError.statusCode;
  }

  if (statusCode >= 500) {
    console.error(`\n[ERROR ${statusCode}] ${message}`);
    console.error(`Stack: ${err.stack}\n`);
  } else {
    console.warn(`[WARN ${statusCode}] ${message}`);
  }

  res.status(statusCode).json(errorResponse(message));
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(errorResponse('Route not found'));
};
