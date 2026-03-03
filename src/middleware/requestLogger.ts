import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  const requestId = randomUUID();

  req.log = logger.child({
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logPayload = {
      status: res.statusCode,
      durationMs: duration,
    };

    if (res.statusCode >= 500) {
      req.log.error(logPayload, "Server Error");
    } else if (res.statusCode >= 400) {
      req.log.warn(logPayload, "Client Error");
    } else {
      req.log.info(logPayload, "Request Handled");
    }
  });
  next();
};
