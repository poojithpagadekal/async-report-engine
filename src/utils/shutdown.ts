import { Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";
import { Server } from "node:http";

export const setupGracefulShutdown = (
  worker: Worker | null,
  prisma: PrismaClient,
  server: Server | null,
) => {
  let isShuttingDown = false;

  const handleShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, "Graceful shutdown initiated");

    const forceExit = setTimeout(() => {
      logger.error("Force exiting after timeout");
      process.exit(1);
    }, 30000);

    try {
      if (server) {
        logger.info("Closing HTTP server");
        await new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        logger.info("HTTP server closed");
      }

      if (worker) {
        logger.info("Closing BullMQ worker");
        await worker.close();
        logger.info("BullMQ worker closed");
      }

      logger.info("Disconnecting Prisma");
      await prisma.$disconnect();
      logger.info("Prisma disconnected");

      clearTimeout(forceExit);

      logger.info("Shutdown complete. Exiting process");
      logger.flush(() => process.exit(0));
    } catch (error) {
      logger.error({ error }, "Error during graceful shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
};
