import express from "express";
import {getBoardStats, getMyBoards, getBoardSummary} from "../controllers/boards-controller.js";
import { verifyToken } from "../../../utils.js";

const boardsRouter = express.Router();

boardsRouter.get("/my-boards", verifyToken, getMyBoards);

boardsRouter.get("/boards/stats/:id", verifyToken, getBoardStats);

boardsRouter.get("/boards/summary/:id", verifyToken, getBoardSummary);

export default boardsRouter;
