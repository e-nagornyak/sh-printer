const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const AutoLaunch = require('electron-auto-launch');
const { startServer, stopServer } = require(path.join(__dirname, 'src', 'server', 'server.js'));
// const { exec } = require('child_process');

let mainWindow;
let tray = null;
app.isQuitting = false; // Global flag to handle quitting

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
    icon: path.join(__dirname, 'icon.jpg'), // Specify the path to your icon here
    autoHideMenuBar: true, // Ця опція приховує верхню панель
    frame: true, // Це залишить рамку вікна (кнопки мінімізації/закриття)
  });

  // Завантажуємо головну сторінку (index.html)
  const startUrl = path.join(__dirname, 'src', 'front', 'index.html');
  mainWindow.loadURL(`file://${startUrl}`);

  // Створюємо іконку трею
  tray = new Tray(path.join(__dirname, 'icon.jpg'));

  // Додаємо контекстне меню до іконки трею
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Exit',
      click: () => {
        // Show confirmation dialog when quitting from the context menu
        const choice = dialog.showMessageBoxSync(mainWindow, {
          type: 'question',
          buttons: ['Quit', 'Cancel'],
          defaultId: 1,
          title: 'Confirmation of closing',
          message: 'Are you sure you want to quit?',
        });

        if (choice === 0) { // If "Quit" is selected
          app.isQuitting = true; // Set flag to true to allow quitting
          app.quit(); // Quit the app
        }
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
