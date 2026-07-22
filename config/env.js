const { cleanEnv, str, port, num } = require('envalid');
require('dotenv').config();

/**
 * Validated environment variables. Fails fast at boot if any required
 * variable is missing or malformed.
 *
 * @type {Readonly<{
 *   NODE_ENV: 'development' | 'test' | 'production',
 *   PORT: number,
 *   DOCRAPTOR_API_KEY: string,
 *   AWS_ACCESS_KEY_ID: string,
 *   AWS_SECRET_ACCESS_KEY: string,
 *   AWS_REGION: string,
 *   S3_BUCKET: string,
 *   CORS_ORIGIN: string,
 *   RATE_LIMIT_WINDOW_MS: number,
 *   RATE_LIMIT_MAX: number,
 * }>}
 */
const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    default: 'development',
  }),
  PORT: port({ default: 3000 }),
  DOCRAPTOR_API_KEY: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_REGION: str(),
  S3_BUCKET: str(),
  CORS_ORIGIN: str({
    default: '',
    desc: 'Comma-separated list of allowed CORS origins. Empty = same-origin only.',
  }),
  RATE_LIMIT_WINDOW_MS: num({ default: 900_000 }),
  RATE_LIMIT_MAX: num({ default: 100 }),
});

module.exports = env;
