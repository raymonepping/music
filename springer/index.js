require("dotenv").config(); // Load environment variables

const express = require("express");

const path = require("path");

const cors = require("cors");

const httpLogger = require("./configurations/morganLogger");
const logger = require("./configurations/logger"); // Import Winston logger

const routes = require("./routes"); // Import the routes

// Swagger imports
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./configurations/swaggerOptions");

const app = express();
const port = process.env.PORT || 3000;

// Serve custom CSS located in the configurations folder
app.use(
  "/swagger-custom.css",
  express.static(path.join(__dirname, "configurations", "swagger-custom.css")),
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCssUrl: "/swagger-custom.css",
  }),
);

// Enable CORS
app.use(cors());

// Use the custom Morgan HTTP logger
app.use(httpLogger);

// Parse incoming requests as JSON
app.use(express.json());

// Debug log the value of LOG_LEVEL from the .env file
logger.info(`Current LOG_LEVEL from .env is: ${process.env.LOG_LEVEL}`);

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
logger.info("Swagger UI available at /api-docs");

// Define routes
app.use("/api", routes);
logger.debug("API routes mounted at /api");

// Start the server and log it using Winston
app.listen(port, () => {
  logger.info(`Springer service running on port ${port}`);
});
