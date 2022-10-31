import {Reducer} from 'redux';

import {
    MeshAction,
    SET_BED_X_DIMENSION,
    SET_BED_Y_DIMENSION,
    SET_MESH_POINTS,
    SET_MESH_POINTS_COUNT
} from '../actions/meshActions';

export interface MeshState {
    readonly meshPointsCount: number;
    readonly meshPoints: string;
    readonly bedXDimension: number;
    readonly bedYDimension: number;
}

const defaultState: MeshState = {
    meshPointsCount: 25,
    meshPoints: "{}",
    bedXDimension: 210,
    bedYDimension: 210,
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
        case SET_MESH_POINTS:
            return {
                ...state,
                meshPoints: action.value
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
        default:
            return state;
    }
};
