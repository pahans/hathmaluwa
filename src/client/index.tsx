import 'typeface-roboto';
import App from './components/Home';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

ReactDOM.hydrate(
    <App />,
    document.getElementById('root')
);