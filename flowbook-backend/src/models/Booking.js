import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true
    },

    customerEmail: {
      type: String,
      required: true
    },

    customerPhone: {
      type: String
    },

    address: {
      type: String
    },

    notes: {
      type: String
    },

    ownerMessage: {
      type: String
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);