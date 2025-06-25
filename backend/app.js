import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import {requestInfo} from "./middleware/request-info.js";
import boardsRouter from "./modules/boards/routes/boards-routes.js";
import authRouter from "./modules/auth/routes/auth-routes.js";
import accessLogsRouter from "./modules/accessLogs/routes/access-logs-routes.js";
import usersRouter from "./modules/users/routes/users-routes.js";
import helmet from 'helmet';

const app = express();

app.use(helmet());

app.use(bodyParser.json());

app.use(
  cors({
    origin: [process.env.FRONT_HOST, "http://localhost:5173"],
  })
);

app.use(requestInfo);

app.get("/healthcheck", (req, res) => {
  res.send("OK");
});

app.use(boardsRouter);
app.use(authRouter);
app.use(accessLogsRouter);
app.use(usersRouter);


export default app;
