'use strict';

const express = require('express');
const path = require('path');
const errorHandler = require('errorhandler');
const pubSubHubbub = require('pubsubhubbub');

const app = express();

const PUBSUB_PATH = '/pubSubHubbub';

const pubsub = pubSubHubbub.createServer({
  callbackUrl: 'https://hathmaluwa-nodejs.appspot.com/' + PUBSUB_PATH,
  secret: 'MyTopSecret'
});

app.use(PUBSUB_PATH, pubsub.listener());

app.get('/', (req, res) =>{
  res.sendFile(path.join(__dirname+'/../client/dist/index.html'));
});

app.use('/static', express.static(path.join(__dirname+'/../client/dist')))

app.use(errorHandler());

const topic = 'http://testetstetss.blogspot.com/feeds/posts/default';
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
});

module.exports = app;
