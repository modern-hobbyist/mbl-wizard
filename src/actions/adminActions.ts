import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState, store} from "../store";
import {AnyAction} from "@reduxjs/toolkit";
import {normalizeGCode} from "../utilities/utilities";

export const SERIAL_PORTS = 'SERIAL_PORTS';
export const SET_SELECTED_PORT = 'SET_SELECTED_PORT';
export const CONNECTING_TO_PORT = 'CONNECTING_TO_PORT';
export const CONNECTED_TO_PORT = 'CONNECTED_TO_PORT';
export const SET_SELECTED_BAUD_RATE = 'SET_SELECTED_BAUD_RATE';

let reader: ReadableStreamDefaultReader;
let readableStreamClosed: Promise<void>;
let writableStreamClosed: Promise<void>;
let writer: WritableStreamDefaultWriter;

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

export type AdminAction =
    | SetSerialPortsAction
    | SetSelectedSerialPortAction
    | SetConnectingToPortAction
    | SetConnectedToPortAction
    | SetSelectedBaudRateAction

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

export async function sendData() {
    console.log("Sending To Printer");
    const serialPort = await getSelectedPort();
    const textEncoder = new TextEncoderStream();
    writableStreamClosed = textEncoder.readable.pipeTo(serialPort.writable);
    writableStreamClosed.catch((reason) => {
        console.log("WRITER ERROR");
        console.log(reason);
    })
    writer = textEncoder.writable.getWriter();
    await writer.write(normalizeGCode("M503", {
        sendLineNumber: false
    }));

    await writer.close();
}

export async function connectToPort() {
    store.dispatch(setConnectedToPort(false))
    //TODO update to actually connect/disconnect from port.
    store.dispatch(setConnectingToPort(true))
    console.log("Getting port");
    const serialPort = await getSelectedPort();
    console.log("Now here: ", serialPort);
    await serialPort.open({
        baudRate: store.getState().root.adminState.selectedBaudRate
    });

    serialPort.addEventListener('disconnect', (e) => {
        disconnectFromPort();
    });
    //TODO actually determine if success.
    listenToPort();
    store.dispatch(setConnectedToPort(true))
    store.dispatch(setConnectingToPort(false))
}

//TODO fix this function to read the entire buffer before moving on.
async function listenToPort() {
    //This is a bit confusing, but basically I have to cancel the reader below in "disconnectFromPort" and catch the resulting error
    //That is how it is outlined on the docs for transform streams

    if (reader == null || await reader.closed) {
        const serialPort = await getSelectedPort();
        const textDecoder = await updateReadableStreamClosed(serialPort);
        reader = textDecoder.readable.getReader();
    }

    try {
        while (true) {
            let totalString = "";
            while (!totalString.endsWith('\n')) {
                const {value, done} = await reader.read();
                totalString = `${totalString}${value}`;
                if (done) {
                    throw new Error('Serial port closed');
                }
            }
            console.log(totalString);
        }
    } catch (e) {
        //TODO handle?
        console.log(e)
    } finally {
        if (!reader.closed) {
            reader.releaseLock();
        }
    }
}

async function updateReadableStreamClosed(serialPort: SerialPort) {
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    readableStreamClosed.catch((reason) => {
        // console.log("STREAM CLOSED")
        // console.log(reason);
        resetApp();
    })
    return textDecoder
}

async function cancelReader() {
    if (reader != null) {
        console.log("Cancelling");
        await reader?.cancel();
        await readableStreamClosed?.catch(() => { //ignore the error
        })
        reader = null;
        readableStreamClosed = null;
    }
}

async function closeWriter() {
    if (!writer?.closed) {
        await writer?.close();
        await writableStreamClosed;
    }
}

export async function disconnectFromPort() {
    try {
        console.log("Disconnecting");
        store.dispatch(setConnectedToPort(false))
        await cancelReader();
        await closeWriter();
        console.log("Getting port");
        const serialPort = await getSelectedPort();
        console.log("Now here: ", serialPort);
        await serialPort?.close();
        //TODO actually determine if success.
    } catch (e) {
        resetApp();
        console.log(e);
    }
}

function resetApp() {
    store.dispatch(setConnectedToPort(false))
    store.dispatch(setConnectingToPort(false))
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

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function testFunction(input: string) {
    return input;
}