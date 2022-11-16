import {combineReducers} from 'redux';

import {adminReducer, AdminState} from './adminReducer';
import {meshReducer, MeshState} from "./meshReducer";
import {notificationReducer, NotificationState} from "./notificationReducer";

export interface RootState {
    adminState: AdminState;
    meshState: MeshState;
    notificationState: NotificationState;
}

export const rootReducer = combineReducers<RootState | undefined>({
    adminState: adminReducer,
    meshState: meshReducer,
    notificationState: notificationReducer,
});
