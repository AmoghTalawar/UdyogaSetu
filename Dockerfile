

# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Build arguments for environment variables (can be passed via --build-arg)
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_LOCAL_IP

# Set environment variables for build (these will be available during build)
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY:-pk_test_ZXBpYy1vcmlvbGUtNDkuY2xlcmsuYWNjb3VudHMuZGV2JA}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-https://uveswbrnojjfdmtilgka.supabase.co}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZXN3YnJub2pqZmRtdGlsZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODczNjcsImV4cCI6MjA3MzE2MzM2N30.Nq5mG_0Ex3OfSQmUu2TOrHVtqRsLDi_XVmA8qRLzgT8}
ENV VITE_LOCAL_IP=${VITE_LOCAL_IP:-192.168.43.208}

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install for development)
RUN npm install

# Copy source code (excludes node_modules, .git, .dockerignore, etc.)
COPY . .

# Build the application (environment variables are now available)
RUN npm run build

# Log successful build with environment variables
RUN echo "✅ Build completed with environment variables:"
RUN echo "   - Clerk Key: ${VITE_CLERK_PUBLISHABLE_KEY:0:20}..."
RUN echo "   - Supabase URL: $VITE_SUPABASE_URL"
RUN echo "   - Local IP: $VITE_LOCAL_IP"

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]