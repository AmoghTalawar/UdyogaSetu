# Multi‑stage Dockerfile for the Frontend (Vite → Nginx)
# ------------------------------------------------------------
# ---- Builder ------------------------------------------------
FROM node:18-alpine AS builder
WORKDIR /app

# Copy only the files needed for a production build
COPY package*.json ./
# Install dev dependencies (including Vite, TypeScript, etc.)
RUN npm ci

# Copy the source code (the entire src folder plus any static assets)
COPY . .

# Build the static site – Vite will output to /app/dist
RUN npm run build

# ---- Production image (nginx) ---------------------------------
FROM nginx:alpine
# Use a minimal nginx config (you can mount a custom one at runtime)
COPY nginx.conf /etc/nginx/nginx.conf
# Copy the compiled assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
