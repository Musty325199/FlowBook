import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getBusiness,
  updateBusiness,
  getBusinessPublic,
  getPublicBusinesses,
} from "../controllers/businessController.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/public/:slug", getBusinessPublic);
router.get("/public", getPublicBusinesses);

router.use(authMiddleware);

router.get("/", getBusiness);
router.put("/", updateBusiness);

router.put("/avatar", uploadImage("avatar"), updateBusiness);

router.put("/cover", uploadImage("coverImage"), updateBusiness);

export default router;