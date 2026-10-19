FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install security updates & clean cache
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy package definitions
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application code
COPY . .

# Ensure storage / database directory exists
RUN mkdir -p database

# Default environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose HTTP port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the registration portal server
CMD ["node", "server.js"]
