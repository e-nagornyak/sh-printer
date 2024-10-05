const { app } = require('./app');
const config = require('./config.json');
const { startWebSocketClient, stopWebSocketClient } = require('./ws/websocketClient');

let server;
const PORT = config.app.PORT;

const startServer = () => {
  server = app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);

    startWebSocketClient();
  });
};

const stopServer = () => {
  if (server) {
    server.close(() => {
      console.log('Сервер Express зупинено.');
    });
  }

  stopWebSocketClient();
};

module.exports = { startServer, stopServer };
