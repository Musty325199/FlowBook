import crypto from "crypto";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { OAuth2Client } from "google-auth-library";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import Business from "../models/Business.js";
import RefreshToken from "../models/RefreshToken.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import slugify from "../utils/slugify.js";
import { sendEmail } from "../services/emailService.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password, businessName } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const slug = slugify(businessName);

    const business = await Business.create({
      name: businessName,
      slug,
      owner: user._id,
    });

    user.business = business._id;
    await user.save();

    const verifyToken = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = verifyToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

    await sendEmail(
      email,
      "Verify your FlowBook account",
      `<p>Click below to verify:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    );

    res.status(201).json({ message: "Registration successful. Check email." });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email }).populate("business");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.suspended) {
  return res.status(403).json({
    message: "Your account has been suspended. Contact support."
  });
}

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ requiresTwoFactor: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorCode,
        window: 1,
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid 2FA code" });
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        business: user.business,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const stored = await RefreshToken.findOne({ token: decoded.tokenId });
    if (!stored)
      return res.status(401).json({ message: "Invalid refresh token" });

    await stored.deleteOne();

    const accessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = await generateRefreshToken(decoded.userId);

    setCookies(res, accessToken, newRefreshToken);

    res.json({ message: "Token refreshed" });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await RefreshToken.findOneAndDelete({ token: decoded.tokenId });
    }

    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If email exists, reset sent" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset your password",
      `<p>Reset here:</p><a href="${resetUrl}">${resetUrl}</a>`,
    );

    res.json({ message: "If email exists, reset sent" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await hashPassword(password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

export const enable2FA = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });

    const qr = await QRCode.toDataURL(secret.otpauth_url);

    req.user.twoFactorSecret = secret.base32;
    await req.user.save();

    res.json({ qrCode: qr });
  } catch (err) {
    next(err);
  }
};

export const confirm2FA = async (req, res, next) => {
  try {
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) return res.status(400).json({ message: "Invalid code" });

    req.user.twoFactorEnabled = true;
    await req.user.save();

    res.json({ message: "2FA enabled" });
  } catch (err) {
    next(err);
  }
};

export const disable2FA = async (req, res, next) => {
  try {
    req.user.twoFactorEnabled = false;
    req.user.twoFactorSecret = undefined;

    await req.user.save();

    res.json({ message: "Two-factor authentication disabled" });
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    
    if (user && user.suspended) {
  return res.status(403).json({
    message: "Your account has been suspended. Contact support."
  });
}

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: crypto.randomBytes(16).toString("hex"),
        isVerified: true,
      });

      const business = await Business.create({
        name: `${payload.name}'s Business`,
        slug: slugify(payload.name),
        owner: user._id,
      });

      user.business = business._id;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    setCookies(res, accessToken, refreshToken);

    res.json({ message: "Google login successful" });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("business");

    res.json({ user });
  } catch (err) {
    next(err);
  }
};


