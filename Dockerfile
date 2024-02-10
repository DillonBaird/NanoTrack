# Stage 1: Build stage
FROM node:lts-alpine AS builder

# Add metadata
LABEL maintainer="Dillon Baird <Dillon@DillonBaird.io>"
LABEL version="1.0"
LABEL description="1x1 Nano-Size Spy-Pixel Analytics"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# # Build the application
# RUN npm run build:js && npm prune --production

# # Stage 2: Runtime stage
# FROM node:lts-alpine

# # Copy built assets from builder stage
# WORKDIR /usr/src/app
# COPY --from=builder /usr/src/app .

# # Expose the necessary port
# EXPOSE 3001

# Define the command to run the app
# CMD [ "node", "dist/nanoTrack.js" ]
CMD ["npm run dev"]
