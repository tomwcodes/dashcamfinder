#!/usr/bin/env node
/**
 * Download Products Script
 * This script downloads product data from the PRODUCT_URLS array in amazon-scraper.js
 * with improved error handling and logging.
 */

const fs = require('fs');
const path = require('path');
// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { scrapeProductUrls, PRODUCT_URLS } = require('./amazon-scraper');

// File paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const LOG_FILE = path.join(DATA_DIR, 'update.log');

/**
 * Logs a message to the console and to the log file
 * @param {string} message - The message to log
 * @param {boolean} isError - Whether this is an error message
 */
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  // Log to console
  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

/**
 * Creates the data directory if it doesn't exist
 */
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    log(`Created data directory: ${DATA_DIR}`);
  }
}

/**
 * Saves product data to the JSON file
 * @param {Array} products - Array of product data
 */
function saveProducts(products) {
  try {
    // Sort products by popularity (descending)
    products.sort((a, b) => b.popularity - a.popularity);
    
    // Save to file
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    log(`Saved ${products.length} products to ${PRODUCTS_FILE}`);
  } catch (error) {
    log(`Error saving products: ${error.message}`, true);
  }
}

/**
 * Main function to download product data
 */
async function downloadProducts() {
  log('Starting product data download...');
  
  try {
    // Ensure data directory exists
    ensureDataDirectory();
    
    // Log the product URLs we're going to scrape
    log(`Product URLs to scrape (${PRODUCT_URLS.length}):`);
    PRODUCT_URLS.forEach((url, index) => {
      log(`  ${index + 1}. ${url}`);
    });
    
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out after 5 minutes')), 5 * 60 * 1000);
    });
    
    // Scrape products with timeout
    const scrapePromise = scrapeProductUrls(PRODUCT_URLS);
    
    // Race the scrape operation against the timeout
    const products = await Promise.race([scrapePromise, timeoutPromise]);
    
    log(`Successfully scraped ${products.length} products`);
    
    // Save products
    saveProducts(products);
    
    log('Product data download completed successfully');
  } catch (error) {
    log(`Error downloading products: ${error.message}`, true);
    
    // Try to save any partial results
    try {
      const emptyProducts = [];
      saveProducts(emptyProducts);
      log('Saved empty products array as fallback');
    } catch (saveError) {
      log(`Error saving fallback empty products: ${saveError.message}`, true);
    }
  }
}

// Run the download if this script is executed directly
if (require.main === module) {
  downloadProducts();
}

module.exports = {
  downloadProducts
};
