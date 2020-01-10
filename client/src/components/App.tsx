import * as React from 'react';

export interface HelloProps { compiler: string; framework: string; }

export default class Welcome extends React.Component {
    render() {
      return <h1>Pretty Soon There Will Be an Awesome React App Deployed here.</h1>;
    }
}

