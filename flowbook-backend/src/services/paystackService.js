import axios from "axios";
import crypto from "crypto";

const PAYSTACK_URL = "https://api.paystack.co";

const paystack = axios.create({
  baseURL: PAYSTACK_URL,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json"
  }
});

export const initializeTransaction = async (
  email,
  amount,
  metadata = {},
  callback_url
) => {
  if (!email || !amount) {
    throw new Error("Invalid payment parameters");
  }

  const reference = `flowbook_${crypto.randomBytes(10).toString("hex")}`;

  try {
    const response = await paystack.post("/transaction/initialize", {
      email,
      amount,
      currency: "NGN",
      reference,
      metadata,
      callback_url
    });

    const data = response.data?.data;

    if (!data || !data.authorization_url) {
      throw new Error("Invalid Paystack response");
    }

    return {
      authorization_url: data.authorization_url,
      access_code: data.access_code,
      reference
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Payment initialization failed";
    throw new Error(message);
  }
};

export const verifyTransaction = async (reference) => {
  if (!reference) {
    throw new Error("Reference required");
  }

  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);

    const data = response.data?.data;

    if (!data) {
      throw new Error("Invalid verification response");
    }

    return data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Transaction verification failed";
    throw new Error(message);
  }
};

export const createTransferRecipient = async (
  name,
  account_number,
  bank_code
) => {
  if (!name || !account_number || !bank_code) {
    throw new Error("Invalid bank details");
  }

  try {
    const response = await paystack.post("/transferrecipient", {
      type: "nuban",
      name,
      account_number,
      bank_code,
      currency: "NGN"
    });

    const data = response.data?.data;

    if (!data) {
      throw new Error("Recipient creation failed");
    }

    return data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create transfer recipient";
    throw new Error(message);
  }
};

export const initiateTransfer = async (
  amount,
  recipient,
  reason = "FlowBook payout"
) => {
  if (!amount || !recipient) {
    throw new Error("Invalid transfer parameters");
  }

  const reference = `payout_${crypto.randomBytes(10).toString("hex")}`;

  try {
    const response = await paystack.post("/transfer", {
      source: "balance",
      amount,
      recipient,
      reason,
      reference
    });

    const data = response.data?.data;

    if (!data) {
      throw new Error("Transfer initiation failed");
    }

    return {
      transfer_code: data.transfer_code,
      reference
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Transfer failed";
    throw new Error(message);
  }
};