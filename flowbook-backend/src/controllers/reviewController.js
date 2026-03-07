import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({
        message: "Booking and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        message: "Reviews can only be left for completed bookings"
      });
    }

    const existing = await Review.findOne({ bookingId });

    if (existing) {
      return res.status(400).json({
        message: "Review already submitted for this booking"
      });
    }

    const review = await Review.create({
      businessId: booking.business,
      bookingId: booking._id,
      customerName: booking.customerName,
      rating,
      comment
    });

    res.status(201).json(review);

  } catch (err) {
    next(err);
  }
};

export const getBusinessReviews = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const reviews = await Review.find({
      businessId: new mongoose.Types.ObjectId(businessId)
    }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    res.json({
      averageRating,
      totalReviews,
      reviews
    });

  } catch (err) {
    next(err);
  }
};