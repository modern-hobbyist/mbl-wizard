import {Reducer} from 'redux';

import {
    AdminAction,
    CONNECTED_TO_PORT,
    CONNECTING_TO_PORT,
    SERIAL_PORTS,
    SET_SELECTED_BAUD_RATE,
    SET_SELECTED_PORT,
} from '../actions/adminActions';

export interface AdminState {
    readonly serialPorts: string;
    readonly selectedPort: string;
    readonly connectingToPort: boolean;
    readonly connectedToPort: boolean;
    readonly serialPort: SerialPort;
    readonly selectedBaudRate: number;
}

const defaultState: AdminState = {
    serialPorts: "[]",
    selectedPort: "",
    connectingToPort: false,
    connectedToPort: false,
    serialPort: null,
    selectedBaudRate: 256000
};

export const adminReducer: Reducer<AdminState> = (
    state = defaultState,
    action: AdminAction
) => {
    switch (action.type) {
        case SERIAL_PORTS:
            return {
                ...state,
                serialPorts: action.value
            };
        case SET_SELECTED_PORT:
            return {
                ...state,
                selectedPort: action.value
            };
        case CONNECTING_TO_PORT:
            return {
                ...state,
                connectingToPort: action.value
            };
        case CONNECTED_TO_PORT:
            return {
                ...state,
                connectedToPort: action.value
            };
        case SET_SELECTED_BAUD_RATE:
            return {
                ...state,
                selectedBaudRate: action.value
            };
        default:
            return state;
    }
};
