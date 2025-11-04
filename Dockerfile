# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
RUN npm ci --production=false
COPY prisma ./prisma
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

ENV NODE_ENV=production

# Copy files with proper ownership
COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nodejs

# for runtime environment variables / secrets read from env
EXPOSE 4000
CMD ["node", "dist/server.js"]
