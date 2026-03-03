import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if ((parsed as any).body !== undefined) req.body = (parsed as any).body;
      if ((parsed as any).params !== undefined)
        req.params = (parsed as any).params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const flattened = error.flatten();

        req.log.warn(
          {
            path: req.path,
            method: req.method,
            errors: flattened.fieldErrors,
          },
          "Request validation failed",
        );

        return res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: flattened.fieldErrors,
        });
      }

      req.log.error(
        {
          err: error,
          path: req.path,
          method: req.method,
        },
        "Validation middleware crashed",
      );

      return res.status(500).json({
        success: false,
        message: "Internal validation error",
      });
    }
  };
