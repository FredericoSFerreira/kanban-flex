import express from "express";
import { checkOtp, register, sendOtp } from "../controllers/auth-controller.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/check-otp", checkOtp);
authRouter.post("/send-otp", sendOtp);

export default authRouter;
