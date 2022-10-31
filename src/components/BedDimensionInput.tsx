import React from 'react';
import {FormControl, TextField} from "@mui/material";

type BedDimensionProps = {
    id: string;
    label: string;
    callback?: (event) => void;
};

//TODO add support for 5
export function BedDimensionInput({id, label, callback}: BedDimensionProps) {

    return (
        <FormControl fullWidth sx={{m: 1, minWidth: 120}}>
            <TextField
                fullWidth
                type="number"
                id={id}
                label={label}
                defaultValue="210"
                onBlur={callback}
            > </TextField>
        </FormControl>
    )
}