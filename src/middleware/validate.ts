import { Request, Response, NextFunction } from "express";
import { success, z, ZodError } from "zod";

export const validate =
  (schema: z.ZodType<any, any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }

    if (result.data.body) {
      req.body = result.data.body;
    }
    next();
  };
