import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";
import {
  createService,
  updateService,
  deleteService,
  getServices,
  getServicesPublic,
  getAllServicesPublic
} from "../controllers/serviceController.js";
import requireActiveSubscription from "../middleware/requireActiveSubscription.js";

const router = express.Router();

router.get("/public/all", getAllServicesPublic);
router.get("/public/:slug", getServicesPublic);

router.use(authMiddleware);

router.post("/", requireActiveSubscription, uploadImage("image"), createService);
router.get("/", getServices);
router.put("/:id", requireActiveSubscription, uploadImage("image"), updateService);
router.delete("/:id", requireActiveSubscription, deleteService);

export default router;
