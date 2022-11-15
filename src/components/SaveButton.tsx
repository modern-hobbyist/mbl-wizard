import React from 'react';
import {Button, FormControl} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {saveConfiguration} from "../actions/meshActions";

export function SaveButton() {
    const selectedPort = useAppSelector(state => state.root.adminState.selectedPort)
    const connectedToPort = useAppSelector(state => state.root.adminState.connectedToPort)
    const sendingCommand = useAppSelector(state => state.root.adminState.sendingCommand)
    const awaitingResponse = useAppSelector(state => state.root.adminState.awaitingResponse)
    const dispatch = useAppDispatch()

    return (
        <FormControl>
            <Button
                sx={{m: 1, minWidth: 120}}
                variant="contained"
                color="success"
                disabled={!connectedToPort || sendingCommand || awaitingResponse}
                onClick={() => {
                    dispatch(saveConfiguration);
                }}>Save</Button>
        </FormControl>
    )
}