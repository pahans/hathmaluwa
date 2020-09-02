import 'typeface-roboto';
import App from './components/App';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.hydrate(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    ,
    document.getElementById('root')
);