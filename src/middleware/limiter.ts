import rateLimit from "express-rate-limit";

export const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    req.log?.warn("Rate limit exceeded");
    res.status(429).json({
      error: "Too many requests",
      message:
        "The system is currently processing heavy workloads. Please try again in a minutes",
    });
  },
});
