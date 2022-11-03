import {app, BrowserWindow, ipcMain, IpcMainEvent, nativeTheme} from 'electron';
import installExtension, {REDUX_DEVTOOLS} from 'electron-devtools-installer';

const path = require('path')

const isDev = require('electron-is-dev');

let globalPortList: Electron.SerialPort[];
globalPortList = [];

let selectedPort = "{}";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MONITOR_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const MONITOR_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

try {
    require('electron-reloader')(module)
} catch (_) {
}

function overwritePortList(portList: Electron.SerialPort[]) {
    globalPortList = portList;
}

function updatePortListUi(mainWindow: BrowserWindow) {
    const newPortList = JSON.stringify(globalPortList);
    console.log("Main: ", newPortList);
    mainWindow.webContents.send('port-list', JSON.stringify(globalPortList));
}

function addToPortList(port: Electron.SerialPort) {
    globalPortList.push(port);
}

function removeFromPortList(port: Electron.SerialPort) {
    let location = -1;
    globalPortList.forEach((haystack, index) => {
        if (haystack.portName == port.portName) {
            location = index;
        }
    })
    if (location >= 0) {
        globalPortList.splice(location, 1);
    }
}

const createWindow = (): void => {
    if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'dark'
    } else {
        nativeTheme.themeSource = 'light'
    }

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 600,
        width: 900,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    if (isDev) {
        mainWindow.webContents.openDevTools({mode: 'detach'});
    }

    mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
        console.log('SELECT-SERIAL-PORT FIRED WITH', portList);
        console.log("Main -- Ports: ", portList);

        overwritePortList(portList);
        updatePortListUi(mainWindow);

        //Display some type of dialog so that the user can pick a port
        mainWindow.webContents.session.on('serial-port-added', (event, port, webContents) => {
            console.log('serial-port-added FIRED WITH', port);
            updatePortListUi(mainWindow);
            event.preventDefault();
        })

        mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
            console.log('serial-port-removed FIRED WITH', port);
            updatePortListUi(mainWindow);
            event.preventDefault();
        })
        event.preventDefault();

        const selectedPortObj = JSON.parse(selectedPort);

        const portToConnectTo = portList.find((device) => {
            if (device?.portName == selectedPortObj['portName']) {
                return true;
            }
        });
        if (!portToConnectTo) {
            callback('')
        } else {
            callback(portToConnectTo.portId)
        }

    })

    mainWindow.webContents.session.on('serial-port-added', (event, port) => {
        console.log('serial-port-added FIRED WITH', port);
        addToPortList(port);
        updatePortListUi(mainWindow);
        event.preventDefault();
    })

    mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
        console.log('serial-port-removed FIRED WITH', port);
        removeFromPortList(port);
        updatePortListUi(mainWindow);
        event.preventDefault();
    })

    // mainWindow.webContents.session.on('select-serial-port-cancelled', () => {
    //     console.log('select-serial-port-cancelled FIRED.');
    // })

    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        // This permission check handler is not needed by default but available if you want to limit serial requests
        console.log(`In PermissionCheckHandler`);
        console.log(`Webcontents url: ${webContents.getURL()}`);
        console.log(`Permission: ${permission}`);
        console.log(`Requesting Origin: ${requestingOrigin}`, details);
        return true;
    });
};

let serialMonitor = null

function openSerialMonitor(event: IpcMainEvent) {
    if (serialMonitor) {
        serialMonitor.focus()
        return
    }

    serialMonitor = new BrowserWindow({
        height: 600,
        width: 900,
        x: 100,
        y: 100,
        title: "Serial Monitor",
        webPreferences: {
            preload: MONITOR_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
        },
    })

    serialMonitor.loadURL(MONITOR_WINDOW_WEBPACK_ENTRY)

    serialMonitor.on('closed', function () {
        serialMonitor = null
    })
}

function handleSetTitle(event: IpcMainEvent, title: string) {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
}

function handleSetSelectedPort(event: IpcMainEvent, newPort: string) {
    console.log("Setting port on main: ", newPort);
    selectedPort = newPort;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    installExtension(REDUX_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
}).then(() => {
    ipcMain.on('set-title', handleSetTitle)
    ipcMain.on('set-selected-port', handleSetSelectedPort)
    ipcMain.on('open-monitor', openSerialMonitor)
    createWindow()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
    app.quit();
    // }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.