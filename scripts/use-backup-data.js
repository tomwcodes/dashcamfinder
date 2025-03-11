#!/usr/bin/env node
/**
 * Use Backup Data Script
 * This script copies the backup product data to the products.json file.
 */

const fs = require('fs');
const path = require('path');

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
 * Main function to use backup data
 */
function useBackupData() {
  log('Starting to use backup data...');
  
  try {
    // Check if backup file exists
    if (!fs.existsSync(BACKUP_FILE)) {
      log(`Backup file not found: ${BACKUP_FILE}`, true);
      return;
    }
    
    // Read backup data
    const backupData = fs.readFileSync(BACKUP_FILE, 'utf8');
    let products = [];
    
    try {
      products = JSON.parse(backupData);
      log(`Read ${products.length} products from backup file`);
    } catch (parseError) {
      log(`Error parsing backup data: ${parseError.message}`, true);
      return;
    }
    
    // Save to products.json
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    log(`Saved ${products.length} products to ${PRODUCTS_FILE}`);
    
    log('Successfully used backup data');
  } catch (error) {
    log(`Error using backup data: ${error.message}`, true);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  useBackupData();
}

module.exports = {
  useBackupData
};
