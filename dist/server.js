'use strict';
const express = require('express');
const path = require('path');
const app = express();
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .send('Hello, world!')
//     .end();
// });
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../client/dist/index.html'));
});
app.use('/static', express.static(path.join(__dirname + '/../client/dist')));
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
    console.log(path.join(__dirname + '/../client/dist'));
});
module.exports = app;
//# sourceMappingURL=server.js.map