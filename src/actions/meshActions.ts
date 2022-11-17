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
    const gCode = "G29 S0";
    const printerMeshResponse = waitForFirstResponse("Measured points:", "Mesh bed leveling has no data.", "Mesh Bed Leveling");
    await sendData(gCode);
    const currentMeshResponse = await printerMeshResponse;
    console.log("Mesh response: ", currentMeshResponse);
    if (currentMeshResponse.indexOf("Measured points:") !== -1) {
        const parsedMesh = parseResponse(currentMeshResponse);

        const [meshData, numPoints] = interpretMeshData(parsedMesh);

        store.dispatch(setMeshXPoints(numPoints));
        store.dispatch(setMeshYPoints(numPoints));
        store.dispatch(setMeshData(meshData));
    } else {
        //No mesh data
        // store.di spatch(setMeshXPoints(0));
        // store.dispatch(setMeshYPoints(0));
        store.dispatch(setMeshData(getEmptyMeshData()));
    }
}

function interpretMeshData(parsedMesh: string[]) {
    // Mesh Bed Leveling OFF
    // 5x5 mesh. Z offset: 0.00000
    // Measured points:
    //     0 1 2 3 4
    // 0 +0.02000 +0.00000 +0.00000 +0.00000 +0.00000
    // 1 +0.00000 +0.00000 +0.00000 +0.00000 +0.00000
    // 2 +0.00000 +0.00000 +0.00000 +0.00000 +0.00000
    // 3 +0.00000 +0.00000 +0.00000 +0.00000 +0.00000
    // 4 +0.00000 +0.00000 +0.00000 +0.00000 +0.00000
    // X:-2.00 Y:0.00 Z:0.00 E:0.00 Count X:-160 Y:0 Z:0
    // ok

    // Old way
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
    let meshStartIndex = 5;

    parsedMesh.forEach((value, index) => {
        if (value.indexOf("Measured points:") !== -1) {
            meshStartIndex = index + 2;
        }
    });

    const [numPoints] = extractXYMeshPoints(parsedMesh[meshStartIndex - 1]);

    for (let i = meshStartIndex; i < meshStartIndex + numPoints; i++) {
        const row = parsedMesh[i].split(" ").slice(1);
        meshData[i - meshStartIndex] = [];
        for (let j = 0; j < numPoints; j++) {
            meshData[i - meshStartIndex].push(parseFloat(row[j]).toFixed(2));
        }
    }


    return [meshData, numPoints];
}

function extractXYMeshPoints(numXY: string): [number] {
    //TODO find a better way of determining the numpoints regardless of firmware version
    // Extract the number of items from this
    // "0        1        2        3        4"
    const pointsString = numXY.replace(/\D/g, '');

    return [pointsString.length];
}

export async function startMeshBedLeveling() {
    store.dispatch(setCurrentMeshPoint(1));
    store.dispatch(setCreatingMesh(true));
    store.dispatch(setMeshData(getEmptyMeshData()));

    let printerResponsePromise = waitForFirstResponse();
    await sendData("G28");
    //Once it gets to point 1, it sends this: "MBL G29 point 1 of 25"
    await printerResponsePromise

    printerResponsePromise = waitForFirstResponse("MBL G29 point");
    await sendData("G29 S1");
    //Once it gets to point 1, it sends this: "MBL G29 point 1 of 25"
    await printerResponsePromise
}

export async function nextMeshPoint() {

    //Set up the listener first, then send the data.
    let printerResponsePromise = waitForFirstResponse("MBL G29 point");
    await sendData("G29 S2");
    const response = await printerResponsePromise;

    const numMeshPoints = store.getState().root.meshState.meshXPoints * store.getState().root.meshState.meshYPoints;
    const currMeshPoint = store.getState().root.meshState.currentMeshPoint;


    if (response.indexOf("MBL G29 point -1") !== -1 || currMeshPoint > numMeshPoints) {
        console.log("Done mbl");
        store.dispatch(setCurrentMeshPoint(1));
        store.dispatch(setCreatingMesh(false));
        //DONE MBL
    } else {
        printerResponsePromise = waitForFirstResponse();
        await sendData(`G0 Z0`);
        await printerResponsePromise

        await getExistingMesh();
        store.dispatch(setCurrentMeshPoint(currMeshPoint + 1))
    }


}

export async function increaseZHeight() {
    const zAmount = store.getState().root.meshState.zChangeAmount;
    await adjustZHeight(`${zAmount}`);
}

export async function decreaseZHeight() {
    const zAmount = store.getState().root.meshState.zChangeAmount;
    await adjustZHeight(`-${zAmount}`);
}

export async function saveConfiguration() {
    const printerResponsePromise = waitForFirstResponse();
    await sendData(`M500`);
    await printerResponsePromise;
}


async function adjustZHeight(zAmount: string) {

    let printerResponsePromise = waitForFirstResponse();
    await sendData("G91");
    await printerResponsePromise;

    printerResponsePromise = waitForFirstResponse();
    await sendData(`G0 Z${zAmount}`);

    await printerResponsePromise;

    printerResponsePromise = waitForFirstResponse();
    await sendData("G90");
    await printerResponsePromise;
}

export async function cancelMeshBedLeveling() {
    store.dispatch(setCurrentMeshPoint(0));
    store.dispatch(setCreatingMesh(false));
    store.dispatch(setAwaitingResponse(false))

    await getExistingMesh();
}

export async function resetMesh() {
    store.dispatch(setMeshData([]));
    store.dispatch(setMeshXPoints(0));
    store.dispatch(setMeshYPoints(0));
}

function getEmptyMeshData(): number[] {
    const mesh = [];
    const meshXPoints = store.getState().root.meshState.meshXPoints;
    const meshYPoints = store.getState().root.meshState.meshYPoints

    for (let row = 0; row < meshYPoints; row++) {
        mesh[row] = [];
        for (let col = 0; col < meshXPoints; col++) {
            mesh[row][col] = 0.00;
        }
    }
    return mesh;
}

export const updateSpecificMeshPoint =
    (xCoord: number, yCoord: number, value: number): ThunkAction<void, RootState, unknown, AnyAction> =>
        async () => {
            const printerResponsePromise = waitForFirstResponse();
            await sendData(`G29 S3 I${xCoord} J${yCoord} Z${value}`);

            const printerResponse = await printerResponsePromise;
            if (printerResponse.startsWith("X not entered.")) {
                const printerResponsePromise = waitForFirstResponse();
                await sendData(`G29 S3 X${xCoord + 1} Y${yCoord + 1} Z${value}`);
                await printerResponsePromise;
            }
            await getExistingMesh();
        }