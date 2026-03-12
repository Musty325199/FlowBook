import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Payout", payoutSchema);
