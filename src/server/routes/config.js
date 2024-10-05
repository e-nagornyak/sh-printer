const express = require('express');
const config = require('../config.json');
const router = express.Router();

router.get('/config', (req, res) => {
  res.json(config);
});

module.exports = router;
