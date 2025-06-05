FROM google/cloud-sdk:489.0.0-stable

RUN apt-get update && apt-get install -y ffmpeg bc

# Set working directory
WORKDIR /app

# Copy the processing script
COPY ./docker/script.sh ./script.sh

# Make script executable
RUN chmod +x ./script.sh

# Entrypoint
ENTRYPOINT ["./script.sh"]