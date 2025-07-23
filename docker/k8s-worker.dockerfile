FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY bun.lock .
COPY package.json .
COPY apps/k8s-worker ./apps/k8s-worker
COPY packages ./packages


RUN bun install
RUN bun run prisma:generate

EXPOSE 9000

CMD ["bun", "run", "k8s-worker"]