import React from 'react';
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {getAvailablePorts, selectSerialPort} from "../actions/adminActions";
import {useAppDispatch, useAppSelector} from "../hooks";

export function PortSelect() {
    const dispatch = useAppDispatch()
    const availablePorts = JSON.parse(useAppSelector(state => state.root.adminState.serialPorts));

    const handleSelectClick = async (e: React.MouseEvent) => {
        dispatch(getAvailablePorts)
    }

    return (
        <FormControl fullWidth sx={{m: 1}} size="small">
            <InputLabel id="demo-simple-select-label">Port</InputLabel>
            <Select
                fullWidth
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Port"
                defaultValue=""
                onChange={e => {
                    dispatch(selectSerialPort(e.target.value))
                }}
                onOpen={handleSelectClick}
            >
                {availablePorts.map((port) => {
                    return <MenuItem value={JSON.stringify(port)}
                                     key={port["portName"]}>{port["portName"]}</MenuItem>
                })}
            </Select>
        </FormControl>
    )
}