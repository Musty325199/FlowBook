import "./config/env.js";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥");
  console.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION 💥");
      console.error(err.name, err.message);

      server.close(() => {
        process.exit(1);
      });
    });

  } catch (err) {
    console.error("Server startup failed 💥");
    console.error(err);
    process.exit(1);
  }
};

startServer();