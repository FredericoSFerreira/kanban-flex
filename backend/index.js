import express from 'express';
import { ParseServer } from 'parse-server';
import 'dotenv/config'
import bodyParser from 'body-parser';
import cors from 'cors';
import sendEmail from './email.js';
import {generateOtp, generateToken, verifyToken, requestInfo} from './utils.js';
import http from 'http';

const app = express();
const host = process.env.APP_HOST || 'localhost';
const port = process.env.APP_PORT || 3000;

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
app.use(requestInfo);

app.get('/healthcheck', (req, res) => {
  res.send('OK')
})


app.get('/my-boards', verifyToken, async (req, res) => {
  console.log(req.user, "HERER")
    try {
    const userData = await Parse.Cloud.run("getMyBoards", req.user);
    res.status(200);
    res.json(userData)
  } catch (e) {
    console.log("Occurred error in send otp", e)
    res.status(500);
    res.send("Occurred error in send otp");
  }
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


app.post('/register', async (req, res) => {
  try {
    const email = req.body.email
    const name = req.body.name
    const phone = req.body.phone
    const { ip, userAgent } = req.clientInfo;
    const resultSave = await Parse.Cloud.run("saveOtp", {email, name, phone, ip, userAgent});
    const { conflict } = resultSave
    if (conflict) {return res.status(409).send('Email already registered')}
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
    const { ip, userAgent } = req.clientInfo;
    const otpData = await Parse.Cloud.run("checkOtp", {email, code,  ip, userAgent});
    if (otpData) {
      await Parse.Cloud.run("updateOtp", {email, code: generateOtp(), isValid: true});
      const token = await generateToken({ email: email, name: otpData.name, id: otpData.id});
      res.json({'isValid': true, 'token': token})
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





const httpServer = http.createServer(app);
httpServer.listen(port, () => {
  try {
    ParseServer.createLiveQueryServer(httpServer);
  } catch (e) {
    console.log("Occurred error in start parse server")
  }
  console.log(`API - port ${port}`)
});
