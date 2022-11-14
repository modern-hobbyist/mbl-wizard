import React from 'react';
import {Button, Grid, TextField} from "@mui/material";
import {useAppDispatch} from "../hooks";
import {sendData} from "../actions/adminActions";

export function Monitor() {
    const dispatch = useAppDispatch()

    const command = "";

    const handleChange = async (e: React.ChangeEvent) => {
        console.log("M503");
        // command = e.target.;
    }

    return (
        <Grid container columnSpacing={1} alignItems="center">
            <Grid item xs={6}>
                <TextField variant="standard" type="text"
                           onChange={handleChange}/>
            </Grid>
            <Grid item xs={2}>
                <Button onClick={() => {
                    sendData("M503")
                }}
                        sx={{m: 1, minWidth: 120}}
                        variant="contained"
                        color="success">Send</Button>
            </Grid>
        </Grid>
    )
}

export default Monitor;
