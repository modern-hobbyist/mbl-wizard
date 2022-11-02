import React from 'react';
import {Button, FormControl} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {nextMeshPoint} from "../actions/meshActions";

export function NextButton() {
    const creatingMesh = useAppSelector(state => state.root.meshState.creatingMesh)
    const sendingCommand = useAppSelector(state => state.root.adminState.sendingCommand)
    const awaitingResponse = useAppSelector(state => state.root.adminState.awaitingResponse)
    const lastMeshPoint = false;
    const dispatch = useAppDispatch()

    return (
        <FormControl>
            <Button
                sx={{m: 1, minWidth: 120}}
                variant="contained"
                color="success"
                disabled={!creatingMesh || sendingCommand || awaitingResponse}
                onClick={() => {
                    dispatch(nextMeshPoint);
                }}>{lastMeshPoint ? "Finish" : "Next"}</Button>
        </FormControl>
    )
}