import express from "express";
import { getMyBoards } from "../controllers/boards-controller.js";
import { verifyToken } from "../../../utils.js";

const boardsRouter = express.Router();

boardsRouter.get("/my-boards", verifyToken, getMyBoards);

export default boardsRouter;
