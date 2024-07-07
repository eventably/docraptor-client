const bunyan = require('bunyan');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, 'logs', 'app.log');

const logger = bunyan.createLogger({
    name: 'docraptor-client',
    streams: [
        {
            level: 'info',
            stream: process.stdout, // log INFO and above to stdout
        },
        {
            level: 'info',
            path: logFilePath, // log INFO and above to a file
        },
    ],
});

module.exports = logger;
