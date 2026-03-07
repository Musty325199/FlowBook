import Business from "../models/Business.js";
import { cancelPendingBookings } from "../utils/subscriptionUtils.js";

const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        message: "Authentication required",
      });
    }

    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    const isActive =
      business.subscriptionStatus === "active" &&
      business.subscriptionExpiresAt &&
      new Date(business.subscriptionExpiresAt) > new Date();

    if (!isActive) {
      await cancelPendingBookings(business._id);

      return res.status(403).json({
        message: "Subscription inactive. Please renew to use this feature.",
      });
    }

    req.business = business;

    next();
  } catch (err) {
    next(err);
  }
};

export default requireActiveSubscription;