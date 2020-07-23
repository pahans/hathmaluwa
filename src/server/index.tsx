'use strict';

import express from 'express';
import path from 'path';
import errorHandler from 'errorhandler';
import pubSubHubbub from 'pubsubhubbub';
import { renderToString } from 'react-dom/server';
import React from 'react';
import Home from '../client/components/App';
import { ServerStyleSheets } from '@material-ui/core/styles';
import Posts from '../client/components/posts/post';
import Signup from '../client/components/signup';

var mustacheExpress = require('mustache-express');

const app = express();
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/templates');

const PUBSUB_PATH = '/pubSubHubbub';

const pubsub = pubSubHubbub.createServer({
  callbackUrl: 'https://hathmaluwa-nodejs.appspot.com' + PUBSUB_PATH
});

app.use(PUBSUB_PATH, pubsub.listener());

const posts: any = [
  {
    title: 'Lorem ipsum dolor sit amet',
    summary: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,',
  },
  {
    title: 'Lorem ipsum dolor sit amet',
    summary: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,',
  },
];

app.get('/', (req, res) =>{
  const sheets = new ServerStyleSheets();
  const reactComp = renderToString(sheets.collect(<Posts />));
  res.render('default', {
    title: 'Home',
    css: sheets,
    body: '',
  });
});
app.get('/signup', (req, res) =>{
  const sheets = new ServerStyleSheets();
  const reactComp = renderToString(sheets.collect(<Signup />));
  res.render('default', {
    title: 'Sign Up',
    css: sheets,
    body: reactComp,
  });
});

app.use('/static', express.static(path.join(__dirname+'/../../client_dist/')))

app.use(errorHandler());

const topic = 'https://testsitepahan.blogspot.com/feeds/posts/default';
const hub = 'http://pubsubhubbub.appspot.com/';

pubsub.on('denied', data => {
  console.log('Denied');
  console.log(data);
});

pubsub.on('subscribe', data => {
  console.log('Subscribe');
  console.log(data);

  console.log('Subscribed ' + topic + ' to ' + hub);
});

pubsub.on('unsubscribe', data => {
  console.log('Unsubscribe');
  console.log(data);

  console.log('Unsubscribed ' + topic + ' from ' + hub);
});

pubsub.on('error', error => {
  console.log('Error');
  console.log(error);
});

pubsub.on('feed', data => {
  console.log(data);
  console.log(data.feed.toString());

  pubsub.unsubscribe(topic, hub);
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
  pubsub.subscribe(topic, hub);
});

module.exports = app;
