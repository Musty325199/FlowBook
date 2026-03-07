import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      default: ""
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);