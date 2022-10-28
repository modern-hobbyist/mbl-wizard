// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electron', {
    setTitle: (title: string) => ipcRenderer.send('set-title', title),
    onPortList: (callback) => ipcRenderer.on('port-list', callback)
})