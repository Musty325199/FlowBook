import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import RefreshToken from "../models/RefreshToken.js";

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = async (userId) => {
  const tokenId = uuidv4();

  const refreshToken = jwt.sign(
    { userId, tokenId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({
    token: tokenId,
    user: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return refreshToken;
};