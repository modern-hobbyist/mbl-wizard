import React from 'react';
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useAppDispatch} from "../hooks";
import {updateMeshPointCount} from "../actions/meshActions";

export function MeshPointInput() {
    const dispatch = useAppDispatch()
    const availableMeshPoints = [4, 9, 12, 15, 25];

    return (
        <FormControl fullWidth sx={{m: 1, minWidth: 120}}>
            <InputLabel id="meshPointInputLabel">Mesh Points</InputLabel>
            <Select
                fullWidth
                labelId="meshPointInputLabel"
                id="meshPointInput"
                label="Mesh Points"
                defaultValue="25"
                onChange={e => {
                    dispatch(updateMeshPointCount(Number(e.target.value)))
                }}
            >
                {availableMeshPoints.map((meshPoints) => {
                    return <MenuItem value={meshPoints}
                                     key={meshPoints}>{meshPoints}</MenuItem>
                })}
            </Select>
        </FormControl>
    )
}