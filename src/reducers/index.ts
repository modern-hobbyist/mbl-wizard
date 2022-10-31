import {combineReducers} from 'redux';

import {adminReducer, AdminState} from './adminReducer';
import {meshReducer, MeshState} from "./meshReducer";

export interface RootState {
    adminState: AdminState;
    meshState: MeshState;
}

export const rootReducer = combineReducers<RootState | undefined>({
    adminState: adminReducer,
    meshState: meshReducer,
});
