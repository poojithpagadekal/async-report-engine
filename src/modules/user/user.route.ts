import express from "express";
import { createUserHandler, getUsersHandler } from "./user.controller";
import { validate } from "../../middleware/validate";
import { CreateUserSchema } from "./user.schema";
const userRouter = express.Router();

userRouter.post("/",validate(CreateUserSchema), createUserHandler);
userRouter.get("/", getUsersHandler);

export default userRouter;
