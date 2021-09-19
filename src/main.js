// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const ipc = require('electron').ipcMain;
const path = require('path');
const {autoUpdater} = require("electron-updater");
const edurov_search = require("./edurov_search");

function createWindow() {
    const source_dir = path.join(__dirname, "main_window");
    // Create the browser window.
    var window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(source_dir, "scripts", "preload.js")
        }
    });

    // and load the index.html of the app.
    window.loadFile(path.join(source_dir, "index.html"));

    // Open the DevTools.
    window.webContents.openDevTools()

    return window;
}

function start_main_window(splash_window, address) {
    edurov_search.stop();
    const window = createWindow();
    splash_window.close();

    ipc.on("get_address", () => window.webContents.send("address", address));
}

function createSplash() {
    const source_dir = path.join(__dirname, "start_screen");

    // Create the browser window.
    var window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(source_dir, "scripts", "preload.js")
        }
    });

    // and load the index.html of the app.
    window.loadFile(path.join(source_dir, "index.html"));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    ipc.on("edurov_search_start", () => edurov_search.start(window));
    ipc.on("start", (event, address) => start_main_window(window, address));

    return window;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify();
    createSplash();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createSplash()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.