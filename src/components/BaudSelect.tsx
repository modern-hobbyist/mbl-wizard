import React from 'react';
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {updateBaudRate} from "../actions/adminActions";
import {useAppDispatch, useAppSelector} from "../hooks";

export function BaudSelect() {
    const dispatch = useAppDispatch()
    const selectedBaudRate = useAppSelector(state => state.root.adminState.selectedBaudRate)
    const availableBaudRates = [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 256000];

    return (
        <FormControl sx={{m: 1, minWidth: 120}}>
            <InputLabel id="baudRatesLabel">Baud Rate</InputLabel>
            <Select
                labelId="baudRatesLabel"
                id="baudRatesSelect"
                label="Baud Rate"
                defaultValue="256000"
                onChange={e => {
                    dispatch(updateBaudRate(Number(e.target.value)))
                }}
            >
                {availableBaudRates.map((baudRate) => {
                    return <MenuItem value={baudRate}
                                     key={baudRate}>{baudRate}</MenuItem>
                })}
            </Select>
        </FormControl>
    )
}