import React from 'react';
import {Button} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";

export function ZHeightButton(props) {
    const creatingMesh = useAppSelector(state => state.root.meshState.creatingMesh)
    const sendingCommand = useAppSelector(state => state.root.adminState.sendingCommand)
    const awaitingResponse = useAppSelector(state => state.root.adminState.awaitingResponse)
    const dispatch = useAppDispatch()

    return (
        <Button
            disabled={!creatingMesh || sendingCommand || awaitingResponse}
            onClick={() => {
                dispatch(props.callback);
            }}
            startIcon={props.icon}
        >
        </Button>
    )
}