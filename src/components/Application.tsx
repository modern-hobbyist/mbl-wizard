import React from 'react';
import {Grid} from "@mui/material";
import {ConnectButton} from "./ConnectButton";
import {PortSelect} from "./PortSelect";
import {SendButton} from "./SendButton";
import {BaudSelect} from "./BaudSelect";
import {MeshPointInput} from "./MeshPointInput";
import {BedDimensionInput} from "./BedDimensionInput";
import {useAppDispatch} from "../hooks";
import {calculateMeshPoints, setBedXDimension, setBedYDimension} from "../actions/meshActions";

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
                    <SendButton/>
                </Grid>
            </Grid>
            <Grid container columnSpacing={1}>
                <Grid item xs={3}>
                    <MeshPointInput/>
                </Grid>
                <Grid item xs={3}>
                    <BedDimensionInput
                        id="bedXDimension"
                        label="Bed X Dimension"
                        callback={e => {
                            dispatch(setBedXDimension(Number(e.target.value)))
                            calculateMeshPoints()
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <BedDimensionInput
                        id="bedYDimension"
                        label="Bed Y Dimension"
                        callback={e => {
                            dispatch(setBedYDimension(Number(e.target.value)))
                            calculateMeshPoints()
                        }}
                    />
                </Grid>
            </Grid>
        </div>
    )
}

export default Application;
