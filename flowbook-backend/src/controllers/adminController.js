import User from "../models/User.js";
import Business from "../models/Business.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Payout from "../models/Payout.js";
import Subscription from "../models/Subscription.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalVendors = await Business.distinct("owner").then(
      (owners) => owners.length
    );

    const totalBusinesses = await Business.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const activeSubscriptions = await Subscription.countDocuments({
      status: "active"
    });

    const expiredSubscriptions = await Subscription.countDocuments({
      status: "expired"
    });

    const pendingPayouts = await Payout.countDocuments({
      status: "pending"
    });

    const revenueAgg = await Subscription.aggregate([
      {
        $match: {
          status: { $ne: "expired" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalVendors,
      totalBusinesses,
      totalBookings,
      activeSubscriptions,
      expiredSubscriptions,
      pendingPayouts,
      totalRevenue
    });
  } catch (err) {
    next(err);
  }
};

export const getVendors = async (req, res, next) => {
  try {
    const businesses = await Business.find()
      .populate({
        path: "owner",
        select: "name email suspended"
      })
      .select("name avatar subscriptionStatus");

    const vendors = businesses.map((b) => ({
      _id: b.owner?._id,
      name: b.owner?.name,
      email: b.owner?.email,
      business: {
        name: b.name,
        avatar: b.avatar
      },
      subscriptionStatus: b.subscriptionStatus,
      suspended: b.owner?.suspended || false
    }));

    res.json(vendors);
  } catch (err) {
    next(err);
  }
};

export const suspendVendor = async (req, res, next) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.suspended = true;

    await vendor.save();

    res.json({ message: "Vendor suspended" });
  } catch (err) {
    next(err);
  }
};

export const activateVendor = async (req, res, next) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.suspended = false;

    await vendor.save();

    res.json({ message: "Vendor activated" });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("business")
      .populate("service")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

export const getPayouts = async (req, res, next) => {
  try {
    const payouts = await Payout.find()
      .populate({
        path: "business",
        select: "name owner",
        populate: {
          path: "owner",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.json(payouts);
  } catch (err) {
    next(err);
  }
};

export const approvePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    payout.status = "paid";
    payout.paidAt = new Date();

    await payout.save();

    res.json({ message: "Payout marked as paid" });
  } catch (err) {
    next(err);
  }
};

export const rejectPayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    payout.note = "Rejected by admin";
    payout.paidAt = new Date();

    await payout.save();

    res.json({ message: "Payout rejected" });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subs = await Subscription.find()
      .select(
        "plan price billingCycle startedAt expiresAt nextBillingDate reference status business"
      )
      .populate({
        path: "business",
        select: "name owner",
        populate: {
          path: "owner",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.json(subs);
  } catch (err) {
    next(err);
  }
};

export const globalAdminSearch = async (req, res, next) => {
  try {
    const q = req.query.q;

    if (!q) return res.json({});

    const users = await User.find({
      name: { $regex: q, $options: "i" }
    })
      .select("name email")
      .limit(5);

    const businesses = await Business.find({
      name: { $regex: q, $options: "i" }
    })
      .select("name")
      .limit(5);

    const bookings = await Booking.find({
      customerName: { $regex: q, $options: "i" }
    }).limit(5);

    const subscriptions = await Subscription.find({
      reference: { $regex: q, $options: "i" }
    }).limit(5);

    res.json({
      users,
      businesses,
      bookings,
      subscriptions
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const admin = req.user;

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;

    await admin.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    next(err);
  }
};