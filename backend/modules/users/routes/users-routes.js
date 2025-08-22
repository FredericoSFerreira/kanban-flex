import express from "express";
import { updateUser, getUserMe } from "../controllers/user-controller.js";
import { verifyToken } from "../../../middleware/auth.js";

const usersRouter = express.Router();

usersRouter.put("/user", verifyToken, updateUser);
usersRouter.get("/user/me", verifyToken, getUserMe);

export default usersRouter;
