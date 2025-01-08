# Use the official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the development server (instead of 'serve' for production)
CMD ["npm", "run", "dev", "--", "--host", "--port", "8080"]
