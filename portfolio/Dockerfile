FROM node:24-alpine AS builder

WORKDIR /app
COPY portfolio/package.json portfolio/package-lock.json ./
RUN npm ci
COPY portfolio/ .
COPY resume.example.json /resume.example.json
RUN npm run build

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy built app from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Data, logs, and resume directories (resume is mounted from host at runtime)
RUN mkdir -p /app/data /app/data/logs /app/resume && chown nextjs:nodejs /app/data /app/data/logs /app/resume

# Next mkdirs .next/cache on /_next/image requests even with images unoptimized, which fails on the read-only rootfs
RUN mkdir -p /app/.next/cache/images

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["sh", "-c", "wget -q -O /dev/null http://127.0.0.1:8080 || exit 1"]

USER nextjs
EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
