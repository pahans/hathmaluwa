import * as React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles, ThemeProvider, useTheme, createMuiTheme } from '@material-ui/core/styles';
import { Typography, CssBaseline } from '@material-ui/core';
import Header from './header';


function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true }); 
  // noSSr https://github.com/mui-org/material-ui/issues/14336
  const [darkMode, setDarkMode] = React.useState(prefersDarkMode);

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header setDarkMode={()=> setDarkMode(!darkMode)}></Header>
    </ThemeProvider>
  );
}

export default App;