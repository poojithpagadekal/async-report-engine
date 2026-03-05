import express from "express";
import router from "./routes";
import { serverAdapter } from "./config/bullboard";
import { requestLogger } from "./middleware/requestLogger";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
const app = express();

app.use(express.json());
app.use(requestLogger);
app.use("/api", router);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/admin/queues", serverAdapter.getRouter());

export default app;
