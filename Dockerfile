# Dockerfile
FROM node:14

# Add metadata
LABEL maintainer="Dillon Baird <Dillon@DillonBaird.io>"
LABEL version="1.0"
LABEL description="1x1 Nano-Size Spy-Pixel Analytics"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build:js

EXPOSE 3000
CMD [ "node", "dist/nanoTrack.js" ]
