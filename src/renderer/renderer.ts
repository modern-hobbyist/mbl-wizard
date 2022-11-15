/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import '../index.css';
// Add this to the end of the existing file
import '../app';
import {setSerialPorts} from "../actions/adminActions";
import {store} from "../store";

declare global {
    interface Window {
        electron: any
    }
}

window.electron.setTitle("MBL Wizard");

window.electron.onPortList((event, value: string) => {
    // console.log(event);
    // //This passes the serial names from the main program to the UI, so I can create a list, then connect to the device I want.
    // console.log("From Main: ", value);
    store.dispatch(setSerialPorts(value));
});