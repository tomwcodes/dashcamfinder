#!/usr/bin/env node
/**
 * Update Products Script
 * This script fetches dash cam product data using the Oxylabs API
 * and updates the products.json file with the latest information.
 */

const fs = require('fs');
const path = require('path');
// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { scrapeDashCamProducts } = require('./amazon-scraper');

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
 * Reads the current products from the JSON file
 * @returns {Array} - Array of product data
 */
function readCurrentProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    log('Products file does not exist yet. Will create a new one.');
    return [];
  }
  
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`Error reading products file: ${error.message}`, true);
    return [];
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
 * Merges new product data with existing data
 * @param {Array} currentProducts - Current product data
 * @param {Array} newProducts - New product data
 * @returns {Array} - Merged product data
 */
function mergeProducts(currentProducts, newProducts) {
  // Create a map of current products by ID
  const productMap = new Map();
  currentProducts.forEach(product => {
    productMap.set(product.id, product);
  });
  
  // Update or add new products
  newProducts.forEach(newProduct => {
    if (productMap.has(newProduct.id)) {
      // Update existing product
      const existingProduct = productMap.get(newProduct.id);
      
      // Merge prices
      existingProduct.price = { ...existingProduct.price, ...newProduct.price };
      
      // Merge Amazon URLs
      existingProduct.amazonUrl = { ...existingProduct.amazonUrl, ...newProduct.amazonUrl };
      
      // Update rating and review count if newer
      if (newProduct.rating > 0) {
        existingProduct.rating = newProduct.rating;
      }
      if (newProduct.reviewCount > 0) {
        existingProduct.reviewCount = newProduct.reviewCount;
      }
      
      // Update image if provided
      if (newProduct.image) {
        existingProduct.image = newProduct.image;
      }
      
      // Update features if provided
      if (newProduct.features && newProduct.features.length > 0) {
        existingProduct.features = newProduct.features;
      }
      
      // Update popularity
      existingProduct.popularity = newProduct.popularity;
    } else {
      // Add new product
      productMap.set(newProduct.id, newProduct);
    }
  });
  
  // Convert map back to array
  return Array.from(productMap.values());
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
 * Main function to update product data
 */
async function updateProducts() {
  log('Starting product data update...');
  
  try {
    // Ensure data directory exists
    ensureDataDirectory();
    
    // Backup current products
    backupCurrentProducts();
    
    // Read current products
    const currentProducts = readCurrentProducts();
    log(`Read ${currentProducts.length} existing products`);
    
    // Scrape new product data
    const newProducts = await scrapeDashCamProducts();
    log(`Scraped ${newProducts.length} new products`);
    
    // Merge products
    const mergedProducts = mergeProducts(currentProducts, newProducts);
    log(`Merged into ${mergedProducts.length} total products`);
    
    // Save merged products
    saveProducts(mergedProducts);
    
    log('Product data update completed successfully');
  } catch (error) {
    log(`Error updating products: ${error.message}`, true);
    process.exit(1);
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateProducts();
}

module.exports = {
  updateProducts
};
