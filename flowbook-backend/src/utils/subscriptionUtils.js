import Booking from "../models/Booking.js";

export const cancelPendingBookings = async (businessId) => {
  await Booking.updateMany(
    {
      business: businessId,
      status: "pending",
    },
    {
      status: "cancelled",
    }
  );
};