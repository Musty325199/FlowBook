import Booking from "../models/Booking.js";

export const cancelPendingBookings = async (businessId) => {
  if (!businessId) return;

  try {
    await Booking.updateMany(
      {
        business: businessId,
        status: "pending"
      },
      {
        status: "cancelled"
      }
    );
  } catch (err) {
    console.error("Failed to cancel pending bookings:", err.message);
  }
};