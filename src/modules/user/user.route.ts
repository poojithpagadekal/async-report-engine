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
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John
 *     responses:
 *       201:
 *         description: User created successfully
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
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */
userRouter.get("/", getUsersHandler);

export default userRouter;
