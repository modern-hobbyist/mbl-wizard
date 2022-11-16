import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import {useAppDispatch, useAppSelector} from "../hooks";
import {clearSnackbar} from "../actions/notificationActions";
import {Alert} from "@mui/material";

export default function NotificationSnackbar() {
    const dispatch = useAppDispatch()

    const {snackbarMessage, snackbarOpen, snackbarSeverity, snackbarDuration} = useAppSelector(
        state => state.root.notificationState
    );

    const handleClose = () => {
        dispatch(clearSnackbar())
    };

    return (
        <div>
            <Snackbar
                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                open={snackbarOpen}
                autoHideDuration={snackbarDuration}
                onClose={handleClose}
                // message={snackbarMessage}
                key="snackbar"
            >
                <Alert variant="filled" onClose={handleClose} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}