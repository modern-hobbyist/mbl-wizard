import {Reducer} from 'redux';

import {
    MeshAction,
    SET_BED_X_DIMENSION,
    SET_BED_Y_DIMENSION,
    SET_CREATING_MESH,
    SET_CURRENT_MESH_POINT,
    SET_MESH_DATA,
    SET_MESH_POINTS_COUNT,
    SET_MESH_X_POINTS,
    SET_MESH_Y_POINTS,
    SET_Z_CHANGE_AMOUNT
} from '../actions/meshActions';

export interface MeshState {
    readonly meshPointsCount: number;
    readonly currentMeshPoint: number;
    readonly meshXPoints: number;
    readonly meshYPoints: number;
    readonly meshData: string;
    readonly bedXDimension: number;
    readonly bedYDimension: number;
    readonly creatingMesh: boolean;
    readonly zChangeAmount: number;
}

const defaultState: MeshState = {
    meshPointsCount: 25,
    currentMeshPoint: 0,
    meshXPoints: 5,
    meshYPoints: 5,
    meshData: "{}",
    bedXDimension: 210,
    bedYDimension: 210,
    creatingMesh: false,
    zChangeAmount: 0.01,
};

export const meshReducer: Reducer<MeshState> = (
    state = defaultState,
    action: MeshAction
) => {
    switch (action.type) {
        case SET_MESH_POINTS_COUNT:
            return {
                ...state,
                meshPointsCount: action.value
            };
        case SET_CURRENT_MESH_POINT:
            return {
                ...state,
                currentMeshPoint: action.value
            };
        case SET_MESH_X_POINTS:
            return {
                ...state,
                meshXPoints: action.value
            };
        case SET_MESH_Y_POINTS:
            return {
                ...state,
                meshYPoints: action.value
            };
        case SET_MESH_DATA:
            return {
                ...state,
                meshData: action.value
            };
        case SET_BED_X_DIMENSION:
            return {
                ...state,
                bedXDimension: action.value
            };
        case SET_BED_Y_DIMENSION:
            return {
                ...state,
                bedYDimension: action.value
            };
        case SET_CREATING_MESH:
            return {
                ...state,
                creatingMesh: action.value
            };
        case SET_Z_CHANGE_AMOUNT:
            return {
                ...state,
                zChangeAmount: action.value
            };
        default:
            return state;
    }
};
