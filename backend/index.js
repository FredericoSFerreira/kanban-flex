const express = require('express')
const ParseServer = require('parse-server').ParseServer
require('dotenv').config()
const app = express()
const host = process.env.APP_HOST || 'localhost'
const port = process.env.APP_PORT || 3000

const api = new ParseServer({
  databaseURI: process.env.DATABASE_URI,
  cloud: app.cloud,
  appId: process.env.PARSE_APP_ID,
  masterKey: process.env.PARSE_MASTER_KEY,
  liveQuery: {
    classNames: ['boards']
  },
  serverURL: `${host}:${port}/parse`,
  logLevel: 'INFO',
  allowClientClassCreation: true,
});


api.start();

app.use('/parse', api.app);

app.get('/healthcheck', (req, res) => {
  res.send('OK')
})


const httpServer = require('http').createServer(app);
httpServer.listen(port, () => {
  try {
    ParseServer.createLiveQueryServer(httpServer);
  } catch (e) {
    console.log("Occurred error in start parse server")
  }
  console.log(`API - port ${port}`)
});
