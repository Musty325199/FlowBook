import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  status: String,
  reference: String
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);