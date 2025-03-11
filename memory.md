# newdashcamfinder Project

## Project Overview
DashCamFinder is a web application designed to help users compare dash cam prices and features across various brands and models. The application provides a user-friendly interface for filtering and sorting dash cams based on different criteria, with a focus on providing comprehensive product information to aid purchasing decisions.

## Current State
The project has a functional implementation with the following features:
- Responsive design with CSS variables for consistent theming
- Product data fetched from Amazon using Oxylabs API and stored in JSON file
- Daily data refresh system using cron job (runs at 06:00 GMT)
- Filtering system by marketplace, brand, model, resolution, price range, and rating
- Sorting options by popularity, price, rating, and release date
- Two view modes: table view (without images) and grid view (with images)
- Enhanced table view with separate columns for brand and resolution for better data organization
- Horizontal rating stars layout for improved readability and user experience
- URL parameter management for shareable filtered views
- Dynamic SEO updates (title, meta description)
- Fallback to localStorage cache if JSON file can't be loaded
- Clean product data with only products from PRODUCT_URLS in amazon-scraper.js
- Reset script to repopulate product data from specific product URLs
- Recently reset and refreshed product data to ensure up-to-date information
- Improved Oxylabs API response parsing with robust property access paths and fallback mechanisms
- Marketplace-specific product filtering to ensure products only appear in their respective marketplace sections

## Project Structure
```
dashcamfinder/
├── index.html                # Main application page with product comparison functionality
├── buying-guide.html         # Educational content about dash cam selection (existing)
├── affiliate-disclosure.html # Legal disclosure for affiliate relationships (existing)
├── robots.txt                # Search engine crawling instructions
├── sitemap.xml               # Site structure for search engines
├── README.md                 # Project documentation
├── data/
│   └── products.json         # Stored product data (updated daily)
├── scripts/
│   ├── main.js               # Client-side functionality for filtering, sorting, and display
│   ├── amazon-scraper.js     # Oxylabs API integration script
│   ├── update-products.js    # Script to update product data
│   └── reset-products.js     # Script to reset product data using only PRODUCT_URLS
├── styles/
│   └── main.css              # Global styles with CSS variables and responsive design
└── cron/
    ├── daily-update.sh       # Shell script for daily updates
    └── setup-cron.sh         # Script to set up the cron job
```

## Technology Stack
- HTML5 with semantic elements
- CSS3 with variables and responsive design
- Vanilla JavaScript (ES6+)
- Node.js for server-side scripts
- Oxylabs E-Commerce Scraper API
- Cron for scheduled tasks
- dotenv for environment variable management
- Font Awesome icons
- Google Fonts (Inter, Montserrat)

## Implementation Details
- The application uses client-side filtering and sorting
- Product data is fetched from a JSON file that is updated daily
- The Oxylabs API is used to scrape product data from Amazon
- A cron job runs daily at 06:00 GMT to update the product data
- The UI is responsive and works on mobile, tablet, and desktop devices
- The design follows an 8px grid system for consistent spacing
- The color scheme uses a blue primary color (#1a73e8) with orange accents (#ff7043)

## Next Steps
The next development priorities are:
1. Add dark mode toggle functionality
2. Implement search functionality for all product text
3. Add product comparison feature
4. Create a "Recently Viewed" section using localStorage
5. Add more detailed feature filters

See todolist.md for a complete list of pending tasks.
