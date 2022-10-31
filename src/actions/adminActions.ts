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
    writer = textEncoder.writable.getWriter();
    await writer.write(normalizeGCode("M503", {
        sendLineNumber: false
    }));

    // await sendMeshPoints(writer);

    await writer.close();
    listenToPort();

    console.log("Done Sending", "G28");
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
    //TODO actually determine if success.
    store.dispatch(setConnectedToPort(true))
    store.dispatch(setConnectingToPort(false))
    listenToPort();
    // store.dispatch(calculateMeshPoints());
    console.log("Done listening");
}

async function listenToPort() {
    //This is a bit confusing, but basically I have to cancel the reader below in "disconnectFromPort" and catch the resulting error
    //That is how it is outlined on the docs for transform streams
    const serialPort = await getSelectedPort();
    const textDecoder = await updateReadableStreamClosed(serialPort);
    reader = textDecoder.readable.getReader();
    try {
        while (true) {
            const {value, done} = await reader.read();
            if (done) {
                break;
            }
            // value is a string.
            console.log(value.replace("\n", "").replace("echo:", "\n"));
        }
    } catch (e) {
        console.log(e)
    } finally {
        reader.releaseLock()
    }
}

async function updateReadableStreamClosed(serialPort: SerialPort) {
    await cancelReader();
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    return textDecoder
}

async function cancelReader() {
    await reader?.cancel();
    await readableStreamClosed?.catch(() => { //ignore the error
    })
    reader = null;
    readableStreamClosed = null;
}

async function closeWriter() {
    if (!writer?.closed) {
        await writer.close();
        await writableStreamClosed;
    }
}

export async function disconnectFromPort() {
    console.log("Getting port");
    const serialPort = await getSelectedPort();
    console.log("Now here: ", serialPort);
    await cancelReader();
    await closeWriter();
    await serialPort.close();
    //TODO actually determine if success.
    store.dispatch(setConnectedToPort(false))
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