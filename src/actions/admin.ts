import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState, store} from "../store";
import {AnyAction} from "@reduxjs/toolkit";

export const TEST = 'TEST';
export const SERIAL_PORTS = 'SERIAL_PORTS';
export const SELECTED_PORT = 'SELECTED_PORT';
export const CONNECTING_TO_PORT = 'CONNECTING_TO_PORT';
export const CONNECTED_TO_PORT = 'CONNECTED_TO_PORT';

export interface TestAction extends Action {
    type: 'TEST';
    value: boolean;
}

export const setTest: ActionCreator<TestAction> = (testValue: boolean) => ({
    type: TEST,
    value: testValue
});

export interface SetSerialPortsAction extends Action {
    type: 'SERIAL_PORTS';
    value: string;
}

export const setSerialPorts: ActionCreator<SetSerialPortsAction> = (serialPorts: string) => ({
    type: SERIAL_PORTS,
    value: serialPorts
});

export interface SetSelectedSerialPortAction extends Action {
    type: 'SELECTED_PORT';
    value: string;
}

export const setSelectedSerialPort: ActionCreator<SetSelectedSerialPortAction> = (selectedPort: string) => ({
    type: SELECTED_PORT,
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

export type AdminAction =
    | TestAction
    | SetSerialPortsAction
    | SetSelectedSerialPortAction
    | SetConnectingToPortAction
    | SetConnectedToPortAction

export const selectSerialPort =
    (selectedPort: string): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            if (store.getState().root.adminState.connectedToPort) {
                disconnectFromPort();
            }

            store.dispatch(setSelectedSerialPort(selectedPort));
            store.dispatch(setConnectedToPort(false));
        }

export async function requestPorts() {
    try {
        const port = await navigator.serial.requestPort();
        const ports = await navigator.serial.getPorts();
    } catch (ex) {
        console.log("Didn't connect", ex);
    }
}

export async function sendData() {
    console.log("Sending To Printer");
    const serialPort = await matchPortToSerialPort();
    const textEncoder = new TextEncoderStream();
    textEncoder.readable.pipeTo(serialPort.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write("Hello");
    await writer.close();
    console.log("Done Sending");
}

export async function connectToPort() {
    store.dispatch(setConnectedToPort(false))
    //TODO update to actually connect/disconnect from port.
    store.dispatch(setConnectingToPort(true))
    const serialPort = await matchPortToSerialPort();
    console.log(serialPort);
    await serialPort.open({
        baudRate: 115200
    });
    //TODO actually determine if success.
    store.dispatch(setConnectedToPort(true))
    store.dispatch(setConnectingToPort(false))
}

//TODO this might not always match correctly with the SerialPort list
async function matchPortToSerialPort(): Promise<SerialPort> {
    const selectedPort = JSON.parse(store.getState().root.adminState.selectedPort);
    const availablePorts = JSON.parse(store.getState().root.adminState.serialPorts);
    const serialPorts = await navigator.serial.getPorts();

    if (selectedPort == null || selectedPort == "") {
        //TODO throw an error.
        console.log("Null 3");
        return null;
    }

    if (serialPorts.length == 0) {
        //TODO throw an error
        console.log("Null 3");
        return null;
    }

    let portIndex = -1;

    availablePorts.forEach((port, index) => {
        if (port["portName"] == selectedPort["portName"]) {
            portIndex = index;
            console.log("here", port["portName"], selectedPort["portName"]);
        }
    });

    if (portIndex < 0) {
        //TODO throw error
        console.log("Null 3");
        return null;
    }

    return serialPorts[portIndex];
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function testFunction(input: string) {
    return input;
}

async function disconnectFromPort() {
    //TODO add some state stuff?
    const serialPort = await matchPortToSerialPort();
    await serialPort.close();
}