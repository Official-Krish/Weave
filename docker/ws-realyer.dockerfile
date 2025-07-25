FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY apps/ws-relayer/package.json .
COPY apps/ws-relayer/ .

RUN bun install

EXPOSE 9093

CMD ["bun", "run", "index.ts"]