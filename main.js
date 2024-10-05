const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const AutoLaunch = require('electron-auto-launch');
const { startServer, stopServer } = require(path.join(__dirname, 'src', 'server', 'server.js'));
const { exec } = require('child_process');

let mainWindow;
let tray = null;

// Налаштування автозапуску
const autoLauncher = new AutoLaunch({
  name: 'My Printer App',
  path: app.getPath('exe'), // Шлях до виконуваного файлу додатка,
  mac: false,
  isHidden: true
});

// Увімкнення автозапуску при запуску програми
autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) {
    autoLauncher.enable();
  }
}).catch((err) => {
  console.error('Error during auto-launch setup:', err);
});

app.whenReady().then(() => {
  // Запускаємо Express сервер тільки після того, як Electron готовий
  startServer();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, 'icon.jpg') // Specify the path to your icon here
  });

  // Завантажуємо головну сторінку (index.html)
  const startUrl = path.join(__dirname, 'src', 'front', 'index.html');
  mainWindow.loadURL(`file://${startUrl}`);

  // Створюємо іконку трею
  tray = new Tray(path.join(__dirname, 'icon.jpg'));

  // Додаємо контекстне меню до іконки трею
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Відкрити',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Вихід',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('My Printer App');
  tray.setContextMenu(contextMenu);

  // Відображаємо вікно при кліку на іконку трею
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  // Ховаємо вікно при згортанні
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Перехоплюємо подію закриття вікна і просто ховаємо його замість завершення
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
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

// Закриваємо застосунок повністю
app.on('before-quit', () => {
  app.isQuitting = true;
});

// Подія для закриття вікон додатка
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
