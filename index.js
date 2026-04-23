const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const logger = require('./logger');

const app = express();

app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',')
      .map(o => o.trim())
      .filter(Boolean)
  : [];

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: ['GET', 'HEAD', 'POST', 'DELETE'],
  }),
);

app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use('/pdf', require('./routes/pdf'));

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
