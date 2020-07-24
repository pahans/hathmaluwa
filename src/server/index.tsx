'use strict';

import express from 'express';
import path from 'path';
import errorHandler from 'errorhandler';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { ServerStyleSheets } from '@material-ui/core/styles';
import Posts from '../client/components/posts/post';
import { SignUpRoute } from './routes';
import pubsub from './controllers/pubsub';

var mustacheExpress = require('mustache-express');

const app = express();
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/templates');

app.use('/pubSubHubbub', pubsub.listener());

app.get('/', function (req, res) {
  const sheets = new ServerStyleSheets();
  const reactComp = renderToString(sheets.collect(<Posts />));
  res.render('default', {
    title: 'Home',
    css: sheets,
    body: reactComp,
  });
});

app.use('/signup', SignUpRoute);

app.use('/static', express.static(path.join(__dirname+'/../../client_dist/')))

app.use(errorHandler());

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}, http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
