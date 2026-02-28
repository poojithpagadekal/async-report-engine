import express from "express";
import router from "./routes";
import { serverAdapter } from "./config/bullboard";
const app = express();

app.use(express.json());
app.use("/api", router);
app.use("/admin/queues",serverAdapter.getRouter());

export default app;
