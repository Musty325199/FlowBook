import "./config/env.js";

import app from "./app.js";
import connectDB from "./config/db.js";
import cron from "node-cron";
import Subscription from "./models/Subscription.js";
import Business from "./models/Business.js";

const PORT = process.env.PORT;

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION ");
  console.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    cron.schedule("0 0 * * *", async () => {
      try {
        const now = new Date();

        const expiredSubscriptions = await Subscription.find({
          status: "active",
          expiresAt: { $lt: now }
        });

        if (expiredSubscriptions.length === 0) return;

        const businessIds = expiredSubscriptions.map((s) => s.business);

        await Subscription.updateMany(
          {
            status: "active",
            expiresAt: { $lt: now }
          },
          {
            status: "expired"
          }
        );

        await Business.updateMany(
          {
            _id: { $in: businessIds }
          },
          {
            subscriptionStatus: "expired"
          }
        );
      } catch (err) {
        console.error("Subscription expiry job failed:", err.message);
      }
    });

    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION ");
      console.error(err.name, err.message);

      server.close(() => {
        process.exit(1);
      });
    });

  } catch (err) {
    console.error("Server startup failed ");
    console.error(err);
    process.exit(1);
  }
};

startServer();