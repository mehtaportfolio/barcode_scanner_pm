import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { httpLogger } from './middleware/logger.middleware';
import router from './routes';

const app = express();
const rateLimitEntries = new Map<string, { count: number; resetAt: number }>();
const maxRequestsPerWindow = 100;
const rateLimitWindowMs = 15 * 60 * 1000;

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = env.allowedOrigins;

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = rateLimitEntries.get(key);

  if (entry && entry.resetAt > now) {
    if (entry.count >= maxRequestsPerWindow) {
      res.status(429).json({ success: false, message: 'Too many requests. Please try again later.', data: null });
      return;
    }

    entry.count += 1;
    next();
    return;
  }

  rateLimitEntries.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
  next();
});
app.use(morgan('dev'));
app.use(httpLogger);

app.use(router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
