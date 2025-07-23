FROM google/cloud-sdk:489.0.0-stable

RUN sudo apt update && sudo apt install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy the processing script
COPY ./docker/script.sh ./script.sh

# Make script executable
RUN chmod +x ./script.sh

# Set entrypoint to the script
ENTRYPOINT ["bash", "script.sh"]
