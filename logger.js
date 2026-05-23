const bunyan = require('bunyan');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs', 'app.log');

/**
 * Structured logger writing to stdout and `logs/app.log`.
 *
 * @type {import('bunyan')}
 */
const logger = bunyan.createLogger({
  name: 'docraptor-client',
  streams: [
    { level: 'info', stream: process.stdout },
    { level: 'info', path: logFilePath },
  ],
});

module.exports = logger;
