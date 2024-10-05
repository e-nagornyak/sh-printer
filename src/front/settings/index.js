const express = require('express');
const printer = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Шлях до конфігураційного файлу
const configPath = path.join(__dirname, '..', 'config.json');

// Маршрут для отримання списку принтерів
router.get('/printers', async (req, res) => {
  try {
    const printersList = await printer.getPrinters();
    res.json({ printers: printersList });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching printers', error: error.message });
  }
});

// Маршрут для отримання принтера за замовчуванням
router.get('/get-default-printer', (req, res) => {
  // Читаємо існуючий файл config.json
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading config file' });
    }

    // Парсимо існуючий JSON
    let config;
    try {
      config = JSON.parse(data);
    } catch (err) {
      return res.status(500).json({ error: 'Error parsing config file' });
    }

    // Повертаємо потрібні дані з config.json
    if (config && config.user && config.user.printers && config.user.printers.defaultLabel) {
      res.json({
        user: {
          printers: {
            defaultLabel: config.user.printers.defaultLabel
          }
        }
      });
    } else {
      res.status(404).json({ message: 'Default printer not found in config' });
    }
  });
});

// Маршрут для оновлення імені принтера у файлі config.json
router.post('/update-printer', (req, res) => {
  const newPrinterName = req.body.printerName;

  if (!newPrinterName) {
    return res.status(400).json({ error: 'Printer name is required' });
  }

  // Читаємо існуючий файл config.json
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading config file' });
    }

    // Парсимо існуючий JSON
    let config;
    try {
      config = JSON.parse(data);
    } catch (err) {
      return res.status(500).json({ error: 'Error parsing config file' });
    }

    // Оновлюємо значення printerName
    config.user.printers.defaultLabel = newPrinterName;

    // Записуємо нові дані в config.json
    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error writing config file' });
      }

      res.json({ message: 'Printer name updated successfully', config });
    });
  });
});

module.exports = router;
