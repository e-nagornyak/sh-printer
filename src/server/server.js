const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const printer = require('pdf-to-printer');
const WebSocket = require('ws');
const { app } = require('electron');

// Loading configuration
const config = require('./config.json'); // Load configuration file

let server; // Variable to store the server
let ws; // Variable to store the WebSocket connection
const RECONNECT_INTERVAL = 5000; // Interval between reconnection attempts (in milliseconds)

const isDev = false

const filePath = isDev
  ? path.join(__dirname, 'temp_downloaded_file.pdf')
  : path.join(app.getPath('userData'), 'temp_downloaded_file.pdf');


// Function to download a remote file and save it locally
const downloadFile = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  console.log('response', response);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Function to start the WebSocket client
const startWebSocketClient = () => {
  ws = new WebSocket('ws://37.27.179.208:8765');

  ws.onopen = function () {
    console.log('Connected to the WebSocket!');

    // Send the first message "SlavaUkraini!"
    ws.send('СлаваУкраине!');
  };

  ws.onmessage = async function (event) {
    console.log('Received message from server: ' + event.data);

    // Server should send a URL to a PDF file
    if (event.data.includes('.pdf')) {
      const pdfUrl = event.data; // Received a remote URL to the PDF file

      try {
        // Download the remote file
        await downloadFile(pdfUrl, filePath);
        console.log(`File successfully downloaded: ${filePath}`);

        // Check if the file was downloaded correctly
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`Error checking file: ${err.message}`);
            return;
          }
          console.log(`Downloaded file size: ${stats.size} bytes`);
        });

        // Printer settings from config.json
        const options = {
          printer: config.printerName,
          scale:'noscale',
          paperSize:'6',
          win32: [
            '-print-settings "noscale"',
            '-print-settings "center"',
            '-orientation portrait',
            '-paper-size A6',
            '-margin-top 0',
            '-margin-right 0',
            '-margin-bottom 0',
            '-margin-left 0'
          ],
        };
        // Send the PDF file to the printer
        await printer.print(filePath, options);
        console.log('PDF file successfully sent to print.');

        // Delay before deleting the file after printing to avoid issues
        setTimeout(() => {
          fs.unlinkSync(filePath);
          console.log('Temporary file deleted.');
        }, 500); // The delay time can be adjusted

      } catch (error) {
        console.error(`Error processing file: ${error.message}`);
      }
    } else {
      console.log('Received a message that is not a PDF file link.');
    }
  };

  ws.onclose = function () {
    console.log('WebSocket connection closed. Attempting reconnection in 5 seconds...');
    setTimeout(startWebSocketClient, RECONNECT_INTERVAL); // Attempt reconnection after 5 seconds
  };

  ws.onerror = function (error) {
    console.log('Error: ' + error.message);
    ws.close(1000, 'Normal closure'); // Close with the correct close code
  };
};

// Function to start the Express server
const startServer = () => {
  const app = express();
  const PORT = 3000;

  // API to return configuration to the frontend
  app.get('/api/config', (req, res) => {
    res.json(config); // Return the configuration through the API
  });

  // Serve static files or index.html
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'index.html'));
  });

  // Start the server
  server = app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);

    // Start the WebSocket client after the server has started
    startWebSocketClient();
  });
};

// Function to stop the server
const stopServer = () => {
  if (server) {
    server.close(() => {
      console.log('Express server stopped.');
    });
  }

  if (ws) {
    ws.close(1000, 'Normal closure'); // Use close code 1000 for normal termination
  }
};

module.exports = { startServer, stopServer };
