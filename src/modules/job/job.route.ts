import express from "express";
import {
  createJobHandler,
  getJobByIdHandler,
  getJobHandler,
  updateJobHandler,
} from "./job.controller";
import { validate } from "../../middleware/validate";
import { CreateJobSchema, GetAllJobsSchema, GetJobByIdSchema, UpdateJobSchema } from "./job.schema";
import { reportLimiter } from "../../middleware/limiter";

const jobRouter = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Submit a new job
 *     tags: [Jobs]
 *     description: Rate limited to 50 requests per minute.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 94c027b2-a44d-4962-9946-7de970e1a9b2
 *               title:
 *                 type: string
 *                 example: Q4 Sales Report
 *               type:
 *                 type: string
 *                 enum: [SALES_REPORT, USER_ANALYTICS, PDF_EXPORT]
 *                 example: PDF_EXPORT
 *     responses:
 *       201:
 *         description: Job created and queued successfully
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
jobRouter.post("/", reportLimiter, validate(CreateJobSchema), createJobHandler);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List all jobs (paginated)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of jobs
 *       500:
 *         description: Server error
 */
jobRouter.get("/", validate(GetAllJobsSchema), getJobHandler);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         example: 94c027b2-a44d-4962-9946-7de970e1a9b2
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
jobRouter.get("/:jobId", validate(GetJobByIdSchema), getJobByIdHandler);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   patch:
 *     summary: Update job status and progress
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, COMPLETED, FAILED]
 *               progress:
 *                 type: integer
 *                 example: 80
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
jobRouter.patch("/:jobId", validate(UpdateJobSchema), updateJobHandler);

export default jobRouter;