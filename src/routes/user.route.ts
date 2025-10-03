import { Router } from "express";

import { register, login, logout } from "../controllers/user.controller";
import { verifyOTP } from "../controllers/global.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verifyOTP", verifyOTP);

router.post("/logout", authenticate, logout);

export default router;