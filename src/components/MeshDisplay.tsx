import React from 'react';
import {Box, Card, CardContent, Grid, TextField, Typography} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {updateSpecificMeshPoint} from "../actions/meshActions";

export function MeshDisplay() {
    const dispatch = useAppDispatch()
    const meshXPoints = useAppSelector(state => state.root.meshState.meshXPoints)
    const meshYPoints = useAppSelector(state => state.root.meshState.meshXPoints)
    const meshData = useAppSelector(state => state.root.meshState.meshData)
    const zChangeAmount = useAppSelector(state => state.root.meshState.zChangeAmount)

    const altMeshMessage = (
        <Typography align="center" sx={{color: 'text.secondary'}}>No Mesh Data</Typography>
    )

    //TODO update to actually use the meshData
    //TODO add ability to change individual points.
    //TODO add a warning that it can be dangerous to change points directly, make sure to double check before saving to printer.
    const meshDisplayItems = [];
    for (let row = 0; row < meshXPoints; row++) {
        const colItems = [];
        for (let col = 0; col < meshYPoints; col++) {
            colItems.push(
                <Grid item xs={2} key={`item-${row}-${col}`}>
                    <TextField variant="outlined"
                               size="small" defaultValue={meshData[row][col]} type="number"
                               onChange={(event) => {
                                   dispatch(updateSpecificMeshPoint(col, row, parseFloat(event.target.value)))
                               }}
                               inputProps={{step: `${zChangeAmount}`}}
                    />
                </Grid>
            )
        }

        meshDisplayItems.push(
            <Grid container columnSpacing={1} justifyContent="center" key={`row-${row}`}>
                <Grid item xs={1} key={`item-${row}-label`}>
                    <Typography align="center" sx={{color: 'text.secondary'}}>{row + 1}</Typography>
                </Grid>
                {colItems}
            </Grid>
        )
    }

    const meshLabels = [];
    for (let index = 0; index < meshYPoints; index++) {
        meshLabels.push(
            <Grid item xs={2} key={`titles-${index}`}>
                <Typography align="center" sx={{color: 'text.secondary'}}>{index}</Typography>
            </Grid>
        )
    }

    const card = (
        <Card variant="outlined">
            <React.Fragment>
                <CardContent>
                    <Box>
                        <Grid container columnSpacing={1} justifyContent="center" key={`titles`}>
                            {meshLabels}
                        </Grid>
                        {meshDisplayItems.length > 0 ? meshDisplayItems : altMeshMessage}
                    </Box>
                </CardContent>
            </React.Fragment>
        </Card>
    );


    return (
        <Box sx={{m: 1}}>
            {card}
        </Box>
    )
}