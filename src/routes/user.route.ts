import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import { register, login, logout, searchUser } from "../controllers/user.controller";
import { verifyOTP } from "../controllers/global.controller";
import { acceptFriendReq, cancelFriendReq, getFriendReqReceived, getFriendReqSent, getFriends, rejectFriendReq, removeFriend, sendFriendReq } from "../controllers/friendList.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verifyOTP", verifyOTP);

router.post("/logout", authenticate, logout);
router.get("/search/:username", authenticate, searchUser);

router.get("/getFriends", authenticate, getFriends);
router.get("/friendReqSent", authenticate, getFriendReqSent);
router.get("/friendReqReceived", authenticate, getFriendReqReceived);
router.post("/sendFriendReq", authenticate, sendFriendReq);
router.post("/acceptFriendReq", authenticate, acceptFriendReq);
router.patch("/rejectFriendReq", authenticate, rejectFriendReq);
router.patch("/cancelFriendReq", authenticate, cancelFriendReq);
router.patch("/removeFriend", authenticate, removeFriend);

export default router;