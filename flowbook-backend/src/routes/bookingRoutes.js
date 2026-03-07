import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  sendOwnerMessage,
  getBookedSlots
} from "../controllers/bookingController.js";
import requireActiveSubscription from "../middleware/requireActiveSubscription.js";

const router = express.Router();

router.post("/public/:slug", createBooking);
router.get("/public/:slug/:date", getBookedSlots);
router.get("/", authMiddleware, getBookings);
router.patch("/:id/status", authMiddleware,requireActiveSubscription, updateBookingStatus);
router.post("/:id/message",  authMiddleware, requireActiveSubscription, sendOwnerMessage);

export default router;