import express from "express";
import { ParseServer } from "parse-server";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import { requestInfo } from "./middleware/request-info.js";
import boardsRouter from "./modules/boards/routes/boards-routes.js";
import http from "http";
import authRouter from "./modules/auth/routes/auth-routes.js";
import accessLogsRouter from "./modules/accessLogs/routes/access-logs-routes.js";
import usersRouter from "./modules/users/routes/users-routes.js";

const app = express();
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
  logLevel: "INFO",
  allowClientClassCreation: true,
});

api.start();

app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);
app.use("/parse", api.app);
app.use(requestInfo);

app.get("/healthcheck", (req, res) => {
  res.send("OK");
});

app.use(boardsRouter);
app.use(authRouter);
app.use(accessLogsRouter);
app.use(usersRouter);

const httpServer = http.createServer(app);
httpServer.listen(port, () => {
  try {
    ParseServer.createLiveQueryServer(httpServer);
  } catch {
    console.log("An error ocurred while starting parse server");
  }
  console.log(`API - port ${port}`);
});
