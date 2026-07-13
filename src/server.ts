import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const port = env.port;
const host = env.host;

app.listen(port, host, () => {
  logger.info(`Server running on http://${host}:${port}`);
});
