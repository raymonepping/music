// swaggerConfig.js
const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Springer API",
      version: "1.0.0",
      description: "API Documentation for Springer",
    },
    servers: [
      {
        url: "http://springer:3000", // Update based on your actual URL
      },
    ],
  },
  apis: ["./routes/*.js"], // Adjust the path to your route files
};

module.exports = swaggerJsDoc(swaggerOptions);
