# Stage 1: Builder
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* .env.local ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js with standalone output
RUN bun run build

# Stage 2: Runner
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -S -g 1001 bungroup && \
    adduser -S -u 1001 -G bungroup bunuser

# Copy standalone output
COPY --from=builder /app/.next/standalone ./

# Copy static and server files needed at runtime
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy environment file
COPY --from=builder /app/.env.local ./.env.local

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Change to non-root user
USER bunuser

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "server.js"]
