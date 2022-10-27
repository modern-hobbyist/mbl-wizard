import {Reducer} from 'redux';

import {AdminAction, TEST} from '../actions/adminActions';

export interface AdminState {
    readonly test: boolean;
}

const defaultState: AdminState = {
    test: false
};

export const adminReducer: Reducer<AdminState> = (
    state = defaultState,
    action: AdminAction
) => {
    switch (action.type) {
        case TEST:
            return {
                ...state,
                test: !state.test
            };
        default:
            return state;
    }
};
