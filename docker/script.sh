#!/bin/bash
set -euo pipefail

echo "Starting grid video & audio processing..."

# Read env vars
MEETING_ID=${MEETING_ID}
BUCKET_NAME=${BUCKET_NAME}

echo "Meeting ID: $MEETING_ID"
echo "Bucket: $BUCKET_NAME"

# Get all user chunks
USER_CHUNKS=$(gsutil ls "$BUCKET_NAME/meetings/raw/$MEETING_ID/users/*/chunk-*.webm" || true)

# Extract unique user IDs
USER_IDS=($(echo "$USER_CHUNKS" | grep -oP "users/\K[^/]+" | sort -u))
NUM_USERS=${#USER_IDS[@]}
echo "Number of users: $NUM_USERS"

# Calculate dynamic grid layout (square or close to square)
COLS=$(echo "sqrt($NUM_USERS)" | bc)
if [ $((COLS * COLS)) -lt $NUM_USERS ]; then
  COLS=$((COLS + 1))
fi
ROWS=$(( (NUM_USERS + COLS - 1) / COLS ))

echo "Grid layout: ${ROWS}x${COLS}"

# Prepare directory
mkdir -p /tmp/chunks

# Download latest chunk per user
for USER_ID in "${USER_IDS[@]}"; do
  echo "Downloading latest chunk for user: $USER_ID"
  LATEST_CHUNK=$(gsutil ls "$BUCKET_NAME/meetings/raw/$MEETING_ID/users/$USER_ID/chunk-*.webm" | sort | tail -n 1)
  gsutil cp "$LATEST_CHUNK" "/tmp/chunks/$USER_ID.webm"
done

# Build FFmpeg input args and filter graph
INPUTS=""
VIDEO_FILTER=""
AUDIO_INPUTS=""
TILES=""

for i in "${!USER_IDS[@]}"; do
  INPUTS+="-i /tmp/chunks/${USER_IDS[$i]}.webm "
  VIDEO_FILTER+="[$i:v]scale=w=iw/${COLS}:h=ih/${ROWS}[v$i];"
  AUDIO_INPUTS+="[$i:a]"
  TILES+="[v$i]"
done

# Layout for xstack
LAYOUT=""
for ((i=0; i<NUM_USERS; i++)); do
  X=$((i % COLS))
  Y=$((i / COLS))
  LAYOUT+="${X}_$((Y))|"
done
LAYOUT=${LAYOUT%|}

echo "Creating FFmpeg grid with audio..."

# Build and run FFmpeg command
ffmpeg \
  $INPUTS \
  -filter_complex "${VIDEO_FILTER}${TILES}xstack=inputs=$NUM_USERS:layout=$LAYOUT[v];${AUDIO_INPUTS}amix=inputs=$NUM_USERS:duration=longest[a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -crf 23 -preset fast \
  -c:a aac -b:a 192k \
  "/tmp/grid.mp4"

# Extract audio as MP3
ffmpeg -i "/tmp/grid.mp4" -vn -c:a libmp3lame -b:a 192k "/tmp/audio.mp3"

# Upload results
gsutil cp "/tmp/grid.mp4" "$BUCKET_NAME/meetings/$MEETING_ID/final/video/grid.mp4"
gsutil cp "/tmp/audio.mp3" "$BUCKET_NAME/meetings/$MEETING_ID/final/audio/Taudio.mp3"

echo "Grid video and MP3 audio uploaded."

# Cleanup
rm -rf /tmp/chunks /tmp/grid.mp4 /tmp/audio.mp3
echo "Cleanup done. Script finished."
