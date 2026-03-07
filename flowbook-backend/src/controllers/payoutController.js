import Booking from "../models/Booking.js";
import Payout from "../models/Payout.js";

export const getPayouts = async (req, res, next) => {
  try {
    const businessId = req.user.business;

    const payouts = await Payout.find({ business: businessId })
      .sort({ createdAt: -1 });

    const bookings = await Booking.find({
      business: businessId,
      status: { $in: ["confirmed", "completed"] }
    }).populate("service");

    const totalRevenue = bookings.reduce((sum, booking) => {
      const price = booking.service?.price || 0;
      return sum + price;
    }, 0);

    const totalWithdrawn = payouts
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = totalRevenue - totalWithdrawn;

    res.json({
      availableBalance,
      totalRevenue,
      payouts
    });

  } catch (err) {
    next(err);
  }
};

export const withdraw = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const businessId = req.user.business;

    const bookings = await Booking.find({
      business: businessId,
      status: { $in: ["confirmed", "completed"] }
    }).populate("service");

    const payouts = await Payout.find({
      business: businessId,
      status: { $in: ["pending", "paid"] }
    });

    const totalRevenue = bookings.reduce((sum, booking) => {
      const price = booking.service?.price || 0;
      return sum + price;
    }, 0);

    const withdrawn = payouts
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = totalRevenue - withdrawn;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount > availableBalance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    await Payout.create({
      business: businessId,
      amount,
      reference: `req_${Date.now()}`,
      status: "pending"
    });

    res.json({ message: "Withdrawal request submitted" });

  } catch (err) {
    next(err);
  }
};