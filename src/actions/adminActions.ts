import {Action, ActionCreator} from 'redux';

export const TEST = 'TEST';

export interface TestAction extends Action {
    type: 'TEST';
}

export const setTest: ActionCreator<TestAction> = () => ({
    type: TEST
});

export type AdminAction = | TestAction // | OtherAction
