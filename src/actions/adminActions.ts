import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState, store} from "../store";
import {AnyAction} from "@reduxjs/toolkit";
import EventTarget from 'events';
import {getExistingMesh, resetMesh, setCreatingMesh, setCurrentMeshPoint} from "./meshActions";
import {normalizeGCode} from "../utilities/utilities";

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
    | SetSerialHistoryAction

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
    // console.log(">>> ", normalizeGCode(gcode, {sendLineNumber: false}));
    store.dispatch(setSendingCommand(true))

    updateSerialHistory(normalizeGCode(gcode, {sendLineNumber: false}), true);

    const serialPort = await getSelectedPort();
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(serialPort.writable);

    const writer = textEncoder.writable.getWriter();

    await writer.ready

    await writer.write(normalizeGCode(gcode, {sendLineNumber: false}));

    writableStreamClosed.catch((reason) => {
        console.log("Error closing stream: ", reason);
    })

    await writer.close();

    store.dispatch(setSendingCommand(false))
}

export async function connectToPort() {
    store.dispatch(setConnectedToPort(false))
    store.dispatch(setConnectingToPort(true))

    try {
        const serialPort = await getSelectedPort();
        const connectionResponse = waitForFirstResponse("echo:SD card ok");
        await serialPort.open({
            bufferSize: 1600,
            // dataBits: 8,
            // flowControl: "hardware",
            parity: "even",
            // stopBits: 1,
            baudRate: store.getState().root.adminState.selectedBaudRate
        });

        confirmConnection();

        serialPort.addEventListener('disconnect', () => {
            disconnectFromPort();
        });

        listenToPort();
        await connectionResponse;

        //TODO confirm if printer can support mbl with similar to below
        // await sendData("G29 S0");
        // const meshResponse = await waitForFirstResponse();
        // console.log(meshResponse)

        await getExistingMesh();
    } catch (e) {
        //TODO add toast notification of failure
        console.log(e);
        store.dispatch(setConnectedToPort(false))
        store.dispatch(setConnectingToPort(false))
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
                    break;
                }
                totalString = `${totalString}${value}`;
            }
            //Emits a message received event which can be waited for when needed.
            // console.log(totalString);
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

export async function waitForFirstResponse(expectedResponse = "", command?: string): Promise<string> {
    //TODO implement timeout?
    store.dispatch(setAwaitingResponse(true));
    const printerResponse: string = await new Promise(function (resolve, reject) {
        messageEventTarget.on('message', (message: string) => {
            if (expectedResponse == "" || message.startsWith(expectedResponse)) {
                resolve(message);
            } else if (message.startsWith("Error:") || message.startsWith("Unknown command:")) {
                //TODO resend data or alert the user?
                console.log("Error: ", message);
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

async function cancelReader() {
    await reader?.cancel();
    await readableStreamClosed?.catch(() => { //ignore the error
        console.log("Here");
    })
    reader = null;
    readableStreamClosed = null;
}

async function closeWriter() {
    console.log("Closing writer");
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
        //TODO actually determine if success.
    } catch (e) {
        resetApp();
        console.log(e);
    }
}

export async function openYouTubeLink() {
    // shell.openExternal("http://www.youtube.com/c/modernhobbyist")
    // open("https://www.youtube.com/c/modernhobbyist", "_BLANK");
    console.log("Here");
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
        const currSerialPort = store.getState().root.adminState.serialPort
        const toReturn = currSerialPort ? currSerialPort : await navigator.serial.requestPort();

        if (toReturn == null) {
            console.log("Serial port is null");
        }

        return toReturn;
    } catch (ex) {
        console.log("Didn't connect", ex);
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