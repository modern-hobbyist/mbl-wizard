// actions/snackbarActions.js
export const showSnackbarMessage = (message, severity = 'success', duration = 3000) => {
    return dispatch => {
        dispatch({type: "SNACKBAR_OPEN", message, severity, duration});
    };
};

export const clearSnackbar = () => {
    return dispatch => {
        dispatch({type: "SNACKBAR_CLEAR"});
    };
};