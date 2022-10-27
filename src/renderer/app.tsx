import * as React from 'react';
import {Provider} from 'react-redux';

import {createRoot} from 'react-dom/client';
import Application from "./components/Application";
import {store} from "./store";

const container = document.getElementById('app');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
    <Provider store={store}>
        <Application/>
    </Provider>);