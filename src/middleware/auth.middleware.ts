import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface AuthUserPayload {
  sub: string;
  username: string;
  role: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required.', data: null });
    return;
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUserPayload;
    (req as Request & { user?: { id: string; username: string; role: string } }).user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.', data: null });
  }
};
