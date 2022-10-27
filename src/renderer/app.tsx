import * as React from 'react';
import {Provider} from 'react-redux';

import store from './store';
import {createRoot} from 'react-dom/client';
import Application from "./components/Application";

const container = document.getElementById('app');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
    <Provider store={store}>
        <Application/>
    </Provider>);