import React from 'react';
import Signup from '../src/client/components/signup';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { withThemes } from '@react-theming/storybook-addon';
import { ThemeProvider } from '@material-ui/core';
import {dark, light} from '../src/client/components/theme';

const providerFn = ({ theme, children }) => {
  const serialTheme = JSON.parse(JSON.stringify(theme));
  const muTheme = createMuiTheme(serialTheme);
  return <ThemeProvider theme={muTheme}>{children}</ThemeProvider>;
};
export default {
  title: 'Signup',
  component: Signup,
  decorators: [withThemes(null, [dark, light], { providerFn })],
};

export const SignupStory = () => <Signup />;

SignupStory.story = {
  name: 'Default',
};
