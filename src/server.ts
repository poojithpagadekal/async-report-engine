import app from "./app";
import { prisma } from "./config/db";
import { setupGracefulShutdown } from "./utils/shutdown";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

setupGracefulShutdown(null, prisma, server);
