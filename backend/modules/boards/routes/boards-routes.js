import express from "express";
import {getBoardStats, getMyBoards, getParticipatingBoards, getBoardSummary} from "../controllers/boards-controller.js";
import { verifyToken } from "../../../utils.js";
import { rateLimiter } from "../../../middleware/rate-limiter.js";
const boardSummaryRateLimit =  Number(process.env.BOARD_SUMMARY_RATE_LIMIT) || 10;

const boardsRouter = express.Router();

boardsRouter.get("/my-boards", verifyToken, getMyBoards);
boardsRouter.get("/boards/participating", verifyToken, getParticipatingBoards);

boardsRouter.get("/boards/stats/:id", verifyToken, getBoardStats);

boardsRouter.get("/boards/summary/:id", verifyToken, rateLimiter(boardSummaryRateLimit, 60000), getBoardSummary);

export default boardsRouter;
