import axios from "axios";
import crypto from "crypto";

const PAYSTACK_URL = "https://api.paystack.co";

const paystack = axios.create({
  baseURL: PAYSTACK_URL,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export const initializeTransaction = async (
  email,
  amount,
  metadata,
  callback_url
) => {
  try {
    if (!email || !amount) {
      throw new Error("Invalid payment parameters");
    }

    const reference = `flowbook_${crypto.randomBytes(8).toString("hex")}`;

    const response = await paystack.post("/transaction/initialize", {
      email,
      amount,
      currency: "NGN",
      reference,
      metadata,
      callback_url,
    });

    return {
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference,
    };
  } catch (error) {
    console.error("Paystack initialize error:", error?.response?.data || error.message);
    throw new Error("Payment initialization failed");
  }
};

export const verifyTransaction = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error) {
    console.error("Paystack verify error:", error?.response?.data || error.message);
    throw new Error("Transaction verification failed");
  }
};

export const createTransferRecipient = async (
  name,
  account_number,
  bank_code
) => {
  try {
    const response = await paystack.post("/transferrecipient", {
      type: "nuban",
      name,
      account_number,
      bank_code,
      currency: "NGN",
    });

    return response.data.data;
  } catch (error) {
    console.error("Paystack recipient error:", error?.response?.data || error.message);
    throw new Error("Failed to create transfer recipient");
  }
};

export const initiateTransfer = async (
  amount,
  recipient,
  reason = "FlowBook payout"
) => {
  try {
    const reference = `payout_${crypto.randomBytes(8).toString("hex")}`;

    const response = await paystack.post("/transfer", {
      source: "balance",
      amount,
      recipient,
      reason,
      reference,
    });

    return {
      transfer_code: response.data.data.transfer_code,
      reference,
    };
  } catch (error) {
    console.error("Paystack transfer error:", error?.response?.data || error.message);
    throw new Error("Transfer failed");
  }
};