# Multi-stage build for Agentic Playwright Dashboard

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dashboard files
COPY dashboard/package*.json ./
RUN npm install --production

COPY dashboard/ ./

# Create a directory for test results (will be mounted as volume)
RUN mkdir -p /app/test-results

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/test-results', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the dashboard server
CMD ["npm", "start"]
