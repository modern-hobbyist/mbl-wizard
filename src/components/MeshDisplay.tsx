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

export function MeshDisplay() {
    const dispatch = useAppDispatch()
    const meshData = JSON.parse(useAppSelector(state => state.root.meshState.meshData))
    const zChangeAmount = useAppSelector(state => state.root.meshState.zChangeAmount)

    //TODO update to actually use the meshData
    //TODO add ability to change individual points.
    //TODO add a warning that it can be dangerous to change points directly, make sure to double check before saving to printer.
    const meshItems = [];
    for (let row = 0; row < 5; row++) {
        const colItems = [];
        for (let col = 0; col < 5; col++) {
            colItems.push(
                <Grid item xs={2} key={`item-${row}-${col}`}>
                    <TextField variant="standard" defaultValue="0.01" type="number"
                               onChange={() => {
                                   //TODO set the actual grid point value here.
                                   console.log("Changed");
                               }}
                               inputProps={{step: `${zChangeAmount}`}}
                    />
                </Grid>
            )
        }

        meshItems.push(
            <Grid container columnSpacing={1} justifyContent="center" key={`row-${row}`}>
                <Grid item xs={1} key={`item-${row}-label`}>
                    <Typography align="center" sx={{color: 'text.secondary'}}>{row + 1}</Typography>
                </Grid>
                {colItems}
            </Grid>
        )
    }

    const card = (
        <Card variant="outlined">
            <React.Fragment>
                <CardContent>
                    <Box>
                        <Grid container columnSpacing={1} justifyContent="center" key={`titles`}>
                            <Grid item xs={2} key={`titles-1`}>
                                <Typography align="center" sx={{color: 'text.secondary'}}>1</Typography>
                            </Grid>
                            <Grid item xs={2} key={`titles-2`}>
                                <Typography align="center" sx={{color: 'text.secondary'}}>2</Typography>
                            </Grid>
                            <Grid item xs={2} key={`titles-3`}>
                                <Typography align="center" sx={{color: 'text.secondary'}}>3</Typography>
                            </Grid>
                            <Grid item xs={2} key={`titles-4`}>
                                <Typography align="center" sx={{color: 'text.secondary'}}>4</Typography>
                            </Grid>
                            <Grid item xs={2} key={`titles-5`}>
                                <Typography align="center" sx={{color: 'text.secondary'}}>5</Typography>
                            </Grid>
                        </Grid>
                        {meshItems}
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