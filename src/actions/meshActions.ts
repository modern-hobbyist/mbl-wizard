import {Action, ActionCreator} from 'redux';
import {RootState, store} from "../store";
import {ThunkAction} from "redux-thunk";
import {AnyAction} from "@reduxjs/toolkit";
import {sendData, setAwaitingResponse, waitForFirstResponse} from "./adminActions";
import {parseResponse} from "../utilities/utilities";

export const SET_MESH_DATA = 'SET_MESH_DATA';
export const SET_MESH_X_POINTS = 'SET_MESH_X_POINTS';
export const SET_MESH_Y_POINTS = 'SET_MESH_Y_POINTS';
export const SET_CURRENT_MESH_POINT = 'SET_CURRENT_MESH_POINT';
export const SET_BED_X_DIMENSION = 'SET_BED_X_DIMENSION';
export const SET_BED_Y_DIMENSION = 'SET_BED_Y_DIMENSION';
export const SET_CREATING_MESH = 'SET_CREATING_MESH';
export const SET_Z_CHANGE_AMOUNT = 'SET_Z_CHANGE_AMOUNT';

export interface SetCurrentMeshPointAction extends Action {
    type: 'SET_CURRENT_MESH_POINT';
    value: number;
}

export const setCurrentMeshPoint: ActionCreator<SetCurrentMeshPointAction> = (currentMeshPoint: number) => ({
    type: SET_CURRENT_MESH_POINT,
    value: currentMeshPoint
});

export interface SetMeshXPointsAction extends Action {
    type: 'SET_MESH_X_POINTS';
    value: number;
}

export const setMeshXPoints: ActionCreator<SetMeshXPointsAction> = (meshPoints: number) => ({
    type: SET_MESH_X_POINTS,
    value: meshPoints
});

export interface SetMeshYPointsAction extends Action {
    type: 'SET_MESH_Y_POINTS';
    value: number;
}

export const setMeshYPoints: ActionCreator<SetMeshYPointsAction> = (meshPoints: number) => ({
    type: SET_MESH_Y_POINTS,
    value: meshPoints
});

export interface SetMeshData extends Action {
    type: 'SET_MESH_DATA';
    value: [];
}

export const setMeshData: ActionCreator<SetMeshData> = (meshData: []) => ({
    type: SET_MESH_DATA,
    value: meshData
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

export interface SetCreatingMeshAction extends Action {
    type: 'SET_CREATING_MESH';
    value: boolean;
}

export const setCreatingMesh: ActionCreator<SetCreatingMeshAction> = (creatingMesh: boolean) => ({
    type: SET_CREATING_MESH,
    value: creatingMesh
});

export interface SetZChangeAmountAction extends Action {
    type: 'SET_Z_CHANGE_AMOUNT';
    value: number;
}

export const setZChangeAmount: ActionCreator<SetZChangeAmountAction> = (zChangeAmount: number) => ({
    type: SET_Z_CHANGE_AMOUNT,
    value: zChangeAmount
});

export type MeshAction =
    | SetCurrentMeshPointAction
    | SetMeshData
    | SetMeshXPointsAction
    | SetMeshYPointsAction
    | SetBedXDimensionAction
    | SetBedYDimensionAction
    | SetCreatingMeshAction
    | SetZChangeAmountAction;

export async function getExistingMesh() {
    const printerMeshResponse = waitForFirstResponse("State: ");
    sendData("G29 S0");
    const currentMeshResponse = await printerMeshResponse;
    const parsedMesh = parseResponse(currentMeshResponse);

    const [xPoints, yPoints] = extractXYMeshPoints(parsedMesh[1]);
    const meshData = interpretMeshData(parsedMesh, xPoints, yPoints);

    store.dispatch(setMeshXPoints(xPoints));
    store.dispatch(setMeshYPoints(yPoints));

}

function interpretMeshData(parsedMesh: string[], xPoints: number, yPoints: number) {
    // 0:"State: Off"
    // 1:"Num X,Y: 5,5"
    // 2:"Z offset: 0.00000"
    // 3:"Measured points:"
    // 4:"0        1        2        3        4"
    // 5:"0 +0.00000 +0.06000 +0.12000 +0.08000 -0.02000"
    // 6:"1 -0.04000 +0.04000 +0.10000 +0.12000 +0.00000"
    // 7:"2 -0.08000 +0.00000 +0.10000 +0.06000 -0.04000"
    // 8:"3 -0.08000 +0.02000 +0.06000 +0.08000 -0.04000"
    // 9:"4 -0.04000 +0.06000 +0.10000 +0.08000 -0.04000"
    // 10:"X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0"
    // 11:"ok"


    const meshData = [];
    const meshStartIndex = 5;

    for (let i = meshStartIndex; i < meshStartIndex + xPoints; i++) {
        const row = parsedMesh[i].split(" ").slice(1);
        meshData[i - meshStartIndex] = [];
        for (let j = 0; j < yPoints; j++) {
            meshData[i - meshStartIndex].push(parseFloat(row[j]).toFixed(2));
        }
    }

    store.dispatch(setMeshData(meshData));

    return meshData;
}

function extractXYMeshPoints(numXY: string): [number, number] {
    const pointsString = numXY.split(":").pop().trim();
    const pointsArray = pointsString.split(",");

    return [Number.parseInt(pointsArray[0]), Number.parseInt(pointsArray[1])];
}

export async function startMeshBedLeveling() {
    //TODO parse mesh point count
    console.log("Starting MBL!");
    store.dispatch(setCurrentMeshPoint(0));
    store.dispatch(setCreatingMesh(true));

    //TODO do I need to call get mesh here?

    const printerResponsePromise = waitForFirstResponse("MBL G29 point");
    await sendData("G29 S1");
    //Once it gets to point 1, it sends this: "MBL G29 point 1 of 25"
    const firstPointResponse = await printerResponsePromise
    console.log(parseResponse(firstPointResponse));
}

export async function nextMeshPoint() {
    let printerResponse: string;

    //Set up the listener first, then send the data.
    let printerResponsePromise = waitForFirstResponse("MBL G29 point");
    await sendData("G29 S2");
    printerResponse = await printerResponsePromise;
    console.log(parseResponse(printerResponse));

    printerResponsePromise = waitForFirstResponse();
    await sendData("G29 S0");
    printerResponse = await printerResponsePromise
    console.log(parseResponse(printerResponse));
}

export async function increaseZHeight() {
    //TODO only perform if currently if creatingMesh
    const zAmount = store.getState().root.meshState.zChangeAmount;
    await adjustZHeight(`${zAmount}`);
}

export async function decreaseZHeight() {
    //TODO only perform if currently if creatingMesh
    const zAmount = store.getState().root.meshState.zChangeAmount;
    await adjustZHeight(`-${zAmount}`); //TODO add negative back in later
}

async function adjustZHeight(zAmount: string) {
    let printerResponsePromise = waitForFirstResponse();

    printerResponsePromise = waitForFirstResponse();
    await sendData(`G1 Z${zAmount}`);
    console.log("Command sent");

    const printerResponse = await printerResponsePromise;
    console.log(parseResponse(printerResponse));

    printerResponsePromise = waitForFirstResponse();
    await sendData("G90");
    console.log("Command sent");
}

export async function cancelMeshBedLeveling() {
    console.log("Cancelling MBL!");
    store.dispatch(setCurrentMeshPoint(0));
    store.dispatch(setCreatingMesh(false));
    store.dispatch(setAwaitingResponse(false))
    //TODO reset mesh? delete current mesh progress?
}

/***
 * The goal of this function is just to build out a basic GCode sender, like a barebones Pronterface
 * @param gcode
 */
export function sendGCode(gcode: string) {
    console.log(gcode)
}

export async function resetMesh() {
    store.dispatch(setMeshData([]));
    store.dispatch(setMeshXPoints(0));
    store.dispatch(setMeshYPoints(0));
}

export const updateSpecificMeshPoint =
    (xCoord: number, yCoord: number, value: number): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            //TODO handle the case for 5
            console.log("X: ", xCoord, " Y: ", yCoord, " Val: ", value);
            const printerResponsePromise = waitForFirstResponse();
            await sendData(`G29 S3 I${xCoord} J${yCoord} Z${value}`);

            const printerResponse = await printerResponsePromise;
            if (printerResponse.startsWith("X not entered.")) {
                const printerResponsePromise = waitForFirstResponse();
                await sendData(`G29 S3 X${xCoord + 1} Y${yCoord + 1} Z${value}`);
                await printerResponsePromise;
            }
            getExistingMesh();
        }