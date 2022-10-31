import React from 'react';
import {Button, FormControl} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {sendData} from "../actions/adminActions";

export function SendButton() {
    const connectedToPort = useAppSelector(state => state.root.adminState.connectedToPort)

    const dispatch = useAppDispatch()

    return (
        <FormControl>
            <Button
                sx={{m: 1, minWidth: 120}}
                variant="contained"
                color="info"
                disabled={!connectedToPort}
                onClick={() => {
                    dispatch(sendData)
                }}>Send Data</Button>
        </FormControl>
    )
}