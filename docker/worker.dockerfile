FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY bun.lock .
COPY package.json .
COPY apps/worker ./apps/worker
COPY packages ./packages


RUN bun install
RUN bun run prisma:generate

EXPOSE 8080

CMD ["bun", "run", "worker"]