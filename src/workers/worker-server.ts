import { prisma } from "../config/db";
import { setupGracefulShutdown } from "../utils/shutdown";
import { worker } from "./job.worker";


console.log("Worker container running...");

setupGracefulShutdown(worker, prisma,null);