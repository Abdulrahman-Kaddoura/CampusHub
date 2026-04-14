# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy the rest of the app
COPY . .

# Optional: for subpath deployments
# ENV VITE_BASE_PATH=/campus-hub/

# Build the Vite app
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Replace the default nginx config with one that supports SPA routing.
# Without try_files, refreshing on any React Router path (e.g. /cart)
# would return 404 because nginx looks for a real file at that path.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
