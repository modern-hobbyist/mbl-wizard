import React from 'react'

import {useAppDispatch, useAppSelector} from '../hooks'
import {requestPorts, setTest} from "../actions/adminActions";
import {Button} from "@material-ui/core";

export function MyComponent() {
    // The `state` arg is correctly typed as `RootState` already
    const testVal = useAppSelector(state => state.root.adminState.test)
    const availablePorts = useAppSelector(state => state.root.adminState.serialPorts)
    // const availablePorts = useAppSelector(state => state.root.adminState.serialPorts)
    const dispatch = useAppDispatch()

    const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch(requestPorts)
        dispatch(setTest(!testVal))
    }

    console.log("Available Ports");
    console.log(availablePorts);

    // omit rendering logic
    return (
        <div>
            <Button onClick={handleButtonClick} variant="contained" color={testVal ? "primary" : "secondary"}>
                Toggle is {testVal ? 'ON' : 'OFF'}
            </Button>
            <ul>{availablePorts.map((port) => {
                return <li key={port}>{port}</li>
            })}</ul>
        </div>
    )
}