import { Request, Response, NextFunction } from "express";

export const requireApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

export const requireWorkerSecret = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secret = req.headers["x-worker-secret"];

  if (!secret || secret !== process.env.WORKER_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};