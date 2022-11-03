import React from 'react';
import {Button, ButtonGroup, Grid} from "@mui/material";
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

declare const MONITOR_WINDOW_WEBPACK_ENTRY: string;

export function Application() {
    const dispatch = useAppDispatch();

    return (
        <div>
            <Grid container columnSpacing={1} alignItems="center">
                <Grid item xs={2}>
                    <BaudSelect/>
                </Grid>
                <Grid item xs={8}>
                    <PortSelect/>
                </Grid>
                <Grid item xs={2}>
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
            </Grid>
            <Grid container columnSpacing={1} justifyContent="center">
                <Grid item xs={2}>
                    <Button
                        onClick={() => {
                            window.open(MONITOR_WINDOW_WEBPACK_ENTRY)
                        }}
                    >
                        Open GCode Sender
                    </Button>
                </Grid>
            </Grid>
            {/*TODO add mesh point printout grid*/}
            {/*TODO add controls for z position*/}
            {/*TODO add next point button*/}

        </div>
    )
}

export default Application;
