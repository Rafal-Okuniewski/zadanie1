'use strict';

const express = require('express');
const requestIp = require('request-ip');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  var clientIp = requestIp.getClientIp(req);
  res.send('Client IP address: ' + clientIp + ' | Client date: ' + new Date().toLocaleString());
});

app.listen(PORT, HOST);
console.log("Start time: " + new Date());
console.log("Author: Rafał Okuniewski");
console.log(`Running on http://${HOST}:${PORT}`);
