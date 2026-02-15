# syntax=docker/dockerfile:1

FROM node:22-alpine

WORKDIR /app

RUN corepack enable

EXPOSE 5173

# The app code is mounted by docker-compose for fast iteration (HMR).
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev --host 0.0.0.0 --port 5173"]
