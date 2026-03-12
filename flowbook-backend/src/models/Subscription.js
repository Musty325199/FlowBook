import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    billingCycle: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
      index: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    nextBillingDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);