import React from 'react';
import {Button, FormControl} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {cancelMeshBedLeveling, startMeshBedLeveling} from "../actions/meshActions";

export function StartButton() {
    const connectedToPort = useAppSelector(state => state.root.adminState.connectedToPort)
    const creatingMesh = useAppSelector(state => state.root.meshState.creatingMesh)

    const dispatch = useAppDispatch()

    return (
        <FormControl>
            <Button
                sx={{m: 1, minWidth: 120}}
                variant="contained"
                color={creatingMesh ? "error" : "info"}
                disabled={!connectedToPort}
                onClick={() => {
                    creatingMesh ? dispatch(cancelMeshBedLeveling) : dispatch(startMeshBedLeveling)
                }}>{creatingMesh ? "Cancel" : "Start"}</Button>
        </FormControl>
    )
}