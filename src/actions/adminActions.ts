import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState, store} from "../store";
import {AnyAction} from "@reduxjs/toolkit";
import EventTarget from 'events';
import {getExistingMesh, resetMesh, setCreatingMesh, setCurrentMeshPoint} from "./meshActions";
import {normalizeGCode} from "../utilities/utilities";
import {showSnackbarMessage} from "./notificationActions";

export const SERIAL_PORTS = 'SERIAL_PORTS';
export const SET_SELECTED_PORT = 'SET_SELECTED_PORT';
export const CONNECTING_TO_PORT = 'CONNECTING_TO_PORT';
export const CONNECTED_TO_PORT = 'CONNECTED_TO_PORT';
export const SET_SELECTED_BAUD_RATE = 'SET_SELECTED_BAUD_RATE';
export const SET_SENDING_COMMAND = 'SET_SENDING_COMMAND';
export const SET_AWAITING_RESPONSE = 'SET_AWAITING_RESPONSE';
export const SET_SERIAL_HISTORY = 'SET_SERIAL_HISTORY';

let reader: ReadableStreamDefaultReader;
let readableStreamClosed: Promise<void>;
let writableStreamClosed: Promise<void>;
let writer: WritableStreamDefaultWriter;
let globalSerialPort: SerialPort;

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

export interface SetSerialHistoryAction extends Action {
    type: 'SET_SERIAL_HISTORY';
    value: string;
}

export const setSerialHistory: ActionCreator<SetSerialHistoryAction> = (setSerialHistory: string) => ({
    type: SET_SERIAL_HISTORY,
    value: setSerialHistory
});

type Message = {
    send: boolean;
    message: string;
};

export type AdminAction =
    | SetSerialPortsAction
    | SetSelectedSerialPortAction
    | SetConnectingToPortAction
    | SetConnectedToPortAction
    | SetSelectedBaudRateAction
    | SetSendingCommandAction
    | SetAwaitingResponseAction
    | SetSerialHistoryAction

export const updateBaudRate =
    (baudRate: number): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            // store.dispatch(showSnackbarMessage("Stinker", 'success'));
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


export async function getAvailablePorts() {
    try {
        return await navigator.serial.requestPort()
    } catch (ex) {
        store.dispatch(showSnackbarMessage("Failed to connect.", 'error', 6000));
    }
}

export async function connectToPort() {
    store.dispatch(setConnectedToPort(false))
    store.dispatch(setConnectingToPort(true))

    try {
        const serialPort = await getAvailablePorts();

        globalSerialPort = serialPort;

        const connectionResponse = waitWithTimeout(2000);

        await serialPort.open({
            bufferSize: 1600,
            // dataBits: 8,
            // flowControl: "hardware",
            // parity: "none",
            // stopBits: 1,
            baudRate: store.getState().root.adminState.selectedBaudRate
        });

        serialPort.addEventListener('disconnect', () => {
            disconnectFromPort();
        });

        listenToPort();

        // returns a race between timeout and the passed promise
        await connectionResponse;

        Promise.resolve(connectionResponse);

        confirmConnection();

        //TODO confirm if printer can support mbl with similar to below
        const supportsMBL = await confirmMblSupport();

        if (!supportsMBL) {
            store.dispatch(showSnackbarMessage("Printer doesn't support Manual Mesh Bed Leveling.", 'error', 6000));
            return;
        }

        await getExistingMesh();
    } catch (e) {
        //TODO add toast notification of failure
        store.dispatch(setConnectedToPort(false))
        store.dispatch(setConnectingToPort(false))
    }
}

class LineBreakTransformer {
    private chunks: string;

    constructor() {
        // A container for holding stream data until a new line.
        this.chunks = "";
    }

    transform(chunk, controller) {
        // Append new chunks to existing chunks.
        this.chunks += chunk;

        //TODO is there a better transformer than a line break?
        if (chunk.endsWith("\n")) {
            // For each line breaks in chunks, send the parsed lines out.
            // const lines = this.chunks.split("\n");
            // this.chunks = lines.pop();
            // lines.forEach((line) => controller.enqueue(line));

            //OR just lump it all together until it ends with a new line?
            controller.enqueue(this.chunks);
        }
    }

    flush(controller) {
        // When the stream is closed, flush any remaining chunks out.
        controller.enqueue(this.chunks);
    }
}

async function listenToPortAlt() {
    const serialPort = await getSelectedPort();
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();

    try {
        while (true) {
            // Listen to data coming from the serial device.
            const {value, done} = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                break;
            }
            //Emits a message received event which can be waited for when needed.
            updateSerialHistory(value, false);
            messageEventTarget.emit('message', value)
        }
    } catch (e) {
        /*
            Since the readable stream is stays open until we disconnect (or the printer is disconnected)
            I throw an error to exit the loop, and that error is caught here.
            I don't really need to do anything with this caught error, it just doesn't need to be reported
         */
    }

    if (!reader.closed) {
        reader.releaseLock();
    }
}

async function listenToPort() {
    const serialPort = await getSelectedPort();
    const textDecoder = new TextDecoderStream();
    readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
    try {
        while (true) {
            // Listen to data coming from the serial device.
            let totalString = "";
            while (!totalString.endsWith('\n')) {
                const {value, done} = await reader.read();
                if (done) {
                    // Allow the serial port to be closed later.
                    throw new Error('Serial port closed');
                }
                totalString = `${totalString}${value}`;
            }
            //Emits a message received event which can be waited for when needed.
            updateSerialHistory(totalString, false);
            messageEventTarget.emit('message', totalString)
        }
    } catch (e) {
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

export async function sendData(gcode: string) {
    try {
        store.dispatch(setSendingCommand(true))

        updateSerialHistory(normalizeGCode(gcode, {sendLineNumber: false}), true);

        const serialPort = await getSelectedPort();
        const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(serialPort.writable);

        const writer = textEncoder.writable.getWriter();

        await writer.ready

        await writer.write(normalizeGCode(gcode, {sendLineNumber: false}));

        writableStreamClosed.catch((reason) => {
            store.dispatch(showSnackbarMessage("Error closing stream:", 'error', 6000));
            console.log("Error closing stream: ", reason);
        })

        await writer.close();

        store.dispatch(setSendingCommand(false))
    } catch (e) {

    }
}

export async function waitForFirstResponse(...expectedResponses: string[]): Promise<string> {
    store.dispatch(setAwaitingResponse(true));
    const printerResponse: string = await new Promise(function (resolve, reject) {
        messageEventTarget.on('message', (message: string) => {
            let messageContainsResponse = false;
            for (const resp of expectedResponses) {
                if (message.indexOf(resp) !== -1) {
                    messageContainsResponse = true;
                }
            }

            if (expectedResponses.length == 0 || messageContainsResponse) {
                resolve(message);
            } else if (message.startsWith("Error:") || message.startsWith("Unknown command:")) {
                //TODO Alert the user of the error with Toast.
                store.dispatch(showSnackbarMessage(message, 'error', 6000));
            }
        });
    })

    messageEventTarget.removeAllListeners();
    store.dispatch(setAwaitingResponse(false));
    return printerResponse;
}

export async function waitWithTimeout(timeout: number): Promise<string> {
    store.dispatch(setAwaitingResponse(true));
    const printerResponse: string = await new Promise(function (resolve, reject) {
        messageEventTarget.on('message', (message: string) => {
            resolve(message);
        });
        setTimeout(() => {
            resolve("Timed Out");
        }, timeout);
    })

    messageEventTarget.removeAllListeners();
    store.dispatch(setAwaitingResponse(false));
    return printerResponse;
}

async function confirmMblSupport(): Promise<boolean> {
    //TODO this won't catch them all
    //TODO improve this function to determine more accurately.
    //GRBL responds with error:20
    const printerResponsePromise = waitForFirstResponse("LEVELING_DATA:");
    await sendData("M115");
    const response = await printerResponsePromise;
    return response.indexOf("LEVELING_DATA:1") !== -1;
}

function confirmConnection() {
    store.dispatch(showSnackbarMessage("Connected", 'success', 3000));
    store.dispatch(setConnectedToPort(true))
    store.dispatch(setConnectingToPort(false))
}

async function cancelReader() {
    await reader?.cancel();
    await readableStreamClosed?.catch(() => { //ignore the error
    })
    reader = null;
    readableStreamClosed = null;
}

async function closeWriter() {
    await writer?.close();
    await writableStreamClosed;
}

export async function disconnectFromPort() {
    try {
        store.dispatch(setConnectedToPort(false))
        store.dispatch(setConnectingToPort(false))
        store.dispatch(setCreatingMesh(false))
        store.dispatch(setAwaitingResponse(false))
        store.dispatch(setCurrentMeshPoint(0))

        store.dispatch(resetMesh);

        await cancelReader();
        await closeWriter();
        const serialPort = await getSelectedPort();
        await serialPort?.close();
        store.dispatch(showSnackbarMessage("Disconnected", 'info', 3000));
    } catch (e) {
        //TODO improve error reporting.
        store.dispatch(showSnackbarMessage(`Error: ${e}`, 'error', 10000));
        resetApp();
    }
}

export async function openYouTubeLink() {
    // shell.openExternal("http://www.youtube.com/c/modernhobbyist")
    // open("https://www.youtube.com/c/modernhobbyist", "_BLANK");
    window.electron.openLink("https://www.youtube.com/c/modernhobbyist");
}

function resetApp() {
    store.dispatch(setConnectedToPort(false))
    store.dispatch(setConnectingToPort(false))
    store.dispatch(setCreatingMesh(false))
    store.dispatch(setAwaitingResponse(false))
    store.dispatch(setCurrentMeshPoint(0))
}

export async function getSelectedPort() {
    try {
        if (globalSerialPort == null) {
            store.dispatch(showSnackbarMessage("An error occurred.", 'error', 6000));
        }
        return globalSerialPort;
    } catch (ex) {
        store.dispatch(showSnackbarMessage("Failed to connect.", 'error', 6000));
    }
}

export function getSerialHistory(): Message[] {
    const historyString = store.getState().root.adminState.serialHistory;
    return JSON.parse(historyString);
}

export function updateSerialHistory(message: string, send: boolean) {
    const history = getSerialHistory();
    history.push({send: send, message: message});
    store.dispatch(setSerialHistory(JSON.stringify(history)));
}

export async function clearSerialHistory() {
    store.dispatch(setSerialHistory(JSON.stringify([])))
}