import Booking from "../models/Booking.js";
import Business from "../models/Business.js";
import Service from "../models/Service.js";
import { sendEmail } from "../services/emailService.js";

export const createBooking = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      notes,
      date,
    } = req.body;

    const business = await Business.findOne({ slug });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const isActive =
      business.subscriptionStatus === "active" &&
      business.subscriptionExpiresAt &&
      new Date(business.subscriptionExpiresAt) > new Date();

    if (!isActive) {
      return res.status(403).json({
        message: "This vendor is not accepting bookings right now",
      });
    }

    const service = await Service.findOne({
      _id: serviceId,
      business: business._id,
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const bookingDate = new Date(date);
    const now = new Date();

    if (bookingDate <= now) {
      return res.status(400).json({
        message: "Cannot book a past time slot",
      });
    }
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "Invalid booking date" });
    }

    const existingBooking = await Booking.findOne({
      business: business._id,
      date: bookingDate,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "This time slot has already been booked" });
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayName = dayNames[bookingDate.getDay()];
    const workingDay = business.workingHours?.[dayName];

    if (!workingDay || workingDay.closed) {
      return res
        .status(400)
        .json({ message: "Business is closed on this day" });
    }

    if (workingDay.open && workingDay.close) {
      const timePart = date.split("T")[1];
      const [hourStr, minuteStr] = timePart.split(":");

      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);

      const [startHour, startMinute] = workingDay.open.split(":").map(Number);
      const [endHour, endMinute] = workingDay.close.split(":").map(Number);

      const bookingMinutes = hour * 60 + minute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (bookingMinutes < startMinutes || bookingMinutes >= endMinutes) {
        return res
          .status(400)
          .json({ message: "Selected time is outside business hours" });
      }
    }

    const status = business.autoConfirmBookings ? "confirmed" : "pending";

    res.status(200).json({
      paymentRequired: true,
      bookingData: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || "",
        address: address || "",
        notes: notes || "",
        service: service._id,
        business: business._id,
        date: bookingDate,
        status,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      business: req.user.business,
    })
      .populate("service", "name price duration")
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      business: req.user.business,
    }).populate("service");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;

    await booking.save();

    let emailHTML = `
      <div style="font-family:Arial;padding:20px">
        <h2>Booking ${booking.status}</h2>

        <p>Hi ${booking.customerName},</p>

        <p>Your appointment status has been updated.</p>

        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleString()}</p>

        <p><strong>Status:</strong> ${booking.status}</p>

        <p>Thanks,<br/>FlowBook</p>
      </div>
    `;

    if (status === "completed") {
      const reviewLink = `${process.env.CLIENT_URL}/review/${booking._id}`;

      emailHTML = `
        <div style="font-family:Arial;padding:20px">
          <h2>Appointment Completed</h2>

          <p>Hi ${booking.customerName},</p>

          <p>Your appointment for <strong>${booking.service.name}</strong> has been completed.</p>

          <p>We would love to hear your feedback.</p>

          <p style="margin:20px 0;">
            <a href="${reviewLink}" 
               style="background:#000;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">
               Leave a Review
            </a>
          </p>

          <p>Thank you for choosing this business.</p>

          <p>— FlowBook</p>
        </div>
      `;
    }

    res.json(booking);

    sendEmail(booking.customerEmail, `Booking ${booking.status}`, emailHTML);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const sendOwnerMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      business: req.user.business,
    }).populate("service");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.ownerMessage = message;
    await booking.save();

    const emailHTML = `
      <div style="font-family:Arial;padding:20px">
        <h2>Message from business</h2>

        <p>Hi ${booking.customerName},</p>

        <p>${message}</p>

        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleString()}</p>

        <p>Thanks,<br/>FlowBook</p>
      </div>
    `;

    res.json(booking);

    sendEmail(
      booking.customerEmail,
      "Message regarding your booking",
      emailHTML,
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getBookedSlots = async (req, res, next) => {
  try {
    const { slug, date } = req.params;

    const business = await Business.findOne({ slug });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      business: business._id,
      date: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    }).select("date");

    const slots = bookings.map((b) => {
      const d = new Date(b.date);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    });

    res.json(slots);
  } catch (err) {
    next(err);
  }
};
