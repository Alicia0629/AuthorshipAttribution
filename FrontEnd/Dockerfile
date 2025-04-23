FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:18-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV VITE_API_BASE_URL=http://localhost:8000

EXPOSE 5173

CMD ["npm", "run", "dev"]