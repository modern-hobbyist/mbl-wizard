import React from 'react';
import {Box, ButtonGroup, Grid, Paper} from "@mui/material";
import {ConnectButton} from "./ConnectButton";
import {PortSelect} from "./PortSelect";
import {StartButton} from "./StartButton";
import {BaudSelect} from "./BaudSelect";
import {useAppDispatch} from "../hooks";
import {NextButton} from "./NextButton";
import {ZHeightButton} from "./ZHeightButton";
import {decreaseZHeight, increaseZHeight} from "../actions/meshActions";
import {ArrowDownward, ArrowUpward} from "@mui/icons-material";
import {ZHeightSelect} from "./ZHeightSelect";
import {MeshDisplay} from "./MeshDisplay";
import SerialMonitor from "./SerialMonitor";
import CommandPrompt from "./CommandPrompt";
import {SaveButton} from "./SaveButton";
import NotificationSnackbar from "./NotificationSnackbar";

export function Application() {
    const dispatch = useAppDispatch();

    return (
        <Box>
            <NotificationSnackbar/>
            <Paper sx={{position: "fixed", top: 0, bottom: "100px", width: "100%"}}>
                {/*<Paper variant="outlined">*/}
                <Grid container columnSpacing={0} justifyContent="space-between" height="100%">
                    <Grid item xs={12} md={8} height="100%">
                        <Grid container columnSpacing={2} alignItems="space-between">
                            <Grid item xs={2}>
                                <BaudSelect/>
                            </Grid>
                            <Grid item xs={7}>
                                <PortSelect/>
                            </Grid>
                            <Grid item xs={3}>
                                <ConnectButton/>
                            </Grid>
                        </Grid>
                        <Grid container columnSpacing={1} alignItems="center">
                        </Grid>
                        <Grid container columnSpacing={1} alignItems="center">
                            {/*    TODO text area showing the current grid*/}
                            {/*    TODO with editable points?*/}
                            <Grid item xs={12}>
                                <MeshDisplay/>
                            </Grid>
                        </Grid>
                        <Grid container columnSpacing={2} sx={{my: 2}} justifyContent="center">
                            <Grid item xs={2}>
                                <ZHeightSelect/>
                            </Grid>
                            <Grid item xs={2}>
                                <StartButton/>
                            </Grid>
                            <Grid item xs={2}>
                                <ButtonGroup size="medium" sx={{m: 1}} variant="contained">
                                    <ZHeightButton icon={<ArrowUpward/>} callback={() => {
                                        dispatch(increaseZHeight);
                                    }}/>
                                    <ZHeightButton icon={<ArrowDownward/>} callback={() => {
                                        dispatch(decreaseZHeight);
                                    }}/>
                                </ButtonGroup>
                            </Grid>
                            <Grid item xs={2}>
                                <NextButton/>
                            </Grid>
                            <Grid item xs={2}>
                                <SaveButton/>
                            </Grid>
                        </Grid>
                        {/*TODO add mesh point printout grid*/}
                        {/*TODO add controls for z position*/}
                        {/*TODO add next point button*/}
                    </Grid>
                    <Grid item xs={12} md={4} height="100%">
                        <SerialMonitor/>
                    </Grid>
                </Grid>
            </Paper>
            <CommandPrompt/>
        </Box>

    )
}

export default Application;
