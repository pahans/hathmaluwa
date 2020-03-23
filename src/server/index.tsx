'use strict';

import express from 'express';
import path from 'path';
import errorHandler from 'errorhandler';
import pubSubHubbub from 'pubsubhubbub';
import { renderToString } from 'react-dom/server';
import React from 'react';
import Home from '../client/components/Home';
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

app.get('/', (req, res) =>{
  const reactComp = renderToString(<Home />);
  res.render('default', {
    title: 'hello',
    body: reactComp
  });
  // res.sendFile(path.join(__dirname+'/../../../client_dist/index.html'));
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
