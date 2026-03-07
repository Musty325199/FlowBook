import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiresAt: Date
});

export default mongoose.model("RefreshToken", refreshTokenSchema);