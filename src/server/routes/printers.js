const express = require('express');
const printer = require('pdf-to-printer');
const router = express.Router();

router.get('/printers', async (req, res) => {
  try {
    const printersList = await printer.getPrinters();
    res.json({ printers: printersList });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching printers', error: error.message });
  }
});

module.exports = router;
