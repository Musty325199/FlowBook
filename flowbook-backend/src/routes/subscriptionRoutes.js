import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  startSubscription,
  webhook,
  cancelSubscription,
  verifySubscription,
  startBookingPayment,
  verifyBookingPayment
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

router.post("/start", authMiddleware, startSubscription);

router.post("/verify", authMiddleware, verifySubscription);

router.post("/cancel", authMiddleware, cancelSubscription);

router.post("/start-booking", startBookingPayment);

router.post("/verify-booking", verifyBookingPayment);

export default router;