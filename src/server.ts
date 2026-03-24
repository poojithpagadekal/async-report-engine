import app from "./app";
import { prisma } from "./config/db";
import { setupGracefulShutdown } from "./utils/shutdown";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server is running");
});

setupGracefulShutdown(null, prisma, server);
