import express from "express";
import reportRoute from "./routes/report.routes";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api", reportRoute);

export default app;
