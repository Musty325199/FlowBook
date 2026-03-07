import express from "express";
import { getPayouts, withdraw } from "../controllers/payoutController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireActiveSubscription from "../middleware/requireActiveSubscription.js";


const router = express.Router();

router.get("/", authMiddleware, getPayouts);
router.post("/withdraw",  authMiddleware, requireActiveSubscription, withdraw);

export default router;