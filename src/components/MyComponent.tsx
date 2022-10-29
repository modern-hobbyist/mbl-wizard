import React from 'react'

import {useAppDispatch, useAppSelector} from '../hooks'
import {connectToPort, requestPorts, sendData, setSelectedSerialPort, setTest} from "../actions/adminActions";
import {Button, FormControl, InputLabel, MenuItem, Select} from "@mui/material";

export function MyComponent() {
    // The `state` arg is correctly typed as `RootState` already
    const testVal = useAppSelector(state => state.root.adminState.test)
    console.log(useAppSelector(state => state.root.adminState.serialPorts));
    const availablePorts = JSON.parse(useAppSelector(state => state.root.adminState.serialPorts));
    // const availablePorts = ["1", "2", "3"];
    const selectedPort = useAppSelector(state => state.root.adminState.selectedPort)
    const connectingToPort = useAppSelector(state => state.root.adminState.connectingToPort)
    const connectedToPort = useAppSelector(state => state.root.adminState.connectedToPort)

    //TODO update this to disconnect from port with new state variable
    let connectingButtonText = connectedToPort ? "Connected" : "Connect";
    if (connectingToPort) {
        connectingButtonText = "Connecting";
    }

    const dispatch = useAppDispatch()

    const handleButtonClick = async (e: React.MouseEvent) => {
        dispatch(setTest(!testVal))
    }

    const handleSelectClick = async (e: React.MouseEvent) => {
        dispatch(requestPorts)
    }

    // omit rendering logic
    return (
        <div>
            <Button onClick={handleButtonClick} variant="contained" color={testVal ? "primary" : "secondary"}>
                Toggle is {testVal ? 'ON' : 'OFF'}
            </Button>
            <br/>
            <br/>
            <br/>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Ports</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Port"
                    defaultValue=""
                    onChange={e => {
                        dispatch(setSelectedSerialPort(e.target.value))
                    }}
                    onOpen={handleSelectClick}
                >
                    {availablePorts.map((port) => {
                        return <MenuItem value={JSON.stringify(port)}
                                         key={port["portName"]}>{port["portName"]}</MenuItem>
                    })}
                </Select>
                <Button
                    onClick={() => {
                        dispatch(connectToPort)
                    }}
                    disabled={selectedPort == "" || selectedPort == null}
                    variant="contained"
                    color={connectedToPort ? "success" : "primary"}>
                    {connectingButtonText}
                </Button>
            </FormControl>
            <div>{selectedPort}</div>
            <Button onClick={() => {
                dispatch(sendData)
            }}>Send Hello</Button>
        </div>
    )
}