import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const businessId = req.user.business;

    const bookings = await Booking.find({
      business: businessId,
      status: { $in: ["confirmed", "completed"] }
    })
      .populate("service")
      .sort({ date: -1 });

    const totalBookings = await Booking.countDocuments({
      business: businessId
    });

    const upcomingBookings = await Booking.countDocuments({
      business: businessId,
      status: "confirmed",
      date: { $gt: new Date() }
    });

    const ratingStats = await Review.aggregate([
      {
        $match: {
          businessId: businessId
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    const averageRating = ratingStats.length
      ? Number(ratingStats[0].avgRating.toFixed(1))
      : 0;

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    let weeklyRevenue = 0;
    let appointmentsThisWeek = 0;

    const weeklyRevenueMap = {};

    bookings.forEach((booking) => {
      const price = booking.service?.price || 0;

      if (new Date(booking.date) >= oneWeekAgo) {
        weeklyRevenue += price;
        appointmentsThisWeek += 1;
      }

      const weekKey = new Date(booking.date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short"
      });

      weeklyRevenueMap[weekKey] =
        (weeklyRevenueMap[weekKey] || 0) + price;
    });

    const weeklyRevenueChart = Object.entries(weeklyRevenueMap).map(
      ([week, revenue]) => ({
        week,
        revenue
      })
    );

    const recentAppointments = bookings.slice(0, 5).map((booking) => {
      const bookingDate = new Date(booking.date);

      return {
        service: booking.service?.name || "Service",
        date: bookingDate.toLocaleDateString("en-NG"),
        time: bookingDate.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        price: booking.service?.price || 0,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        notes: booking.notes,
        ownerMessage: booking.ownerMessage
      };
    });

    const payoutHistory = [
      {
        period: "Current Week",
        revenue: weeklyRevenue,
        refunds: 0,
        net: weeklyRevenue,
        status: "pending",
        paidAt: null
      }
    ];

    res.json({
      totalBookings,
      upcomingBookings,
      averageRating,
      appointmentsThisWeek,
      revenueThisWeek: weeklyRevenue,
      availableBalance: weeklyRevenue,
      lastPayout: null,
      weeklyRevenue: weeklyRevenueChart,
      payoutHistory,
      recentAppointments
    });
  } catch (err) {
    next(err);
  }
};