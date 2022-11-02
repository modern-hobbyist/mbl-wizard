import React from 'react';
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {setZChangeAmount} from "../actions/meshActions";

export function ZHeightSelect() {
    const dispatch = useAppDispatch()
    const zChangeAmount = useAppSelector(state => state.root.meshState.zChangeAmount)
    const availableZChanges = [0.01, 0.02, 0.05, 0.1];

    return (
        <FormControl fullWidth sx={{m: 1, minWidth: 120}} size="small">
            <InputLabel id="zHeightSelectLabel">Z Change</InputLabel>
            <Select
                fullWidth
                labelId="zHeightSelectLabel"
                id="zHeightSelect"
                label="Z Change"
                value={zChangeAmount}
                onChange={e => {
                    dispatch(setZChangeAmount(e.target.value))
                }}
            >
                {availableZChanges.map((zChange) => {
                    return <MenuItem value={zChange}
                                     key={zChange}>{zChange}</MenuItem>
                })}
            </Select>
        </FormControl>
    )
}