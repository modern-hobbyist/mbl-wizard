import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";
import {useAppDispatch, useAppSelector} from "../hooks";
import {updateSpecificMeshPoint} from "../actions/meshActions";

export function MeshDisplay() {
    const dispatch = useAppDispatch()
    const meshXPoints = useAppSelector(state => state.root.meshState.meshXPoints)
    const meshYPoints = useAppSelector(state => state.root.meshState.meshXPoints)
    const meshData = useAppSelector(state => state.root.meshState.meshData)
    const zChangeAmount = useAppSelector(state => state.root.meshState.zChangeAmount)

    //TODO update to actually use the meshData
    //TODO add ability to change individual points.
    //TODO add a warning that it can be dangerous to change points directly, make sure to double check before saving to printer.
    const meshDisplayItems = [];
    for (let row = 0; row < meshXPoints; row++) {
        const colItems = [];
        for (let col = 0; col < meshYPoints; col++) {
            colItems.push(
                <Grid item xs={2} key={`item-${row}-${col}`}>
                    <TextField variant="standard" defaultValue={meshData[row][col]} type="number"
                               onChange={(event) => {
                                   dispatch(updateSpecificMeshPoint(row, col, parseFloat(event.target.value)))
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
                        {meshDisplayItems}
                    </Box>
                </CardContent>
            </React.Fragment>
        </Card>
    );


    return (
        <Accordion sx={{my: 2, mx: 1, minWidth: 120}}>
            <AccordionSummary
                expandIcon={<ExpandMore/>}
                aria-controls="current-mesh-accordion"
                id="current-mesh-accordion"
            >
                <Typography>Current Mesh</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{minWidth: 275}}>
                    {card}
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}