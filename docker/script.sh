#!/bin/bash
set -euo pipefail

# Enhanced logging
exec > >(tee -i "$(date +%Y%m%d-%H%M%S)-webp-video-merge.log") 2>&1

echo "===== Starting WEBP Video Merger ====="
date

## Configuration
export GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/google/gcp-key.json
MEETING_ID=${MEETING_ID}
BUCKET_NAME=${BUCKET_NAME}
TEMP_DIR="/tmp/webp_video_merge_$(date +%s)"
MAX_RESOLUTION=1280
FRAME_RATE=30
AUDIO_BITRATE="192k"
VIDEO_BITRATE="3000k"
MAX_RETRIES=3
RETRY_DELAY=5

# Create working directories
mkdir -p "$TEMP_DIR/users"
mkdir -p "$TEMP_DIR/audio"
mkdir -p "$TEMP_DIR/output"

function log_error_and_exit {
    echo "ERROR: $1"
    echo "Script failed at $(date)"
    exit 1
}

function log_warning {
    echo "WARNING: $1"
}

function download_with_retries {
    local src=$1
    local dest=$2
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if gsutil cp "$src" "$dest"; then
            return 0
        fi
        retries=$((retries + 1))
        echo "Download failed, retry $retries/$MAX_RETRIES in $RETRY_DELAY seconds..."
        sleep $RETRY_DELAY
    done
    return 1
}

## Step 1: Download all user videos
echo "=== Downloading user videos ==="
USER_VIDEOS=$(gsutil ls "$BUCKET_NAME//$MEETING_ID/raw/users/**/chunk-*.webm" 2>/dev/null || \
               gsutil ls "$BUCKET_NAME//$MEETING_ID/raw/users/**/chunk-*.webp" 2>/dev/null || true)

if [ -z "$USER_VIDEOS" ]; then
    log_error_and_exit "No WEBP/WEBM videos found at $BUCKET_NAME./$MEETING_ID/raw/users/"
fi

# Extract unique user IDs and download their latest video
declare -A USER_RECORDINGS
for VIDEO in $USER_VIDEOS; do
    USER_ID=$(echo "$VIDEO" | sed -n 's|.*/users/\([^/]*\)/.*|\1|p')
    if [ -n "$USER_ID" ]; then
        USER_RECORDINGS["$USER_ID"]="$VIDEO"
    fi
done

echo "Found ${#USER_RECORDINGS[@]} users with videos"

for USER_ID in "${!USER_RECORDINGS[@]}"; do
    echo "Downloading video for user: $USER_ID"
    VIDEO_EXT="${USER_RECORDINGS[$USER_ID]##*.}"  # Get file extension
    if ! download_with_retries "${USER_RECORDINGS[$USER_ID]}" "$TEMP_DIR/users/$USER_ID.$VIDEO_EXT"; then
        log_warning "Failed to download video for user $USER_ID after $MAX_RETRIES attempts - skipping"
        unset USER_RECORDINGS["$USER_ID"]
        continue
    fi
    
    # Verify download
    if [ ! -f "$TEMP_DIR/users/$USER_ID.$VIDEO_EXT" ]; then
        log_warning "Downloaded file missing for user $USER_ID - skipping"
        unset USER_RECORDINGS["$USER_ID"]
        continue
    fi
    
    # Check dimensions are divisible by 2
    DIMENSIONS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$TEMP_DIR/users/$USER_ID.$VIDEO_EXT")
    WIDTH=$(echo $DIMENSIONS | cut -d'x' -f1)
    HEIGHT=$(echo $DIMENSIONS | cut -d'x' -f2)
    
    if [ $((WIDTH % 2)) -ne 0 ] || [ $((HEIGHT % 2)) -ne 0 ]; then
        log_warning "Video dimensions ${WIDTH}x${HEIGHT} not divisible by 2 for user $USER_ID - skipping"
        unset USER_RECORDINGS["$USER_ID"]
        continue
    fi
    
    echo "Download successful for $USER_ID"
done

## Step 2: Process videos for grid layout
echo "=== Processing videos for grid layout ==="

# Recalculate number of users after potential skips
NUM_USERS=${#USER_RECORDINGS[@]}
if [ $NUM_USERS -eq 0 ]; then
    log_error_and_exit "No valid videos found with dimensions divisible by 2"
fi

# Calculate grid layout
COLS=$(echo "sqrt($NUM_USERS)" | bc)
[ $((COLS * COLS)) -lt $NUM_USERS ] && COLS=$((COLS + 1))
ROWS=$(( (NUM_USERS + COLS - 1) / COLS ))

echo "Grid layout: ${ROWS}x${COLS} with $NUM_USERS participants"

# Prepare FFmpeg inputs and filters
INPUTS=()
VIDEO_FILTER=""
AUDIO_INPUTS=""
TILE_INPUTS=""
INDEX=0

for USER_ID in "${!USER_RECORDINGS[@]}"; do
    INPUT_FILE="$TEMP_DIR/users/$USER_ID.${USER_RECORDINGS[$USER_ID]##*.}"
    PROCESSED_FILE="$TEMP_DIR/users/${USER_ID}_processed.mp4"
    
    echo "Processing $USER_ID's video..."
    
    # Convert to MP4 (no scaling needed since we checked dimensions)
    if ! ffmpeg -y -i "$INPUT_FILE" \
        -c:v libx264 -preset fast -pix_fmt yuv420p -movflags +faststart \
        -c:a aac -b:a $AUDIO_BITRATE \
        -r $FRAME_RATE \
        "$PROCESSED_FILE"; then
        
        log_warning "Failed to process video for user $USER_ID - skipping"
        continue
    fi
    
    # Verify processing
    if [ ! -f "$PROCESSED_FILE" ]; then
        log_warning "Processed file missing for user $USER_ID - skipping"
        continue
    fi
    
    INPUTS+=("-i" "$PROCESSED_FILE")
    VIDEO_FILTER+="[${INDEX}:v]scale=w=iw/${COLS}:h=ih/${ROWS}:force_original_aspect_ratio=decrease[v${INDEX}];"
    AUDIO_INPUTS+="[${INDEX}:a]"
    TILE_INPUTS+="[v${INDEX}]"
    INDEX=$((INDEX + 1))
done

## Step 3: Generate grid layout
echo "=== Generating video grid ==="

# Calculate xstack layout
LAYOUT=""
for ((i=0; i<NUM_USERS; i++)); do
    X_POS=$((i % COLS))
    Y_POS=$((i / COLS))
    LAYOUT+="${X_POS}_${Y_POS}|"
done
LAYOUT=${LAYOUT%|}

# Create the grid video with mixed audio
GRID_OUTPUT="$TEMP_DIR/output/grid_recording.mp4"
if ! ffmpeg \
    "${INPUTS[@]}" \
    -filter_complex \
        "${VIDEO_FILTER}${TILE_INPUTS}xstack=inputs=${NUM_USERS}:layout=${LAYOUT},format=yuv420p[v];
         ${AUDIO_INPUTS}amix=inputs=${NUM_USERS}:duration=longest[a]" \
    -map "[v]" \
    -map "[a]" \
    -c:v libx264 -preset fast -b:v $VIDEO_BITRATE \
    -c:a aac -b:a $AUDIO_BITRATE \
    -r $FRAME_RATE \
    -movflags +faststart \
    "$GRID_OUTPUT"; then
    
    log_error_and_exit "Failed to generate grid video"
fi

# Verify output
if [ ! -f "$GRID_OUTPUT" ]; then
    log_error_and_exit "Grid video output file missing"
fi

## Step 4: Create separate audio file
echo "=== Creating separate audio file ==="
AUDIO_OUTPUT="$TEMP_DIR/output/audio_only.mp3"
if ! ffmpeg -i "$GRID_OUTPUT" -vn -c:a libmp3lame -q:a 2 "$AUDIO_OUTPUT"; then
    log_error_and_exit "Failed to create audio file"
fi

## Step 5: Upload results
echo "=== Uploading results ==="
if ! gsutil cp "$GRID_OUTPUT" "$BUCKET_NAME//$MEETING_ID/processed/grid_recording.mp4"; then
    log_error_and_exit "Failed to upload grid video"
fi

if ! gsutil cp "$AUDIO_OUTPUT" "$BUCKET_NAME//$MEETING_ID/processed/audio_only.mp3"; then
    log_error_and_exit "Failed to upload audio file"
fi

## Cleanup
echo "=== Cleaning up ==="
rm -rf "$TEMP_DIR"

echo "===== Processing complete successfully ====="
echo "Output files:"
echo "- Grid video: $BUCKET_NAME//$MEETING_ID/processed/grid_recording.mp4"
echo "- Audio only: $BUCKET_NAME//$MEETING_ID/processed/audio_only.mp3"
date