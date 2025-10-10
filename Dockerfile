# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0

################################################################################
# Base stage with Node.js
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat

################################################################################
# Dependencies stage - install all dependencies
FROM base as deps

# Copy root package files
COPY package*.json ./

# Copy workspace package.json files
COPY apps/admin/package.json ./apps/admin/
COPY apps/user/package.json ./apps/user/
COPY packages/shared/package.json ./packages/shared/
COPY packages/tailwind-config/package.json ./packages/tailwind-config/

# Install all dependencies (using workspace)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

################################################################################
# Build stage - build the applications
FROM deps as build

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_RECORDER_URL
ARG NEXT_PUBLIC_RECORDER_API_URL

# Set environment variables for build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_RECORDER_URL=$NEXT_PUBLIC_RECORDER_URL
ENV NEXT_PUBLIC_RECORDER_API_URL=$NEXT_PUBLIC_RECORDER_API_URL


# Copy source files in stages for better caching
# Copy shared package first (changes less frequently)
COPY packages/ ./packages/

# Build shared packages with Next.js cache mount
RUN --mount=type=cache,target=/usr/src/app/.next/cache \
    npm run build:shared

# Now copy app source files
COPY apps/ ./apps/

# Copy other necessary files
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./

# Build both apps with Next.js cache mount (HUGE SPEED BOOST!)
RUN --mount=type=cache,target=/usr/src/app/apps/user/.next/cache \
    --mount=type=cache,target=/usr/src/app/apps/admin/.next/cache \
    npm run build:user && npm run build:admin

################################################################################
# User app production stage
FROM nginx:alpine as user-app

# Copy built user app
COPY --from=build /usr/src/app/apps/user/out /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.user.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

################################################################################
# Admin app production stage
FROM nginx:alpine as admin-app

# Copy built admin app
COPY --from=build /usr/src/app/apps/admin/out /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.admin.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]