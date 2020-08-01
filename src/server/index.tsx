'use strict';

import express from 'express';
import path from 'path';
import errorHandler from 'errorhandler';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { ServerStyleSheets } from '@material-ui/core/styles';
import App from '../client/components/App';
import pubsub from './controllers/pubsub';
import { StaticRouter } from 'react-router-dom';
import { getRSSFeedUrl } from './controllers/services/rssFinder/rssFinder';
import graphql from './controllers/graphql';

var mustacheExpress = require('mustache-express');

const app = express();
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/templates');

app.use('/pubSubHubbub', pubsub.listener());

// TODO: manage server API handling seperatly from client URL handling
// RSS feed url fetcher api.
app.get('/api/getFeedUrl', function (req, res) {
  const blogUrl: string = req.param("url");
  const feedUrl: string = getRSSFeedUrl(blogUrl);
  res.send(feedUrl);
});

app.use('/api', graphql);
app.use('/static', express.static(path.join(__dirname + '/../../client_dist/')));

app.get('/*', function (req, res) {
  const sheets = new ServerStyleSheets();
  const context = {};
  const reactComp = renderToString(sheets.collect(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  ));
  res.render('default', {
    title: 'Home',
    css: sheets,
    body: reactComp,
  });
});

app.use(errorHandler());

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}, http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

export default app;
