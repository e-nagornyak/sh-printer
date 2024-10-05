const WebSocket = require('ws');
const fs = require('fs');
const axios = require('axios');
const printer = require('pdf-to-printer');
const path = require('path');
const { app: electronApp } = require('electron');
const config = require('../config.json');
const logger = require('../logger/logger');

const RECONNECT_INTERVAL = 5000;
let ws;

const isDev = false;

const filePath = isDev
  ? path.join(__dirname, '..', 'temp_downloaded_file.pdf')
  : path.join(electronApp.getPath('userData'), 'temp_downloaded_file.pdf');

// Function to download a remote file
const downloadFile = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Function to handle the client's WebSocket
const startWebSocketClient = () => {
  ws = new WebSocket('ws://37.27.179.208:8765');

  ws.onopen = () => {
    logger.info('Connected to WebSocket!');
    ws.send('СлаваУкраине!');
  };

  ws.onmessage = async (event) => {
    logger.info('Received a message from the server: ' + event.data);

    if (event.data.includes('.pdf')) {
      const pdfUrl = event.data;

      try {
        await downloadFile(pdfUrl, filePath);
        logger.info(`File downloaded successfully: ${filePath}`);

        const options = {
          printer: config.user.printers.defaultLabel,
          scale: 'noscale',
          paperSize: '6',
        };
        await printer.print(filePath, options);
        logger.info('The file was successfully sent for printing.');

        setTimeout(() => {
          fs.unlinkSync(filePath);
          logger.info('Temporary file deleted.');
        }, 500);

      } catch (error) {
        logger.error(`Error processing file: ${error.message}`);
      }
    }
  };

  ws.onclose = () => {
    logger.warn('WebSocket closed. Trying to connect in 5 seconds...');
    setTimeout(startWebSocketClient, RECONNECT_INTERVAL);
  };

  ws.onerror = (error) => {
    logger.error('Error: ' + error.message);
    ws.close(1000, 'Normal closure');
  };
};

const stopWebSocketClient = () => {
  if (ws) {
    ws.close(1000, 'Normal closure');
  }
};

module.exports = { startWebSocketClient, stopWebSocketClient };
