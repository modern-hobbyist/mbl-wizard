import React from 'react';
import {AppBar, Button, Link, TextField, Toolbar} from "@mui/material";
import {openYouTubeLink, sendData} from "../actions/adminActions";
import {useAppDispatch, useAppSelector} from "../hooks";

export function CommandPrompt() {
    const dispatch = useAppDispatch();
    const connectedToPort = useAppSelector(state => state.root.adminState.connectedToPort)

    const commandFieldRef = React.useRef(null)

    let currentCommand = "";
    const handleChange = async (e) => {
        currentCommand = e.target.value;
    }

    const openLink = () => {
        dispatch(openYouTubeLink);
    }

    const keyPress = (e) => {
        if (e.keyCode == 13) {
            sendData(currentCommand);
            e.target.value = "";
        }
    }

    return (
        <AppBar position="fixed" color="default" sx={{top: 'auto', bottom: 0, height: "100px"}}>
            <Toolbar>
                <TextField sx={{m: 1}}
                           onKeyDown={keyPress}
                           size="small" variant="outlined" fullWidth type="text" placeholder="Command..."
                           onChange={handleChange} inputRef={commandFieldRef} disabled={!connectedToPort}/>
                <Button onClick={() => {
                    sendData(currentCommand)
                    commandFieldRef.current.value = "";
                    currentCommand = "";
                }}
                        sx={{m: 1, minWidth: 120}}
                        variant="contained"
                        size="medium"
                        color="success" disabled={!connectedToPort}>Send</Button>
            </Toolbar>
            <Link alignSelf="center" fontSize="medium" sx={{cursor: "pointer", mb: 1, color: "secondary"}}
                  onClick={openLink}>
                Developed by Modern Hobbyist
            </Link>
        </AppBar>
    )
}

export default CommandPrompt;
