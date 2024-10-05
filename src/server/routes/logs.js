const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const logDirectory = path.join(__dirname, '..', 'logger', 'logs'); // Директорія з логами

// Функція для знаходження останнього лог-файлу
const getLatestLogFile = () => {
  const files = fs.readdirSync(logDirectory);

  // Фільтруємо файли, щоб знайти ті, що відповідають формату логів
  const logFiles = files.filter(file => file.startsWith('app-') && file.endsWith('.log'));

  // Сортуємо файли за датою (останній має бути останнім у списку)
  logFiles.sort((a, b) => {
    const dateA = new Date(a.split('-')[1]); // Витягуємо дату з назви
    const dateB = new Date(b.split('-')[1]);
    return dateB - dateA;
  });

  // Повертаємо останній файл
  return logFiles[0] ? path.join(logDirectory, logFiles[0]) : null;
};

// Отримання вмісту останнього лог-файлу
router.get('/logs', (req, res) => {
  const logFilePath = getLatestLogFile();

  if (!logFilePath) {
    return res.status(404).json({ message: 'Log file not found' });
  }

  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading log file', error: err.message });
    }

    res.type('text/plain');
    res.send(data);
  });
});

// Очищення файлу логів
router.delete('/logs', (req, res) => {
  const logFilePath = getLatestLogFile();

  if (!logFilePath) {
    return res.status(404).json({ message: 'Log file not found' });
  }

  fs.truncate(logFilePath, 0, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error clearing log file', error: err.message });
    }

    res.json({ message: 'Log file successfully cleared' });
  });
});

module.exports = router;
