import {Action, ActionCreator} from 'redux';

export const TEST = 'TEST';
export const SERIAL_PORTS = 'SERIAL_PORTS';

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
    value: string[];
}

export const setSerialPorts: ActionCreator<SetSerialPortsAction> = (serialPorts: string[]) => ({
    type: SERIAL_PORTS,
    value: serialPorts
});

export type AdminAction = | TestAction | SetSerialPortsAction

export async function requestPorts() {
    try {
        console.log("Selecting Port");
        const port = await navigator.serial.requestPort();
        // const portInfo = port.getInfo();
        const ports = await navigator.serial.getPorts();
    } catch (ex) {
        console.log("Didn't connect", ex);
    }

}