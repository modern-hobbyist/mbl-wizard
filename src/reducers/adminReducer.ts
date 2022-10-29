import {Reducer} from 'redux';

import {
    AdminAction,
    CONNECTED_TO_PORT,
    CONNECTING_TO_PORT,
    SELECTED_PORT,
    SERIAL_PORTS,
    TEST
} from '../actions/adminActions';

export interface AdminState {
    readonly test: boolean;
    readonly serialPorts: string;
    readonly selectedPort: string;
    readonly connectingToPort: boolean;
    readonly connectedToPort: boolean;
}

const defaultState: AdminState = {
    test: false,
    serialPorts: "[]",
    selectedPort: "",
    connectingToPort: false,
    connectedToPort: false
};

export const adminReducer: Reducer<AdminState> = (
    state = defaultState,
    action: AdminAction
) => {
    switch (action.type) {
        case TEST:
            return {
                ...state,
                test: action.value
            };
        case SERIAL_PORTS:
            return {
                ...state,
                serialPorts: action.value
            };
        case SELECTED_PORT:
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
        default:
            return state;
    }
};
