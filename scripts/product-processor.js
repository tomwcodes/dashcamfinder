/**
 * DashCamFinder - Product Processor
 * Processes raw product data to extract structured specifications
 */

import { extractSpecifications } from './specification-extractor.js';
import { normalizeProductSpecs } from './data-normalizer.js';

/**
 * Process raw product data to extract structured specifications
 * @param {Object} rawProduct - Raw product data from API
 * @returns {Object} - Enhanced product with structured specifications
 */
function processProductData(rawProduct) {
  try {
    // Create a copy of the raw product
    const processedProduct = { ...rawProduct };
    
    // Extract specifications using the enhanced extraction system
    processedProduct.specs = extractSpecifications(rawProduct);
    
    // Normalize the extracted specifications
    const normalizedProduct = normalizeProductSpecs(processedProduct);
    
    // Create a clean model name (without all the specifications)
    normalizedProduct.cleanModelName = extractCleanModelName(rawProduct.brand, rawProduct.model || '');
    
    // Add structured data for debugging and confidence assessment
    normalizedProduct.extractionMetadata = {
      processingTimestamp: new Date().toISOString(),
      sourcesUsed: getSourcesUsed(normalizedProduct.specs)
    };
    
    return normalizedProduct;
  } catch (error) {
    console.error('Error processing product data:', error);
    // Return the original product if processing fails
    return rawProduct;
  }
}

/**
 * Get a list of sources used for extraction
 * @param {Object} specs - Extracted specifications
 * @returns {Object} - Sources used for each specification category
 */
function getSourcesUsed(specs) {
  const sourcesUsed = {};
  
  // For each specification category
  for (const category in specs) {
    if (specs.hasOwnProperty(category)) {
      sourcesUsed[category] = {};
      
      // For each specification in the category
      for (const spec in specs[category]) {
        if (specs[category].hasOwnProperty(spec) && 
            specs[category][spec] && 
            specs[category][spec].source) {
          sourcesUsed[category][spec] = {
            source: specs[category][spec].source,
            confidence: specs[category][spec].confidence,
            pattern: specs[category][spec].pattern
          };
        }
      }
    }
  }
  
  return sourcesUsed;
}

/**
 * Extract a clean model name without all the specifications
 * @param {string} brand - The product brand
 * @param {string} modelString - The product model string
 * @returns {string} - Clean model name
 */
function extractCleanModelName(brand, modelString) {
  if (!modelString) {
    return '';
  }
  
  // Remove the brand name from the beginning if present
  let cleanName = modelString.replace(new RegExp(`^${brand}\\s+`, 'i'), '');
  
  // Try to extract just the model identifier
  const modelIdentifierMatch = cleanName.match(/^([\w\d]+(?:[-\s][\w\d]+)?)/);
  if (modelIdentifierMatch) {
    return modelIdentifierMatch[1].trim();
  }
  
  // If we can't extract a clean model identifier, just return the first few words
  const firstFewWords = cleanName.split(/\s+/).slice(0, 2).join(' ');
  return firstFewWords || cleanName;
}

/**
 * Process an array of raw products
 * @param {Array} rawProducts - Array of raw product data
 * @returns {Array} - Array of processed products
 */
function processProductsArray(rawProducts) {
  if (!Array.isArray(rawProducts)) {
    console.error('Expected an array of products to process');
    return [];
  }
  
  return rawProducts.map(product => processProductData(product));
}

/**
 * Enhance product data with additional structured information from Oxylabs API
 * @param {Object} product - Product data
 * @param {Object} oxylabsData - Raw data from Oxylabs API
 * @returns {Object} - Enhanced product data
 */
function enhanceProductWithOxylabsData(product, oxylabsData) {
  if (!product || !oxylabsData) {
    return product;
  }
  
  try {
    const enhancedProduct = { ...product };
    
    // Extract structured specifications if available
    if (oxylabsData.results && 
        oxylabsData.results[0] && 
        oxylabsData.results[0].content) {
      
      const content = oxylabsData.results[0].content;
      
      // Add structured specifications if available
      if (content.specifications) {
        enhancedProduct.structuredSpecs = content.specifications;
      }
      
      // Add technical details if available
      if (content.technical_details) {
        enhancedProduct.technicalDetails = content.technical_details;
      }
      
      // Add description if available
      if (content.description && !enhancedProduct.description) {
        enhancedProduct.description = content.description;
      }
    }
    
    return enhancedProduct;
  } catch (error) {
    console.error('Error enhancing product with Oxylabs data:', error);
    return product;
  }
}

// Export functions for use in other modules
export {
  processProductData,
  processProductsArray,
  enhanceProductWithOxylabsData
};
