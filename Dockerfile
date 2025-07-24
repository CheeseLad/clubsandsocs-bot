# Use the official Node.js LTS runtime as a base image
FROM node:21-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies (production only for smaller image)
RUN npm install

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy the rest of the application code to the working directory
COPY --chown=nodeuser:nodejs src/ ./src/

# Switch to non-root user
USER nodeuser

# Tell docker what command will start the application
CMD [ "npm", "start" ]