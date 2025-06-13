import express from "express";
import { checkOtp, register, sendOtp, authGoogle } from "../controllers/auth-controller.js";
import {rateLimiter} from "../../../middleware/rate-limiter.js";
const authRateLimit =  Number(process.env.AUTH_RATE_LIMIT) || 5;

const authRouter = express.Router();

authRouter.post("/register", rateLimiter(authRateLimit, 60000), register);
authRouter.post("/check-otp", rateLimiter(authRateLimit, 60000), checkOtp);
authRouter.post("/send-otp", rateLimiter(authRateLimit, 60000), sendOtp);
authRouter.post("/auth/google", authGoogle);

export default authRouter;
