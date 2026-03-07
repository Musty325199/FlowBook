import express from "express";
import { body } from "express-validator";
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  enable2FA,
  confirm2FA,
  disable2FA,
  googleLogin,
  getMe
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { loginLimiter, twoFALimiter } from "../middleware/rateLimiter.js";


const router = express.Router();

router.get("/me", authMiddleware, getMe);

router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("businessName").notEmpty()
  ],
  register
);

router.get("/verify-email/:token", verifyEmail);

router.post("/login", loginLimiter, login);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.post("/forgot-password", body("email").isEmail(), forgotPassword);

router.post("/reset-password/:token", body("password").isLength({ min: 6 }), resetPassword);

router.post("/enable-2fa", authMiddleware, enable2FA);

router.post("/confirm-2fa", twoFALimiter, authMiddleware, confirm2FA);

router.post("/disable-2fa", authMiddleware, disable2FA);

router.post("/google", googleLogin);

export default router;