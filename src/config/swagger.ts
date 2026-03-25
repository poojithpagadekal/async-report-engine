import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Async Report Engine API",
      version: "1.0.0",
      description:
        "A distributed job processing system for handling CPU-intensive report generation without blocking the Node.js event loop.",
    },
    servers: [
      {
        url: "https://async-report-engine.onrender.com",
        description: "Production",
      },
      {
        url: "http://localhost:5000",
        description: "Local",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.route.ts", "./dist/modules/**/*.route.js"],
};

export const swaggerSpec = swaggerJsdoc(options);