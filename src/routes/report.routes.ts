import { Request, Response, Router } from "express";
const reportRoute = Router();

reportRoute.post("/generate-report", async (req: Request, res: Response) => {
  try {
    console.log(`Request received at ${new Date().toISOString()}`);

    //simulation of heavy task
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`Processing finished at ${new Date().toISOString()}`);

    return res.status(201).json({
      status: "completed",
      message: "Report generated successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error message : ", error.message);
    } else {
      console.error("Unexpected error : ", error);
    }
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default reportRoute;
