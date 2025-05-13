import express from "express";
import { getMyAccessLogs } from "../controllers/access-logs-controller.js";
import { verifyToken } from "../../../utils.js";

const accessLogsRouter = express.Router();

accessLogsRouter.get("/access-logs", verifyToken, getMyAccessLogs);

export default accessLogsRouter;
