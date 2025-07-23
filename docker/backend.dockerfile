FROM oven/bun:latest
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY bun.lock .
COPY package.json .

COPY apps/backend ./apps/backend
COPY packages ./packages


RUN bun install
RUN bun run prisma:generate

EXPOSE 3000

CMD ["bun", "run", "backend"]