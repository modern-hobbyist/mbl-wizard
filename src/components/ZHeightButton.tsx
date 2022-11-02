import React from 'react';
import {Button, FormControl} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";

export function ZHeightButton(props) {
    const creatingMesh = useAppSelector(state => state.root.meshState.creatingMesh)
    const sendingCommand = useAppSelector(state => state.root.adminState.sendingCommand)
    const awaitingResponse = useAppSelector(state => state.root.adminState.awaitingResponse)
    const dispatch = useAppDispatch()

    return (
        <FormControl>
            <Button
                sx={{m: 1, minWidth: 120}}
                variant="contained"
                color="success"
                disabled={!creatingMesh || sendingCommand || awaitingResponse}
                onClick={() => {
                    dispatch(props.callback);
                }}
                startIcon={props.icon}
            >
            </Button>
        </FormControl>
    )
}