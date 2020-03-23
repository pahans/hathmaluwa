import 'typeface-roboto';
import App from './components/Home';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

ReactDOM.hydrate(
    <App />,
    document.getElementById('root')
);