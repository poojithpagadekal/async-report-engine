import { Router } from "express";
import userRouter from "../modules/user/user.route";
import jobRouter from "../modules/job/job.route";

const router = Router();

router.use("/users", userRouter);
router.use("/jobs", jobRouter);

export default router;
