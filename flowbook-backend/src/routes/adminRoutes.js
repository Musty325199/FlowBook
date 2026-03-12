import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getDashboardStats,
  getVendors,
  suspendVendor,
  activateVendor,
  getAllBookings,
  deleteReview,
  getPayouts,
  approvePayout,
  rejectPayout,
  getSubscriptions,
  globalAdminSearch,
  updateAdminProfile
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", getDashboardStats);

router.patch("/profile", updateAdminProfile);

router.get("/vendors", getVendors);

router.patch("/vendors/:id/suspend", suspendVendor);

router.patch("/vendors/:id/activate", activateVendor);

router.get("/bookings", getAllBookings);

router.delete("/reviews/:id", deleteReview);

router.get("/payouts", getPayouts);

router.patch("/payouts/:id/approve", approvePayout);

router.patch("/payouts/:id/reject", rejectPayout);

router.get("/subscriptions", getSubscriptions);

router.get("/search", globalAdminSearch);

export default router;