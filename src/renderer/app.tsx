import * as React from 'react';
import {Provider} from 'react-redux';

import {createRoot} from 'react-dom/client';
import Application from "./components/Application";
import {store} from "./store";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {createTheme, MuiThemeProvider} from "@material-ui/core";

const container = document.getElementById('app');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const theme = createTheme({
    // status: {
    //     danger: orange[500],
    // },
});

root.render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}> <Application/>
        </MuiThemeProvider>
    </Provider>);