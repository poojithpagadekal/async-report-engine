import express from "express";
import { createUserHandler, getUsersHandler } from "./user.controller";
import { validate } from "../../middleware/validate";
import { CreateUserSchema } from "./user.schema";

const userRouter = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security: []
 *     description: |
 *       Creates a new user. Copy the `id` from the response — you will need it
 *       as the `userId` when submitting a job.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               name:
 *                 type: string
 *                 example: Test User
 *     responses:
 *       201:
 *         description: User created successfully — copy the `id` for use in POST /api/jobs
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
userRouter.post("/", validate(CreateUserSchema), createUserHandler);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users with their jobs
 *     tags: [Users]
 *     security: []
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */
userRouter.get("/", getUsersHandler);

export default userRouter;