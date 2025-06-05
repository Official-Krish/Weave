FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy the package.json file
COPY apps/client/package*.json ./
COPY apps/client ./

RUN bun install

EXPOSE 5173

CMD ["bun", "run", "dev"]