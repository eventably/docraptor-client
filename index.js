const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/pdf', require('./routes/pdf'));

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
