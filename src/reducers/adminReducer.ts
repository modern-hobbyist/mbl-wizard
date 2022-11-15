import {Reducer} from 'redux';

import {
    AdminAction,
    CONNECTED_TO_PORT,
    CONNECTING_TO_PORT,
    SERIAL_PORTS,
    SET_AWAITING_RESPONSE,
    SET_SELECTED_BAUD_RATE,
    SET_SELECTED_PORT,
    SET_SENDING_COMMAND,
    SET_SERIAL_HISTORY
} from '../actions/adminActions';

export interface AdminState {
    readonly serialPorts: string;
    readonly selectedPort: string;
    readonly connectingToPort: boolean;
    readonly connectedToPort: boolean;
    readonly sendingCommand: boolean;
    readonly awaitingResponse: boolean;
    readonly serialPort: SerialPort;
    readonly selectedBaudRate: number;
    readonly serialHistory: string;
}

const defaultState: AdminState = {
    serialPorts: "[]",
    selectedPort: "",
    connectingToPort: false,
    connectedToPort: false,
    sendingCommand: false,
    awaitingResponse: false,
    serialPort: null,
    selectedBaudRate: 250000,
    serialHistory: "[]"
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
        case SET_SENDING_COMMAND:
            return {
                ...state,
                sendingCommand: action.value
            };
        case SET_AWAITING_RESPONSE:
            return {
                ...state,
                awaitingResponse: action.value
            };
        case SET_SELECTED_BAUD_RATE:
            return {
                ...state,
                selectedBaudRate: action.value
            };
        case SET_SERIAL_HISTORY:
            return {
                ...state,
                serialHistory: action.value
            };
        default:
            return state;
    }
};
