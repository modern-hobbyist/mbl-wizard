import {Reducer} from 'redux';

import {AdminAction, SERIAL_PORTS, TEST} from '../actions/adminActions';

export interface AdminState {
    readonly test: boolean;
    readonly serialPorts: string[];
}

const defaultState: AdminState = {
    test: false,
    serialPorts: []
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
        default:
            return state;
    }
};
