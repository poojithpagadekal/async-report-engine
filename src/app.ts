import express from "express";
import router from "./routes";
import { serverAdapter } from "./config/bullboard";
import { requestLogger } from "./middleware/requestLogger";
const app = express();

app.use(express.json());
app.use(requestLogger);
app.use("/api", router);
app.use("/admin/queues", serverAdapter.getRouter());

export default app;
