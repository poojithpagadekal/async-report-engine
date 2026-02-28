import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import { redisConnection } from "./redis";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const jobQueue = new Queue("jobQueue", {
  connection: redisConnection,
});

createBullBoard({
  queues: [new BullMQAdapter(jobQueue)],
  serverAdapter,
});

export { serverAdapter };
