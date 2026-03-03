import { prisma } from "../config/db";
import { logger } from "../utils/logger";
import { setupGracefulShutdown } from "../utils/shutdown";
import { worker } from "./job.worker";


logger.info("Worker container running...");

setupGracefulShutdown(worker, prisma,null);