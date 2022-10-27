import React from 'react'

import {useAppDispatch, useAppSelector} from '../hooks'
import {setTest} from "../actions/adminActions";
import {Button} from "@material-ui/core";


export function MyComponent() {
    // The `state` arg is correctly typed as `RootState` already
    const testVal = useAppSelector(state => state.root.adminState.test)
    const dispatch = useAppDispatch()

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch(setTest(!testVal))
    }

    // omit rendering logic
    return (
        <div>
            <Button onClick={handleButtonClick} variant="contained" color={testVal ? "primary" : "secondary"}>
                Toggle is {testVal ? 'ON' : 'OFF'}
            </Button>
        </div>
    )
}