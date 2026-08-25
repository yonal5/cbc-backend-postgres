import express from "express";

import {
    blockOrUnblockUser,
    changePasswordViaOTP,
    createUser,
    getAllUsers,
    getUser,
    googleLogin,
    loginUser,
    sendOTP,
    updatePassword,
    updateUserData
} from "../controllers/userController.js";

import { authMiddleware } from "../middleware/auth.js";

const userRouter = express.Router();

/* =========================
   AUTH
========================= */

// Original frontend route
userRouter.post("/", createUser);

// Also support /register
userRouter.post("/register", createUser);

userRouter.post("/login", loginUser);

userRouter.post(
    "/google-login",
    googleLogin
);

/* =========================
   USERS
========================= */

userRouter.get(
    "/all-users",
    authMiddleware,
    getAllUsers
);

userRouter.put(
    "/block/:email",
    authMiddleware,
    blockOrUnblockUser
);

/* =========================
   PASSWORD / OTP
========================= */

userRouter.get(
    "/send-otp/:email",
    sendOTP
);

userRouter.post(
    "/change-password",
    changePasswordViaOTP
);

/* =========================
   CURRENT USER
========================= */

userRouter.get(
    "/me",
    authMiddleware,
    getUser
);

userRouter.put(
    "/me",
    authMiddleware,
    updateUserData
);

userRouter.put(
    "/me/password",
    authMiddleware,
    updatePassword
);

export default userRouter;
