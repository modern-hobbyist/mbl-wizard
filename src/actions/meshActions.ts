import {Action, ActionCreator} from 'redux';
import {RootState, store} from "../store";
import {ThunkAction} from "redux-thunk";
import {AnyAction} from "@reduxjs/toolkit";
import {normalizeGCode} from "../utilities/utilities";

export const SET_MESH_POINTS = 'SET_MESH_POINTS';
export const SET_MESH_POINTS_COUNT = 'SET_MESH_POINTS_COUNT';
export const SET_BED_X_DIMENSION = 'SET_BED_X_DIMENSION';
export const SET_BED_Y_DIMENSION = 'SET_BED_Y_DIMENSION';

const meshPointsLookup = {
    4: [2, 2],
    9: [3, 3],
    12: [4, 3],
    15: [5, 3],
    25: [5, 5]
};

export interface SetMeshPointsCountAction extends Action {
    type: 'SET_MESH_POINTS_COUNT';
    value: number;
}

export const setMeshPointsCount: ActionCreator<SetMeshPointsCountAction> = (meshPoints: number) => ({
    type: SET_MESH_POINTS_COUNT,
    value: meshPoints
});

export interface SetBedXDimensionAction extends Action {
    type: 'SET_BED_X_DIMENSION';
    value: number;
}

export const setBedXDimension: ActionCreator<SetBedXDimensionAction> = (bedXDimension: number) => ({
    type: SET_BED_X_DIMENSION,
    value: bedXDimension
});

export interface SetBedYDimensionAction extends Action {
    type: 'SET_BED_Y_DIMENSION';
    value: number;
}

export const setBedYDimension: ActionCreator<SetBedYDimensionAction> = (bedYDimension: number) => ({
    type: SET_BED_Y_DIMENSION,
    value: bedYDimension
});

export interface SetMeshPointsAction extends Action {
    type: 'SET_MESH_POINTS';
    value: string;
}

export const setMeshPoints: ActionCreator<SetMeshPointsAction> = (meshPoints: string) => ({
    type: SET_MESH_POINTS,
    value: meshPoints
});

export type MeshAction =
    | SetMeshPointsCountAction
    | SetMeshPointsAction
    | SetBedXDimensionAction
    | SetBedYDimensionAction;

export const updateMeshPointCount =
    (meshPoints: number): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            //TODO handle the case for 5
            store.dispatch(setMeshPointsCount(meshPoints));
            store.dispatch(calculateMeshPoints());
        }

export const calculateMeshPoints =
    (): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            type Point = {
                x: number;
                y: number;
            };
            console.log("Here 2");
            //TODO handle the case for 5
            const numMeshPoints = store.getState().root.meshState.meshPointsCount
            const meshLookupValues = meshPointsLookup[numMeshPoints]
            const meshPointCoords: Point[][] = [];

            //The X spacing is  Δ𝑥=𝑤/(𝑛𝑥−1), same for Y
            const bedXSpacing = store.getState().root.meshState.bedXDimension / (meshLookupValues[0]);
            const bedYSpacing = store.getState().root.meshState.bedYDimension / (meshLookupValues[1]);

            console.log("Bed X Spacing", bedXSpacing);
            console.log("Bed Y Spacing", bedYSpacing);


            //TODO use the spacing to set the coords.
            //1st in row is x spacing/2 y spacing/2

            for (let i = 0; i < meshLookupValues[0]; i++) {
                meshPointCoords[i] = [];
                for (let j = 0; j < meshLookupValues[1]; j++) {
                    meshPointCoords[i][j] = {x: calculateOffset(i, bedXSpacing), y: calculateOffset(j, bedYSpacing)};
                }
            }

            store.dispatch(setMeshPoints(JSON.stringify(meshPointCoords)))
        }


function calculateOffset(index: number, offset: number): number {
    return (offset * index) + (offset * 0.5)
}

export async function sendMeshPoints(writer: WritableStreamDefaultWriter) {
    //TODO make sure points have been calculated
    const numMeshPoints = store.getState().root.meshState.meshPointsCount;
    const meshPoints = JSON.parse(store.getState().root.meshState.meshPoints);
    const meshLookupValues = meshPointsLookup[numMeshPoints];

    await writer.write(normalizeGCode("G1 Z10 F2000", {
        sendLineNumber: false
    }));

    for (let i = 0; i < meshLookupValues[0]; i++) {
        for (let j = 0; j < meshLookupValues[1]; j++) {
            //TODO set absolute positioning?
            //TODO wait for response from printer before continuing
            const gcode = `G1 X${meshPoints[i][j].x} Y${meshPoints[i][j].y} F2000`;

            await writer.write(normalizeGCode(gcode, {
                sendLineNumber: false
            }));
            //
            // await writer.write(normalizeGCode("G1 Z-10 F2000", {
            //     sendLineNumber: false
            // }));
        }
    }
}