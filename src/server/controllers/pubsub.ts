import pubSubHubbub from 'pubsubhubbub';

const topic = 'https://testsitepahan.blogspot.com/feeds/posts/default';
const hub = 'http://pubsubhubbub.appspot.com/';

const pubsub = pubSubHubbub.createServer({
    callbackUrl: 'https://hathmaluwa-nodejs.appspot.com/pubSubHubbub' 
});

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

export default pubsub;
