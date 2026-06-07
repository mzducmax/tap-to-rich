const { app, BrowserWindow, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

/** Windows taskbar + title bar — must be .ico */
function resolveAppIcon() {
  const candidates = [
    path.join(__dirname, '..', 'build', 'icon.ico'),
    path.join(process.resourcesPath, 'icon.ico'),
  ];
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const image = nativeImage.createFromPath(candidate);
    if (!image.isEmpty()) {
      return image;
    }
  }
  if (isDev) {
    console.warn(
      '[Stack Box] Taskbar icon missing. Run: npm run icons  (needs build/icon.ico)',
    );
  }
  return undefined;
}
const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:4173';

function getStreamerEmail() {
  const fromEnv = process.env.STREAMER_EMAIL || process.env.VITE_STREAMER_EMAIL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim();
  }

  const emailFlag = process.argv.find((arg) => arg.startsWith('--email='));
  if (emailFlag) {
    return decodeURIComponent(emailFlag.slice('--email='.length)).trim();
  }

  return '';
}

function appendEmailToUrl(url, email) {
  if (!email) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}email=${encodeURIComponent(email)}`;
}

function createWindow() {
  const email = getStreamerEmail();
  const appIcon = resolveAppIcon();

  const win = new BrowserWindow({
    width: 800,
    height: 1280,
    minWidth: 300,
    minHeight: 300,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#020617',
    title: 'Stack Box',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    void win.loadURL(appendEmailToUrl(DEV_URL, email));
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
    if (email) {
      void win.loadFile(indexHtml, { query: { email } });
    } else {
      void win.loadFile(indexHtml);
    }
  }
}

if (process.platform === 'win32') {
  app.setAppUserModelId('pro.zonee.stack-box');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
