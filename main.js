const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const AutoLaunch = require('electron-auto-launch');

// Імпортуємо функції для запуску та зупинки сервера
const { startServer, stopServer } = require(path.join(__dirname, 'src', 'server', 'server.js'));
const { exec } = require("child_process");

let mainWindow;

// Налаштування автозапуску
const autoLauncher = new AutoLaunch({
  name: 'My Printer App',
  path: app.getPath('exe'), // Шлях до виконуваного файлу додатка
});

// Увімкнення автозапуску при запуску програми
autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) {
    autoLauncher.enable();
  }
}).catch((err) => {
  console.error('Error during auto-launch setup:', err);
});

app.on('ready', () => {
  // Запускаємо Express сервер тільки після того, як Electron готовий
  startServer();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  });

  // Завантажуємо головну сторінку (index.html)
  const startUrl = path.join(__dirname, 'src', 'front', 'index.html');
  mainWindow.loadURL(`file://${startUrl}`);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Викликаємо PowerShell для отримання принтерів (Windows only)
  ipcMain.handle('get-printers', async () => {
    return new Promise((resolve, reject) => {
      exec('powershell -Command "Get-Printer | Select-Object -ExpandProperty Name"', (error, stdout, stderr) => {
        if (error) {
          console.error('Error fetching printers:', stderr);
          resolve([]); // Якщо помилка, повертаємо порожній масив
        } else {
          const printers = stdout.trim().split('\n').map(printer => printer.trim());
          resolve(printers);
        }
      });
    });
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Зупинка сервера при закритті Electron додатка
app.on('quit', () => {
  stopServer();
});
