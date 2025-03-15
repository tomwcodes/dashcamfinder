#!/usr/bin/env node
/**
 * Update Products Script
 * This script fetches dash cam product data using the Oxylabs API
 * and updates the products.json file with the latest information.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { scrapeDashCamProducts } from './amazon-scraper.js';
import { processProductsArray, enhanceProductWithOxylabsData } from './product-processor.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

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
      
      // Update specifications if provided
      if (newProduct.specs) {
        existingProduct.specs = newProduct.specs;
      }
      
      // Update structured specifications if provided
      if (newProduct.structuredSpecs) {
        existingProduct.structuredSpecs = newProduct.structuredSpecs;
      }
      
      // Update technical details if provided
      if (newProduct.technicalDetails) {
        existingProduct.technicalDetails = newProduct.technicalDetails;
      }
      
      // Update description if provided
      if (newProduct.description) {
        existingProduct.description = newProduct.description;
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
    const rawProducts = await scrapeDashCamProducts();
    log(`Scraped ${rawProducts.length} raw products`);
    
    // Process products with enhanced extraction
    const processedProducts = processProductsArray(rawProducts);
    log(`Processed ${processedProducts.length} products with enhanced specification extraction`);
    
    // Log extraction statistics
    logExtractionStatistics(processedProducts);
    
    // Merge products
    const mergedProducts = mergeProducts(currentProducts, processedProducts);
    log(`Merged into ${mergedProducts.length} total products`);
    
    // Save merged products
    saveProducts(mergedProducts);
    
    log('Product data update completed successfully');
  } catch (error) {
    log(`Error updating products: ${error.message}`, true);
    process.exit(1);
  }
}

/**
 * Log statistics about the extraction process
 * @param {Array} products - Array of processed products
 */
function logExtractionStatistics(products) {
  // Count products with each specification
  const stats = {
    totalProducts: products.length,
    withResolution: 0,
    withFOV: 0,
    withWiFi: 0,
    withGPS: 0,
    withNightVision: 0,
    withParkingMode: 0,
    withScreenSize: 0,
    withStorageInfo: 0,
    confidenceScores: {
      high: 0,  // > 0.8
      medium: 0, // 0.5 - 0.8
      low: 0     // < 0.5
    },
    sourcesUsed: {
      model: 0,
      features: 0,
      structuredSpecs: 0,
      description: 0,
      technicalDetails: 0,
      default: 0
    }
  };
  
  // Analyze each product
  products.forEach(product => {
    if (!product.specs) return;
    
    // Check for key specifications
    if (product.specs.video && product.specs.video.resolution && product.specs.video.resolution.value) {
      stats.withResolution++;
    }
    
    if (product.specs.physical && product.specs.physical.fov && product.specs.physical.fov.value) {
      stats.withFOV++;
    }
    
    if (product.specs.connectivity && product.specs.connectivity.wifi && product.specs.connectivity.wifi.value) {
      stats.withWiFi++;
    }
    
    if (product.specs.connectivity && product.specs.connectivity.gps && product.specs.connectivity.gps.value) {
      stats.withGPS++;
    }
    
    if (product.specs.video && product.specs.video.nightVision && product.specs.video.nightVision.value) {
      stats.withNightVision++;
    }
    
    if (product.specs.features && product.specs.features.parkingMode && product.specs.features.parkingMode.value) {
      stats.withParkingMode++;
    }
    
    if (product.specs.physical && product.specs.physical.screenSize && product.specs.physical.screenSize.value) {
      stats.withScreenSize++;
    }
    
    if (product.specs.storage && 
        ((product.specs.storage.includedStorage && product.specs.storage.includedStorage.value) || 
         (product.specs.storage.maxStorage && product.specs.storage.maxStorage.value))) {
      stats.withStorageInfo++;
    }
    
    // Count sources used
    if (product.extractionMetadata && product.extractionMetadata.sourcesUsed) {
      const sourcesUsed = product.extractionMetadata.sourcesUsed;
      
      // Check each category
      for (const category in sourcesUsed) {
        if (sourcesUsed.hasOwnProperty(category)) {
          // Check each specification in the category
          for (const spec in sourcesUsed[category]) {
            if (sourcesUsed[category].hasOwnProperty(spec) && 
                sourcesUsed[category][spec] && 
                sourcesUsed[category][spec].source) {
              
              // Count the source
              const source = sourcesUsed[category][spec].source;
              if (stats.sourcesUsed.hasOwnProperty(source)) {
                stats.sourcesUsed[source]++;
              }
              
              // Count confidence level
              const confidence = sourcesUsed[category][spec].confidence || 0;
              if (confidence > 0.8) {
                stats.confidenceScores.high++;
              } else if (confidence >= 0.5) {
                stats.confidenceScores.medium++;
              } else {
                stats.confidenceScores.low++;
              }
            }
          }
        }
      }
    }
  });
  
  // Log the statistics
  log('Extraction Statistics:');
  log(`Total Products: ${stats.totalProducts}`);
  log(`Products with Resolution: ${stats.withResolution} (${Math.round(stats.withResolution / stats.totalProducts * 100)}%)`);
  log(`Products with FOV: ${stats.withFOV} (${Math.round(stats.withFOV / stats.totalProducts * 100)}%)`);
  log(`Products with WiFi: ${stats.withWiFi} (${Math.round(stats.withWiFi / stats.totalProducts * 100)}%)`);
  log(`Products with GPS: ${stats.withGPS} (${Math.round(stats.withGPS / stats.totalProducts * 100)}%)`);
  log(`Products with Night Vision: ${stats.withNightVision} (${Math.round(stats.withNightVision / stats.totalProducts * 100)}%)`);
  log(`Products with Parking Mode: ${stats.withParkingMode} (${Math.round(stats.withParkingMode / stats.totalProducts * 100)}%)`);
  log(`Products with Screen Size: ${stats.withScreenSize} (${Math.round(stats.withScreenSize / stats.totalProducts * 100)}%)`);
  log(`Products with Storage Info: ${stats.withStorageInfo} (${Math.round(stats.withStorageInfo / stats.totalProducts * 100)}%)`);
  
  log('Confidence Scores:');
  const totalSpecs = stats.confidenceScores.high + stats.confidenceScores.medium + stats.confidenceScores.low;
  log(`High Confidence (>0.8): ${stats.confidenceScores.high} (${Math.round(stats.confidenceScores.high / totalSpecs * 100)}%)`);
  log(`Medium Confidence (0.5-0.8): ${stats.confidenceScores.medium} (${Math.round(stats.confidenceScores.medium / totalSpecs * 100)}%)`);
  log(`Low Confidence (<0.5): ${stats.confidenceScores.low} (${Math.round(stats.confidenceScores.low / totalSpecs * 100)}%)`);
  
  log('Sources Used:');
  log(`Model String: ${stats.sourcesUsed.model}`);
  log(`Features: ${stats.sourcesUsed.features}`);
  log(`Structured Specs: ${stats.sourcesUsed.structuredSpecs}`);
  log(`Description: ${stats.sourcesUsed.description}`);
  log(`Technical Details: ${stats.sourcesUsed.technicalDetails}`);
  log(`Default Values: ${stats.sourcesUsed.default}`);
}

// Run the update if this script is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  updateProducts();
}

export {
  updateProducts
};
