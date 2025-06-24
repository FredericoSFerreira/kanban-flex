import { ParseServer } from "parse-server";
import "dotenv/config";
import http from "http";
import app from './app.js';
const host = process.env.APP_HOST || "localhost";
const port = process.env.APP_PORT || 3000;

const api = new ParseServer({
  cloud: "./cloud/main.js",
  databaseURI: process.env.DATABASE_URI,
  appId: process.env.PARSE_APP_ID,
  masterKey: process.env.PARSE_MASTER_KEY,
  liveQuery: {
    classNames: ["boards", "otp"],
  },
  serverURL: `${host}:${port}/parse`,
  allowClientClassCreation: false,
  enableClassTransforms: false,
  enableAnonymousUsers: false,
  allowExpiredAuthDataToken: false,
});

api.start();

const httpServer = http.createServer(app);
httpServer.listen(port, () => {
  try {
    ParseServer.createLiveQueryServer(httpServer);
  } catch {
    console.log("An error ocurred while starting parse server");
  }
  console.log(`API - port ${port}`);
});
