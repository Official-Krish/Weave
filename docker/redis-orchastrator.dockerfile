FROM oven/bun:latest

WORKDIR /app

COPY apps/redis-orchastrator ./

RUN bun install

EXPOSE 6379

CMD ["bun", "index.ts"]