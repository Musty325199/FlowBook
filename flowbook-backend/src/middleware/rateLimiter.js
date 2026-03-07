import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many login attempts. Try again in 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const twoFALimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many verification attempts. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});