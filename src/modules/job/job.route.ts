import express from "express";
import {
  createJobHandler,
  getJobByIdHandler,
  getJobHandler,
  updateJobHandler,
} from "./job.controller";
import { validate } from "../../middleware/validate";
import { CreateJobSchema, UpdateJobSchema } from "./job.schema";
import { reportLimiter } from "../../middleware/limiter";
const jobRouter = express.Router();

jobRouter.post("/",reportLimiter, validate(CreateJobSchema), createJobHandler);
jobRouter.get("/", getJobHandler);
jobRouter.get("/:jobId",validate(UpdateJobSchema),getJobByIdHandler)
jobRouter.patch("/:jobId", validate(UpdateJobSchema), updateJobHandler);

export default jobRouter;
