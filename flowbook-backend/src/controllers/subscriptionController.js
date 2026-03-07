import crypto from "crypto";
import Service from "../models/Service.js";
import { sendEmail } from "../services/emailService.js";
import Booking from "../models/Booking.js";
import Subscription from "../models/Subscription.js";
import Business from "../models/Business.js";
import { cancelPendingBookings } from "../utils/subscriptionUtils.js";
import {
  initializeTransaction,
  verifyTransaction,
} from "../services/paystackService.js";

export const startSubscription = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!req.user || !req.user.business) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (
      business.subscriptionStatus === "active" &&
      business.subscriptionExpiresAt &&
      new Date(business.subscriptionExpiresAt) > new Date()
    ) {
      return res.status(400).json({
        message: "Subscription already active",
      });
    }

    let amount = 0;

    if (plan === "monthly") amount = 900000;
    if (plan === "yearly") amount = 9000000;

    if (!amount) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const payment = await initializeTransaction(
      req.user.email,
      amount,
      {
        project: "flowbook",
        businessId: business._id.toString(),
        plan,
      },
      `${process.env.CLIENT_URL}/dashboard/subscription`,
    );

    res.json({
      authorizationUrl: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (err) {
    next(err);
  }
};

export const verifySubscription = async (req, res, next) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: "Reference required" });
    }

    const existing = await Subscription.findOne({ reference });

    if (existing) {
      return res.json({ message: "Subscription already processed" });
    }

    const transaction = await verifyTransaction(reference);

    if (transaction.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const metadata = transaction.metadata;

    if (!metadata) {
      return res.status(400).json({ message: "Invalid metadata" });
    }

    if (metadata.project === "flowbook_booking") {
      const bookingData = JSON.parse(metadata.bookingData);

      const existingBooking = await Booking.findOne({
        customerEmail: bookingData.customerEmail,
        date: bookingData.date,
        business: bookingData.business,
      });

      if (existingBooking) {
        return res.json({ message: "Booking already created" });
      }

      const booking = await Booking.create(bookingData);

      return res.json({
        message: "Booking created successfully",
        booking,
      });
    }

    if (metadata.project !== "flowbook") {
      return res.status(400).json({ message: "Invalid metadata" });
    }

    if (!metadata || metadata.project !== "flowbook") {
      return res.status(400).json({ message: "Invalid metadata" });
    }

    const { businessId, plan } = metadata;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    let expiresAt = new Date();

    if (
      business.subscriptionExpiresAt &&
      business.subscriptionExpiresAt > new Date()
    ) {
      expiresAt = new Date(business.subscriptionExpiresAt);
    }

    if (plan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    if (plan === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await Subscription.create({
      business: businessId,
      status: "active",
      reference,
      plan,
      expiresAt,
    });

    await Business.findByIdAndUpdate(businessId, {
      subscriptionStatus: "active",
      subscriptionPlan: plan,
      subscriptionExpiresAt: expiresAt,
    });

    res.json({
      message: "Subscription activated",
    });
  } catch (err) {
    next(err);
  }
};

export const webhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const metadata = event.data.metadata;

    if (!metadata || metadata.project !== "flowbook") {
      return res.sendStatus(200);
    }

    const { businessId, plan } = metadata;
    const reference = event.data.reference;

    const existing = await Subscription.findOne({ reference });

    if (existing) {
      return res.sendStatus(200);
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return res.sendStatus(200);
    }

    let expiresAt = new Date();

    if (
      business.subscriptionExpiresAt &&
      business.subscriptionExpiresAt > new Date()
    ) {
      expiresAt = new Date(business.subscriptionExpiresAt);
    }

    if (plan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    if (plan === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await Subscription.create({
      business: businessId,
      status: "active",
      reference,
      plan,
      expiresAt,
    });

    await Business.findByIdAndUpdate(businessId, {
      subscriptionStatus: "active",
      subscriptionPlan: plan,
      subscriptionExpiresAt: expiresAt,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Paystack webhook error:", err);
    next(err);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.business) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    business.subscriptionStatus = "free";
    business.subscriptionPlan = null;
    business.subscriptionExpiresAt = null;

    await business.save();

    await cancelPendingBookings(business._id);

    res.json({
      message: "Subscription cancelled successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const startBookingPayment = async (req, res, next) => {
  try {
    const { bookingData, amount } = req.body;

    if (!bookingData || !amount) {
      return res.status(400).json({
        message: "Invalid booking payment data",
      });
    }

    const payment = await initializeTransaction(
      bookingData.customerEmail,
      amount,
      {
        project: "flowbook_booking",
        bookingData: JSON.stringify(bookingData),
      },
      `${process.env.CLIENT_URL}/booking/success`,
    );

    const data = payment.data || payment;

    res.json({
      authorizationUrl: data.authorization_url,
      reference: data.reference,
    });
  } catch (err) {
    console.error("Booking payment init error:", err);
    next(err);
  }
};

export const verifyBookingPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        message: "Reference required",
      });
    }

    const transaction = await verifyTransaction(reference);

    if (transaction.status !== "success") {
      return res.status(400).json({
        message: "Payment not successful",
      });
    }

    const metadata = transaction.metadata;

    if (!metadata || metadata.project !== "flowbook_booking") {
      return res.status(400).json({
        message: "Invalid booking metadata",
      });
    }

    const bookingData = JSON.parse(metadata.bookingData);

    const existingBooking = await Booking.findOne({
      business: bookingData.business,
      date: bookingData.date,
      customerEmail: bookingData.customerEmail,
    });

    if (existingBooking) {
      return res.json({
        message: "Booking already exists",
        booking: existingBooking,
      });
    }

    const booking = await Booking.create(bookingData);

    const service = await Service.findById(booking.service).select("name");

    const business = await Business.findById(booking.business).populate(
      "owner",
      "email",
    );

    const vendorEmail = business?.owner?.email;

    if (vendorEmail) {
      const bookingDate = new Date(booking.date);

      const emailHTML = `
    <div style="font-family:Arial;padding:20px">
      <h2>New Booking Received</h2>

      <p>Hello,</p>

      <p>You have a new booking.</p>

      <p><strong>Customer:</strong> ${booking.customerName}</p>
      <p><strong>Service:</strong> ${service?.name || "Service"}</p>
      <p><strong>Date:</strong> ${bookingDate.toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${bookingDate.toLocaleTimeString()}</p>

      <p>Login to your FlowBook dashboard to manage this booking.</p>

      <p>— FlowBook</p>
    </div>
  `;

      sendEmail(vendorEmail, "New Booking Received", emailHTML);
    }

    res.json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    next(err);
  }
};
