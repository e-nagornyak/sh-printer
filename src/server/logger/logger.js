const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Транспорт для виводу логів у файл з щоденною ротацією
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',  // Логи зберігаються з датою у назві
      zippedArchive: true,        // Логи будуть заархівовані (.gz)
      maxSize: '20m',             // Максимальний розмір одного файлу
      maxFiles: '14d'             // Зберігати логи протягом 14 днів
    }),
    // Вивід у консоль
    new transports.Console({
      format: combine(
        format.colorize(),
        logFormat
      )
    })
  ],
});

module.exports = logger;
