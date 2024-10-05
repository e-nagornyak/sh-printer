const express = require('express');
const path = require('path');

// Імпорт маршрутів
const printersRouter = require('./routes/printers');
const configRouter = require('./routes/config');
const indexRouter = require('./routes/index');

// Ініціалізація Express додатку
const app = express();
const PORT = 3000;

// Підключення маршрутів
app.use('/api', configRouter); // Маршрути для конфігурації
app.use('/', indexRouter); // Маршрут для головної сторінки
app.use('/api', printersRouter); // Маршрут для принтерів

module.exports = { app };
