import { Router } from "express";
import { signupUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/refresh_access_token", authMiddleware, refreshAccessToken);

export default router;
