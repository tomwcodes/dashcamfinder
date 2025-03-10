#!/bin/bash
# Setup Cron Job for Daily Product Updates
# This script sets up a cron job to run the daily-update.sh script at 06:00 GMT

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Get the project root directory (parent of script directory)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Full path to the daily update script
DAILY_UPDATE_SCRIPT="$SCRIPT_DIR/daily-update.sh"

# Ensure the daily update script is executable
chmod +x "$DAILY_UPDATE_SCRIPT"

# Create a temporary file for the crontab
TEMP_CRONTAB=$(mktemp)

# Export current crontab to the temporary file
crontab -l > "$TEMP_CRONTAB" 2>/dev/null || echo "# DashCamFinder Cron Jobs" > "$TEMP_CRONTAB"

# Check if the cron job already exists
if ! grep -q "$DAILY_UPDATE_SCRIPT" "$TEMP_CRONTAB"; then
  # Add the cron job to run at 06:00 GMT
  echo "# Run DashCamFinder product update daily at 06:00 GMT" >> "$TEMP_CRONTAB"
  echo "0 6 * * * $DAILY_UPDATE_SCRIPT" >> "$TEMP_CRONTAB"
  
  # Install the new crontab
  crontab "$TEMP_CRONTAB"
  echo "Cron job installed successfully. Daily product update will run at 06:00 GMT."
else
  echo "Cron job already exists. No changes made."
fi

# Clean up the temporary file
rm "$TEMP_CRONTAB"

echo "You can verify your cron jobs by running: crontab -l"
