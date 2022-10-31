import React from 'react';
import {Button, FormControl} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {connectToPort, disconnectFromPort} from "../actions/adminActions";

export function ConnectButton() {
    const selectedPort = useAppSelector(state => state.root.adminState.selectedPort)
    const connectingToPort = useAppSelector(state => state.root.adminState.connectingToPort)
    const connectedToPort = useAppSelector(state => state.root.adminState.connectedToPort)

    let connectingButtonText = connectedToPort ? "Disconnect" : "Connect";
    if (connectingToPort) {
        connectingButtonText = "Connecting";
    }

    const dispatch = useAppDispatch()

    return (
        <FormControl>
            <Button
                sx={{m: 1, minWidth: 120}}
                onClick={() => {
                    connectedToPort ? dispatch(disconnectFromPort) : dispatch(connectToPort)
                }}
                disabled={selectedPort == "" || selectedPort == null}
                variant="contained"
                color={connectedToPort ? "success" : "primary"}>
                {connectingButtonText}
            </Button>
        </FormControl>
    )
}