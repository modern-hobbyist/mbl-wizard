import React from 'react'

import {useAppDispatch, useAppSelector} from '../hooks'
import {setTest} from "../actions/adminActions";

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
            <button onClick={handleButtonClick}>
                Toggle is {testVal ? 'ON' : 'OFF'}
            </button>
        </div>
    )
}