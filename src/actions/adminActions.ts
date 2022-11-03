import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState, store} from "../store";
import {AnyAction} from "@reduxjs/toolkit";
import {normalizeGCode} from "../utilities/utilities";
import EventTarget from 'events';
import {setCreatingMesh, setCurrentMeshPoint} from "./meshActions";

export const SERIAL_PORTS = 'SERIAL_PORTS';
export const SET_SELECTED_PORT = 'SET_SELECTED_PORT';
export const CONNECTING_TO_PORT = 'CONNECTING_TO_PORT';
export const CONNECTED_TO_PORT = 'CONNECTED_TO_PORT';
export const SET_SELECTED_BAUD_RATE = 'SET_SELECTED_BAUD_RATE';
export const SET_SENDING_COMMAND = 'SET_SENDING_COMMAND';
export const SET_AWAITING_RESPONSE = 'SET_AWAITING_RESPONSE';

let reader: ReadableStreamDefaultReader;
let readableStreamClosed: Promise<void>;
let writableStreamClosed: Promise<void>;
let writer: WritableStreamDefaultWriter;

class MessageEventTarget extends EventTarget {
}

const messageEventTarget = new MessageEventTarget();
const messageEventListener = new MessageEventTarget();

export interface SetSerialPortsAction extends Action {
    type: 'SERIAL_PORTS';
    value: string;
}

export const setSerialPorts: ActionCreator<SetSerialPortsAction> = (serialPorts: string) => ({
    type: SERIAL_PORTS,
    value: serialPorts
});

export interface SetSelectedSerialPortAction extends Action {
    type: 'SET_SELECTED_PORT';
    value: string;
}

export const setSelectedSerialPort: ActionCreator<SetSelectedSerialPortAction> = (selectedPort: string) => ({
    type: SET_SELECTED_PORT,
    value: selectedPort
});

export interface SetConnectingToPortAction extends Action {
    type: 'CONNECTING_TO_PORT';
    value: boolean;
}

export const setConnectingToPort: ActionCreator<SetConnectingToPortAction> = (connectingToPort: boolean) => ({
    type: CONNECTING_TO_PORT,
    value: connectingToPort
});

export interface SetConnectedToPortAction extends Action {
    type: 'CONNECTED_TO_PORT';
    value: boolean;
}

export const setConnectedToPort: ActionCreator<SetConnectedToPortAction> = (connectedToPort: boolean) => ({
    type: CONNECTED_TO_PORT,
    value: connectedToPort
});

export interface SetSelectedBaudRateAction extends Action {
    type: 'SET_SELECTED_BAUD_RATE';
    value: number;
}

export const setSelectedBaudRate: ActionCreator<SetSelectedBaudRateAction> = (baudRate: number) => ({
    type: SET_SELECTED_BAUD_RATE,
    value: baudRate
});

export interface SetSendingCommandAction extends Action {
    type: 'SET_SENDING_COMMAND';
    value: boolean;
}

export const setSendingCommand: ActionCreator<SetSendingCommandAction> = (sendingCommand: boolean) => ({
    type: SET_SENDING_COMMAND,
    value: sendingCommand
});

export interface SetAwaitingResponseAction extends Action {
    type: 'SET_AWAITING_RESPONSE';
    value: boolean;
}

export const setAwaitingResponse: ActionCreator<SetAwaitingResponseAction> = (awaitingResponse: boolean) => ({
    type: SET_AWAITING_RESPONSE,
    value: awaitingResponse
});

//TODO clean up all this port handling if possible
//TODO find a way to spy on the readbuffer until the word OK.
export type AdminAction =
    | SetSerialPortsAction
    | SetSelectedSerialPortAction
    | SetConnectingToPortAction
    | SetConnectedToPortAction
    | SetSelectedBaudRateAction
    | SetSendingCommandAction
    | SetAwaitingResponseAction

export const updateBaudRate =
    (baudRate: number): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            if (store.getState().root.adminState.connectedToPort) {
                await disconnectFromPort();
            }
            store.dispatch(setSelectedBaudRate(baudRate));

        }

export const selectSerialPort =
    (selectedPort: string): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            if (store.getState().root.adminState.connectedToPort) {
                await disconnectFromPort();
            }
            window.electron.setSelectedPort(selectedPort);
            store.dispatch(setSelectedSerialPort(selectedPort));
        }

export async function sendData(gcode: string) {
    store.dispatch(setSendingCommand(true))
    console.log(">>> ", gcode);
    const serialPort = await getSelectedPort();
    const textEncoder = new TextEncoderStream();
    writableStreamClosed = textEncoder.readable.pipeTo(serialPort.writable);
    writableStreamClosed.catch((reason) => {
        console.log("WRITER ERROR");
        console.log(reason);
    })
    writer = textEncoder.writable.getWriter();
    await writer.write(normalizeGCode(gcode, {
        sendLineNumber: false
    }));

    await writer.close();
    store.dispatch(setSendingCommand(false))
}

export async function connectToPort() {
    store.dispatch(setConnectedToPort(false))
    //TODO update to actually connect/disconnect from port.
    store.dispatch(setConnectingToPort(true))
    const serialPort = await getSelectedPort();
    await serialPort.open({
        baudRate: store.getState().root.adminState.selectedBaudRate
    });

    serialPort.addEventListener('disconnect', () => {
        disconnectFromPort();
    });

    listenToPort();

    const connectionResponse = await waitForFirstResponse();
    confirmConnection();

    //TODO confirm if printer can support mbl with similar to below
    // await sendData("G29 S0");
    // const meshResponse = await waitForFirstResponse();
    // console.log(meshResponse)
}

async function listenToPort() {
    //This is a bit confusing, but basically I have to cancel the reader below in "disconnectFromPort" and catch the resulting error
    //That is how it is outlined on the docs for transform streams

    const serialPort = await getSelectedPort();
    const textDecoder = await updateReadableStreamClosed(serialPort);
    if (reader == null || await reader.closed) {
        reader = textDecoder.readable.getReader();
    }

    try {
        while (true) {
            let totalString = "";

            while (!totalString.endsWith('\n') && !totalString.endsWith('\r')) {
                const {value, done} = await reader.read();
                totalString = `${totalString}${value}`;
                if (done) {
                    throw new Error('Serial port closed');
                }
                console.log(value);
            }
            // May be helpful in determining where hidden escaped characters are.
            // console.log(JSON.stringify(totalString));
            if (totalString.length > 0) {
                messageEventTarget.emit('message', totalString)
            }
        }
    } catch (e) {
        //TODO handle?
        /*
            Since the readable stream is stays open until we disconnect (or the printer is disconnected)
            I throw an error to exit the loop, and that error is caught here.
            I don't really need to do anything with this caught error, it just doesn't need to be reported
         */
    } finally {
        if (!reader.closed) {
            reader.releaseLock();
        }
    }
}

export async function waitForFirstResponse(expectedResponse = "", timeout = 10000): Promise<string> {
    //TODO implement timeout?
    console.log("Listener setup");
    store.dispatch(setAwaitingResponse(true));
    const printerResponse: string = await new Promise(function (resolve, reject) {
        messageEventTarget.on('message', (message: string) => {
            if (expectedResponse == "" || message.startsWith(expectedResponse)) {
                console.log("Listener closed");
                resolve(message);
            }
        });
    })

    messageEventTarget.removeAllListeners();
    store.dispatch(setAwaitingResponse(false));
    return printerResponse;
}


function confirmConnection() {
    store.dispatch(setConnectedToPort(true))
    store.dispatch(setConnectingToPort(false))
}

async function updateReadableStreamClosed(serialPort: SerialPort) {
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    readableStreamClosed.catch(() => {
        resetApp();
    })
    return textDecoder
}

async function cancelReader(message?: string) {
    if (reader != null) {
        await reader?.cancel();
        await readableStreamClosed?.catch(() => { //ignore the error
        })
        reader = null;
        readableStreamClosed = null;
    }
    return message;
}

async function closeWriter() {
    if (!writer?.closed) {
        await writer?.close();
        await writableStreamClosed;
    }
}

export async function disconnectFromPort() {
    try {
        store.dispatch(setConnectedToPort(false))
        store.dispatch(setConnectingToPort(false))
        store.dispatch(setCreatingMesh(false))
        store.dispatch(setAwaitingResponse(false))
        store.dispatch(setCurrentMeshPoint(0))
        await cancelReader();
        await closeWriter();
        const serialPort = await getSelectedPort();
        await serialPort?.close();
        //TODO actually determine if success.
    } catch (e) {
        resetApp();
        console.log(e);
    }
}

export async function openMonitor() {
    window.electron.openMonitor()
}

function resetApp() {
    store.dispatch(setConnectedToPort(false))
    store.dispatch(setConnectingToPort(false))
    store.dispatch(setCreatingMesh(false))
    store.dispatch(setAwaitingResponse(false))
    store.dispatch(setCurrentMeshPoint(0))
    reader = null;
    readableStreamClosed = null;
    writableStreamClosed = null;
    writer = null;
}

export async function getSelectedPort() {
    try {
        const currSerialPort = store.getState().root.adminState.serialPort
        return currSerialPort ? currSerialPort : await navigator.serial.requestPort();
    } catch (ex) {
        console.log("Didn't connect", ex);
    }
}