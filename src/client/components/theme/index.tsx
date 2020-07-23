import * as React from 'react';
import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';


export const dark = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fff',
        },
    },
});

export const light = createMuiTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fff',
        },
    },
});
