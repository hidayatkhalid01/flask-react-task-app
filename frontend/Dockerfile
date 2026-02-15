# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy rest of the project
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite
CMD ["npm", "run", "dev", "--", "--host"]
