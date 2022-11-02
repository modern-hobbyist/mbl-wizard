import React from 'react';
import {Grid} from "@mui/material";
import {ConnectButton} from "./ConnectButton";
import {PortSelect} from "./PortSelect";
import {StartButton} from "./StartButton";
import {BaudSelect} from "./BaudSelect";
import {useAppDispatch} from "../hooks";
import {NextButton} from "./NextButton";
import {ZHeightButton} from "./ZHeightButton";
import {decreaseZHeight, increaseZHeight} from "../actions/meshActions";
import {ArrowDownward, ArrowUpward} from "@mui/icons-material";

export function Application() {
    const dispatch = useAppDispatch();

    return (
        <div>
            <Grid container columnSpacing={1}>
                <Grid item xs={3}>
                    <BaudSelect/>
                </Grid>
                <Grid item xs={9}>
                    <PortSelect/>
                </Grid>
                <Grid item xs={3}>
                    <ConnectButton/>
                </Grid>
                <Grid item xs={2}>
                    <StartButton/>
                </Grid>
                <Grid item xs={2}>
                    <NextButton/>
                </Grid>
            </Grid>
            <Grid container columnSpacing={1}>
                <Grid item xs={2}>
                    <ZHeightButton icon={<ArrowUpward/>} callback={() => {
                        dispatch(increaseZHeight);
                    }}/>
                </Grid>
                <Grid item xs={2}>
                    <ZHeightButton icon={<ArrowDownward/>} callback={() => {
                        dispatch(decreaseZHeight);
                    }}/>
                </Grid>
            </Grid>
            {/*TODO add mesh point printout grid*/}
            {/*TODO add controls for z position*/}
            {/*TODO add next point button*/}

        </div>
    )
}

export default Application;
