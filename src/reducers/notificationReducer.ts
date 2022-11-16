import {AlertColor} from "@mui/material";

export interface NotificationState {
    readonly snackbarMessage: string;
    readonly snackbarOpen: boolean;
    readonly snackbarSeverity: AlertColor;
    readonly snackbarDuration: number;
}

const defaultState: NotificationState = {
    snackbarMessage: "",
    snackbarOpen: false,
    snackbarSeverity: "success",
    snackbarDuration: 6000,
};

export const notificationReducer = (state = defaultState, action) => {
    switch (action.type) {
        case "SNACKBAR_OPEN":
            return {
                ...state,
                snackbarOpen: true,
                snackbarMessage: action.message,
                snackbarSeverity: action.severity,
                snackbarDuration: action.duration
            };
        case "SNACKBAR_CLEAR":
            return {
                ...state,
                snackbarOpen: false,
                snackbarSeverity: "success",
                snackbarDuration: 6000
            };
        default:
            return state;
    }
};