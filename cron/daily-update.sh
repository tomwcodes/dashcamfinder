#!/bin/bash
# Daily update script for DashCamFinder
# This script runs the update-products.js script to fetch the latest product data
# It should be scheduled to run daily at 06:00 GMT

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Get the project root directory (parent of script directory)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Log file
LOG_FILE="$PROJECT_DIR/data/cron.log"

# Ensure log directory exists
mkdir -p "$PROJECT_DIR/data"

# Log start time
echo "[$(date -u)] Starting daily product update..." >> "$LOG_FILE"

# Change to project directory
cd "$PROJECT_DIR" || {
  echo "[$(date -u)] Error: Could not change to project directory: $PROJECT_DIR" >> "$LOG_FILE"
  exit 1
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "[$(date -u)] Error: Node.js is not installed" >> "$LOG_FILE"
  exit 1
fi

# Run the update script
echo "[$(date -u)] Running update-products.js..." >> "$LOG_FILE"
node "$PROJECT_DIR/scripts/update-products.js" >> "$LOG_FILE" 2>&1

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo "[$(date -u)] Product update completed successfully" >> "$LOG_FILE"
else
  echo "[$(date -u)] Error: Product update failed" >> "$LOG_FILE"
fi

# Log end time
echo "[$(date -u)] Daily product update finished" >> "$LOG_FILE"
echo "----------------------------------------" >> "$LOG_FILE"
