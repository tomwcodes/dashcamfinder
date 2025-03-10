# DashCamFinder - Amazon Product Data Integration

This project implements the Oxylabs API to gather Amazon product data for dash cams and automatically refresh the data every morning at 06:00 GMT.

## Project Structure

```
dashcamfinder/
├── index.html                # Main application page with product comparison functionality
├── buying-guide.html         # Educational content about dash cam selection
├── affiliate-disclosure.html # Legal disclosure for affiliate relationships
├── robots.txt                # Search engine crawling instructions
├── sitemap.xml               # Site structure for search engines
├── README.md                 # This file with project documentation
├── data/
│   └── products.json         # Stored product data (updated daily)
├── scripts/
│   ├── main.js               # Client-side functionality for filtering, sorting, and display
│   ├── amazon-scraper.js     # Oxylabs API integration script
│   └── update-products.js    # Script to update product data
├── styles/
│   └── main.css              # Global styles with CSS variables and responsive design
└── cron/
    ├── daily-update.sh       # Shell script for daily updates
    └── setup-cron.sh         # Script to set up the cron job
```

## Setup Instructions

### 1. Install Required Dependencies

This project requires Node.js to run the scraping scripts. Install it if you haven't already:

```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# For macOS with Homebrew
brew install node
```

### 2. Configure Oxylabs API Credentials

Edit the `scripts/amazon-scraper.js` file and replace the placeholder credentials with your actual Oxylabs API credentials:

```javascript
// Configuration - Replace with your actual Oxylabs credentials
const OXYLABS_USERNAME = 'YOUR_OXYLABS_USERNAME';
const OXYLABS_PASSWORD = 'YOUR_OXYLABS_API_KEY';
```

### 3. Add Product URLs to Scrape

In the same file, update the `PRODUCT_URLS` array with the specific Amazon dash cam product URLs you want to scrape:

```javascript
// Product URLs - Add specific product URLs you want to scrape
const PRODUCT_URLS = [
  'https://www.amazon.com/Nextbase-Dash-Camera-Emergency-Recording/dp/B07PV1M3YF/',
  'https://www.amazon.com/Garmin-66W-Extra-Wide-Recording-G-sensor/dp/B07R638L8N/',
  // Add more product URLs as needed
];
```

### 4. Set Up the Cron Job

Run the setup script to configure the cron job for daily updates at 06:00 GMT:

```bash
./cron/setup-cron.sh
```

This will add a cron job to your system that runs the `daily-update.sh` script every day at 06:00 GMT.

### 5. Run a Manual Update (Optional)

To test the setup and perform an initial data fetch, you can run the update script manually:

```bash
node scripts/update-products.js
```

This will fetch the latest product data from Amazon using the Oxylabs API and save it to `data/products.json`.

## How It Works

### Data Collection

The system uses the Oxylabs E-Commerce Scraper API to collect product data from Amazon. The process works as follows:

1. The `amazon-scraper.js` script connects to the Oxylabs API and sends requests for dash cam product data.
2. It extracts relevant information such as brand, model, price, rating, features, etc.
3. The data is formatted to match the structure expected by the frontend.

### Data Storage

Product data is stored in a JSON file (`data/products.json`) that follows the same structure as the original hardcoded array, making it easy to integrate with the existing frontend code.

### Frontend Integration

The frontend has been modified to load product data from the JSON file instead of using a hardcoded array:

1. When the page loads, it fetches the product data from the JSON file.
2. If the fetch fails, it falls back to cached data in localStorage.
3. The data is then used to populate the product filters and display.

### Daily Updates

A cron job runs the update script daily at 06:00 GMT to ensure the product data is always up-to-date:

1. The script reads the current product data from the JSON file.
2. It fetches the latest data from Amazon using the Oxylabs API.
3. It merges the new data with the existing data, updating prices, ratings, etc.
4. The updated data is saved back to the JSON file.

## Troubleshooting

### Logs

Check the following log files for troubleshooting:

- `data/update.log`: Contains logs from the update script.
- `data/cron.log`: Contains logs from the cron job.

### Common Issues

1. **API Authentication Errors**: Ensure your Oxylabs API credentials are correct.
2. **Missing Product Data**: Check that the product URLs are valid and accessible.
3. **Cron Job Not Running**: Verify the cron job is set up correctly with `crontab -l`.

## Maintenance

- Regularly check the logs to ensure the updates are running smoothly.
- Update the product URLs as needed to add or remove products.
- Consider implementing a notification system to alert you of any failures.
