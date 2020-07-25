import 'typeface-roboto';
import App from './components/App';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.hydrate(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    ,
    document.getElementById('root')
);