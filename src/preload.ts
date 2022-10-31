// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electron', {
    setTitle: (title: string) => ipcRenderer.send('set-title', title),
    setSelectedPort: (port: string) => ipcRenderer.send('set-selected-port', port),
    onPortList: (callback) => ipcRenderer.on('port-list', callback)
})