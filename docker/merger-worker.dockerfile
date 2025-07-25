FROM oven/bun:latest
RUN apt-get update && apt-get install -y ffmpeg bc 

WORKDIR /app
COPY ./apps/merger-worker/package.json .

RUN bun install

COPY apps/merger-worker/ .

CMD ["bun", "run", "index.ts"]