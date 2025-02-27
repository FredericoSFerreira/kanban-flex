const express = require('express')
const ParseServer = require('parse-server').ParseServer
require('dotenv').config()
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const host = process.env.APP_HOST || 'localhost'
const port = process.env.APP_PORT || 3000
const sendEmail = require('./email')
const {generateOtp} = require("./utils");

const api = new ParseServer({
  cloud: './cloud/main.js',
  databaseURI: process.env.DATABASE_URI,
  appId: process.env.PARSE_APP_ID,
  masterKey: process.env.PARSE_MASTER_KEY,
  liveQuery: {
    classNames: ['boards', 'otp']
  },
  serverURL: `${host}:${port}/parse`,
  logLevel: 'INFO',
  allowClientClassCreation: true,
});


api.start();

app.use(bodyParser.json())

app.use(cors({
  origin: '*'
}));
app.use('/parse', api.app);

app.get('/healthcheck', (req, res) => {
  res.send('OK')
})


app.post('/send-otp', async (req, res) => {
  try {
    const email = req.body.email
    const userData = await Parse.Cloud.run("getOtp", {email});
    const name = userData.name
    const code = generateOtp()
    await Parse.Cloud.run("updateOtp", {email, code});
    await sendEmail(req.body.email, name, code)
    res.send('OK')
  } catch (e) {
    console.log("Occurred error in send otp", e)
    res.status(500);
    res.send("Occurred error in send otp");
  }
})


app.post('/check-otp', async (req, res) => {
  try {
    const email = req.body.email
    const code = req.body.code
    const isValid = await Parse.Cloud.run("checkOtp", {email, code});
    if (isValid) {
      await Parse.Cloud.run("updateOtp", {email, code: generateOtp()});
      res.json({'isValid': true})
    } else {
      res.status(403);
      res.json({'isValid': false})
    }

  } catch (e) {
    console.log("Occurred error in send otp", e)
    res.status(500);
    res.send("Occurred error in send otp");
  }
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
