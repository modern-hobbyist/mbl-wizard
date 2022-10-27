import {combineReducers} from 'redux';

import {adminReducer, AdminState} from './adminReducer';

export interface RootState {
    adminState: AdminState;
}

export const rootReducer = combineReducers<RootState | undefined>({
    adminState: adminReducer
});
