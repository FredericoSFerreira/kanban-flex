import express from "express";
import { checkOtp, register, sendOtp, authGoogle } from "../controllers/auth-controller.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/check-otp", checkOtp);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/auth/google", authGoogle);

export default authRouter;
