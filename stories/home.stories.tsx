import React from 'react';
import { linkTo } from '@storybook/addon-links';
import Home from '../src/client/components/App';
export default {
  title: 'Home',
  component: Home,
};

export const ToStorybook = () => <Home />;

ToStorybook.story = {
  name: 'Default',
};
