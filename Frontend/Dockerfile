# Use Node.js 20
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json /app/

# Install dependencies
RUN npm install

# Copy all the source files
COPY . /app/

# Build the React application
RUN npm run build

# Serve the React application
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
