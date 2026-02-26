import express from "express";
import {
  createJobHandler,
  getJobHandler,
  updateJobHandler,
} from "./job.controller";
import { validate } from "../../middleware/validate";
import { CreateJobSchema, UpdateJobSchema } from "./job.schema";
const jobRouter = express.Router();

jobRouter.post("/", validate(CreateJobSchema), createJobHandler);
jobRouter.get("/", getJobHandler);
jobRouter.patch("/:jobId", validate(UpdateJobSchema), updateJobHandler);

export default jobRouter;
