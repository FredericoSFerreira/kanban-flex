import express from "express";
import { updateUser } from "../controllers/user-controller.js";
import { verifyToken } from "../../../middleware/auth.js";

const usersRouter = express.Router();

usersRouter.put("/user", verifyToken, updateUser);

export default usersRouter;
