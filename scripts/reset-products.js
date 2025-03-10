#!/usr/bin/env node
/**
 * Reset Products Script
 * This script deletes all existing product data and populates the products.json
 * file with only the products from the PRODUCT_URLS array in amazon-scraper.js.
 */

const fs = require('fs');
const path = require('path');
// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { scrapeProductUrls, PRODUCT_URLS } = require('./amazon-scraper');

// File paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BACKUP_FILE = path.join(DATA_DIR, 'products.backup.json');
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
 * Creates a backup of the current products file
 */
function backupCurrentProducts() {
  if (fs.existsSync(PRODUCTS_FILE)) {
    try {
      fs.copyFileSync(PRODUCTS_FILE, BACKUP_FILE);
      log(`Created backup of products file: ${BACKUP_FILE}`);
    } catch (error) {
      log(`Error creating backup: ${error.message}`, true);
    }
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
 * Main function to reset product data
 */
async function resetProducts() {
  log('Starting product data reset...');
  
  try {
    // Ensure data directory exists
    ensureDataDirectory();
    
    // Backup current products
    backupCurrentProducts();
    
    log('Deleting all existing product data...');
    
    // Scrape only the products from PRODUCT_URLS in amazon-scraper.js
    log(`Scraping ${PRODUCT_URLS.length} products from PRODUCT_URLS array...`);
    const newProducts = await scrapeProductUrls(PRODUCT_URLS);
    log(`Scraped ${newProducts.length} products from PRODUCT_URLS`);
    
    // Save new products
    saveProducts(newProducts);
    
    log('Product data reset completed successfully');
  } catch (error) {
    log(`Error resetting products: ${error.message}`, true);
    process.exit(1);
  }
}

// Run the reset if this script is executed directly
if (require.main === module) {
  resetProducts();
}

module.exports = {
  resetProducts
};
