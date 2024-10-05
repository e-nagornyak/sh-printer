const express = require('express');

const printersRouter = require('./routes/printers');
const configRouter = require('./routes/config');
const indexRouter = require('./routes/index');
const logsRouter = require('./routes/logs');

const app = express();

app.use('/api', configRouter);
app.use('/', indexRouter);
app.use('/api', logsRouter);
app.use('/api', printersRouter);

module.exports = { app };
