FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN npm install -g serve --ignore-scripts
COPY --from=builder /app/dist ./dist
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "4173"]