/**
 * Amazon Scraper using Oxylabs API
 * This script handles the integration with Oxylabs E-Commerce Scraper API
 * to collect dash cam product data from Amazon.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Get Oxylabs credentials from environment variables
const OXYLABS_USERNAME = process.env.OXYLABS_USERNAME || 'hikingtom_EndZU';
const OXYLABS_PASSWORD = process.env.OXYLABS_PASSWORD || '_C3TMABL22zs4bG';

// Amazon search URLs for dash cams
const AMAZON_SEARCH_URLS = [
  'https://www.amazon.com/s?k=dash+cam',
  'https://www.amazon.com/s?k=dashboard+camera',
  'https://www.amazon.co.uk/s?k=dash+cam',
  'https://www.amazon.co.uk/s?k=dashboard+camera'
];

// Product URLs - Add specific product URLs you want to scrape
const PRODUCT_URLS = [
  'https://www.amazon.com/Garmin-Extra-Wide-180-degree-Connected-Features/dp/B093244D1J?crid=37G8IKX6C288S&dib=eyJ2IjoiMSJ9.J7XVKz8MNSLeQCT3IDQFoy86etXo3dNNRpIuLVm5Mr15SurAJYK6nOtkSbbJ_JAWTwXQh1eLU2DtYmKTu2rz7Rr7AgySc6wtbVWvwz59vaDdItv-axi6q3Z8heLsyVAqWtrnyzNrTrSVrQU7pKPkdw5bAPGqxsJ7gltzI2Z4t4T13ZwZr22WaG6cCdWCcQvAn_Z-kFcLGRT7g_TgH8I04tIIMaB3hbjh3Yb9QPTjbOc.lgsO3yWi3cnkk8gF-dMd-XyHSm1MYYwkTqzRFPgjlCY&dib_tag=se&keywords=garmin+dash+cam&qid=1741621029&sprefix=garmin+dash+cam%2Caps%2C804&sr=8-3',
  'https://www.amazon.com/REDTIGER-Camera-Included-170%C2%B0Wide-Parking/dp/B098WVKF19?crid=14ITPVWX5IFTX&dib=eyJ2IjoiMSJ9.JUWAp6xRtfJBytt44-dkxD6od_IkpeNjYmVxvsNitVRPyhZnfH-flZGec0zN4fzXPcCQcpmBVh4CLEt9Txuz5MUOX8FwkkeRS4XQJbSLv1GegH396mugGcoaM8TapMDluVarZucmxPjRB78n2lYmmI9qRnDmGd6DPYjxweO6_NENHlzDJMjxnRWY0JR9uzKT1v2zHGKR9lJaZJNGO_4wqHFXXW14YDMKP4X0uFq2cP8.V6pxNv6yGXzy1M3ryEacVIJYw2KDZEdav7pGCSEXJI8&dib_tag=se&keywords=dash+cam&qid=1741621081&sprefix=garmin+dash+cam%2Caps%2C551&sr=8-3',
  // Add more product URLs as needed
];

/**
 * Makes a request to the Oxylabs E-Commerce Scraper API
 * @param {string} url - The Amazon URL to scrape
 * @param {string} source - Either 'search' or 'product'
 * @returns {Promise<Object>} - The parsed JSON response
 */
function scrapeAmazonUrl(url, source = 'product') {
  return new Promise((resolve, reject) => {
    // Determine if this is a UK or US Amazon URL
    const isUK = url.includes('amazon.co.uk');
    // Use zip/postal codes for geo_location as required by Oxylabs API
    const zipCode = isUK ? 'SW1A 1AA' : '10001'; // London or New York
    
    // Prepare the request payload
    const payload = JSON.stringify({
      source: 'amazon',
      url: url,
      geo_location: zipCode,
      render: 'html',
      parse: true
    });

    // Prepare the request options
    const options = {
      hostname: 'realtime.oxylabs.io',
      port: 443,
      path: '/v1/queries',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': 'Basic ' + Buffer.from(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`).toString('base64')
      }
    };

    // Make the request
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode !== 200) {
            console.error(`Error from Oxylabs API: ${JSON.stringify(parsedData)}`);
            reject(new Error(`Oxylabs API returned status code ${res.statusCode}`));
            return;
          }
          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing Oxylabs API response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error making request to Oxylabs API:', error);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Extracts product information from a search results page
 * @param {Object} searchData - The parsed search results from Oxylabs API
 * @returns {Array<string>} - Array of product URLs
 */
function extractProductUrlsFromSearch(searchData) {
  try {
    const results = searchData.results[0];
    if (!results || !results.content) {
      console.error('No search results found in the response');
      return [];
    }

    // Handle different response structures
    let productUrls = [];
    
    // Check if results are in the expected format
    if (results.content.results && Array.isArray(results.content.results)) {
      productUrls = results.content.results
        .filter(item => item.url && item.url.includes('/dp/'))
        .map(item => item.url);
    } 
    // Check if results are in the organic_results format
    else if (results.content.organic_results && Array.isArray(results.content.organic_results)) {
      productUrls = results.content.organic_results
        .filter(item => item.url && item.url.includes('/dp/'))
        .map(item => item.url);
    }
    // Check if results are in the search_results format
    else if (results.content.search_results && Array.isArray(results.content.search_results)) {
      productUrls = results.content.search_results
        .filter(item => item.url && item.url.includes('/dp/'))
        .map(item => item.url);
    }
    // Check if results are in the new format with 'results' at the top level
    else if (results.content.results && typeof results.content.results === 'string') {
      // This is likely a different format, try to extract ASIN from the HTML
      const asinMatches = results.content.results.match(/\/dp\/([A-Z0-9]{10})/g);
      if (asinMatches) {
        const domain = results.content.url.includes('amazon.co.uk') ? 'amazon.co.uk' : 'amazon.com';
        productUrls = [...new Set(asinMatches)].map(asin => `https://www.${domain}${asin}`);
      }
    }
    // Log the structure for debugging if no known format is found
    else {
      console.error('Unknown search results format:', Object.keys(results.content));
    }

    return productUrls;
  } catch (error) {
    console.error('Error extracting product URLs from search:', error);
    return [];
  }
}

/**
 * Extracts product details from a product page
 * @param {Object} productData - The parsed product data from Oxylabs API
 * @param {string} marketplace - Either 'amazon_com' or 'amazon_uk'
 * @returns {Object|null} - Formatted product data or null if extraction fails
 */
function extractProductDetails(productData, marketplace) {
  try {
    const results = productData.results[0];
    if (!results || !results.content) {
      console.error('No product data found in the response');
      return null;
    }

    // Log the full structure for debugging
    console.log('API Response Structure:', JSON.stringify(Object.keys(results), null, 2));
    console.log('Content Structure:', JSON.stringify(Object.keys(results.content), null, 2));

    // Handle different response structures
    let product;
    
    // Check if product is in the expected format
    if (results.content.product) {
      product = results.content.product;
      console.log('Product found in results.content.product');
    } 
    // Check if product is directly in the content
    else if (results.content.title && results.content.asin) {
      product = results.content;
      console.log('Product found directly in results.content');
    }
    // Check if product is in a different location
    else if (results.content.products && results.content.products.length > 0) {
      product = results.content.products[0];
      console.log('Product found in results.content.products[0]');
    }
    // Check if product is in a different format
    else if (results.content.result && results.content.result.product) {
      product = results.content.result.product;
      console.log('Product found in results.content.result.product');
    }
    // Log the structure for debugging if no known format is found
    else {
      console.error('Unknown product data format:', JSON.stringify(results.content, null, 2));
      // Try to find any object that might contain product data
      for (const key in results.content) {
        if (typeof results.content[key] === 'object' && results.content[key] !== null) {
          console.log(`Checking ${key} for product data:`, Object.keys(results.content[key]));
          if (results.content[key].title || results.content[key].name) {
            product = results.content[key];
            console.log(`Found potential product data in ${key}`);
            break;
          }
        }
      }
      
      if (!product) {
        return null;
      }
    }
    
    // Log product structure for debugging
    console.log('Product Structure:', JSON.stringify(Object.keys(product), null, 2));
    
    // Extract brand and model from title
    let brand = '';
    let model = '';
    
    // Try different paths for brand
    if (product.brand) {
      brand = product.brand;
    } else if (product.manufacturer) {
      brand = product.manufacturer;
    } else if (product.seller && product.seller.name) {
      brand = product.seller.name;
    }
    
    // Extract title
    const title = product.title || product.name || '';
    
    if (title) {
      // Try to extract model from title if brand is known
      if (brand) {
        model = title.replace(brand, '').trim();
        // Further clean up model (remove common words)
        model = model.replace(/dash\s*cam|dashboard\s*camera|car\s*camera/gi, '').trim();
      } else {
        // Try to guess brand and model from title
        const titleParts = title.split(' ');
        if (titleParts.length > 1) {
          brand = titleParts[0];
          model = titleParts.slice(1, Math.min(4, titleParts.length)).join(' ');
        }
      }
    }

    // Extract features/specifications
    const features = [];
    
    // Try different paths for features
    if (product.feature_bullets && Array.isArray(product.feature_bullets)) {
      product.feature_bullets.forEach(bullet => {
        features.push(bullet.trim());
      });
    } else if (product.features && Array.isArray(product.features)) {
      product.features.forEach(feature => {
        features.push(feature.trim());
      });
    } else if (product.description && typeof product.description === 'string') {
      // Try to extract features from description
      const descLines = product.description.split('\n');
      descLines.forEach(line => {
        if (line.trim().length > 10 && !line.includes('http')) {
          features.push(line.trim());
        }
      });
    } else if (product.bullet_points && Array.isArray(product.bullet_points)) {
      product.bullet_points.forEach(bullet => {
        features.push(bullet.trim());
      });
    }

    // Extract price
    let price = 0;
    
    // Try different paths for price
    if (product.pricing && product.pricing.current_price) {
      price = parseFloat(product.pricing.current_price);
    } else if (product.price && typeof product.price === 'number') {
      price = product.price;
    } else if (product.price && typeof product.price === 'string') {
      // Try to extract number from string like "$99.99"
      const priceMatch = product.price.match(/[\d,.]+/);
      if (priceMatch) {
        price = parseFloat(priceMatch[0].replace(/,/g, ''));
      }
    } else if (product.current_price) {
      price = parseFloat(product.current_price);
    } else if (product.price_info && product.price_info.current_price) {
      price = parseFloat(product.price_info.current_price);
    }

    // Extract image URL
    let imageUrl = '';
    
    // Try different paths for image
    if (product.main_image && typeof product.main_image === 'string') {
      imageUrl = product.main_image;
    } else if (product.images && product.images.length > 0) {
      imageUrl = product.images[0].url || product.images[0];
    } else if (product.image && typeof product.image === 'string') {
      imageUrl = product.image;
    } else if (product.image_url) {
      imageUrl = product.image_url;
    } else if (product.image_urls && product.image_urls.length > 0) {
      imageUrl = product.image_urls[0];
    } else if (product.primary_image) {
      imageUrl = product.primary_image;
    }

    // Extract rating
    let rating = 0;
    
    // Try different paths for rating
    if (product.rating && typeof product.rating === 'number') {
      rating = product.rating;
    } else if (product.reviews && product.reviews.rating) {
      rating = product.reviews.rating;
    } else if (product.average_rating) {
      rating = product.average_rating;
    } else if (product.stars && typeof product.stars === 'number') {
      rating = product.stars;
    } else if (product.stars && typeof product.stars === 'string') {
      // Try to extract number from string like "4.5 out of 5 stars"
      const ratingMatch = product.stars.match(/[\d.]+/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[0]);
      }
    }

    // Extract review count
    let reviewCount = 0;
    
    // Try different paths for review count
    if (product.ratings_total && typeof product.ratings_total === 'number') {
      reviewCount = product.ratings_total;
    } else if (product.review_count) {
      reviewCount = product.review_count;
    } else if (product.reviews && product.reviews.count) {
      reviewCount = product.reviews.count;
    } else if (product.reviews_count) {
      reviewCount = product.reviews_count;
    } else if (product.reviews_total) {
      reviewCount = product.reviews_total;
    }

    // Determine resolution from title or features
    let resolution = '1080p'; // Default
    const resolutionPatterns = [
      { pattern: /4k|2160p/i, value: '4K' },
      { pattern: /1440p|2k|2\.7k/i, value: '1440p' },
      { pattern: /1080p|full\s*hd/i, value: '1080p' },
      { pattern: /720p|hd/i, value: '720p' }
    ];

    // Check title for resolution
    for (const resPat of resolutionPatterns) {
      if (resPat.pattern.test(title)) {
        resolution = resPat.value;
        break;
      }
    }

    // If not found in title, check features
    if (resolution === '1080p' && features.length > 0) {
      for (const feature of features) {
        for (const resPat of resolutionPatterns) {
          if (resPat.pattern.test(feature)) {
            resolution = resPat.value;
            break;
          }
        }
        if (resolution !== '1080p') break;
      }
    }

    // Extract URL
    let url = product.url || product.link || results.url || '';

    // Generate a unique ID
    const id = generateProductId(product.asin || '', brand, model);

    // Format the product data to match the existing structure
    const formattedProduct = {
      id: id,
      brand: brand,
      model: model,
      image: imageUrl,
      price: {
        [marketplace]: price
      },
      rating: rating,
      reviewCount: reviewCount,
      resolution: resolution,
      features: features.slice(0, 6), // Take up to 6 features
      releaseDate: estimateReleaseDate(product),
      popularity: calculatePopularity(rating, reviewCount),
      amazonUrl: {
        [marketplace === 'amazon_uk' ? 'uk' : 'com']: url
      }
    };

    console.log('Extracted product data:', JSON.stringify(formattedProduct, null, 2));
    return formattedProduct;
  } catch (error) {
    console.error('Error extracting product details:', error);
    return null;
  }
}

/**
 * Generates a unique product ID
 * @param {string} asin - Amazon ASIN
 * @param {string} brand - Product brand
 * @param {string} model - Product model
 * @returns {number} - Unique ID
 */
function generateProductId(asin, brand, model) {
  // If we have an ASIN, use its hash
  if (asin) {
    return Math.abs(hashString(asin)) % 10000;
  }
  
  // Otherwise use brand and model
  const brandModel = `${brand}${model}`;
  return Math.abs(hashString(brandModel)) % 10000;
}

/**
 * Simple string hashing function
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Estimates a release date if not available
 * @param {Object} product - Product data
 * @returns {string} - ISO date string
 */
function estimateReleaseDate(product) {
  // If we have a release date, use it
  if (product.release_date) {
    return new Date(product.release_date).toISOString().split('T')[0];
  }
  
  // If we have a first available date, use it
  if (product.first_available) {
    return new Date(product.first_available).toISOString().split('T')[0];
  }
  
  // Otherwise, estimate based on current date (1 year ago)
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Calculates a popularity score based on rating and review count
 * @param {number} rating - Product rating (0-5)
 * @param {number} reviewCount - Number of reviews
 * @returns {number} - Popularity score (0-100)
 */
function calculatePopularity(rating, reviewCount) {
  // Simple algorithm: (rating/5 * 50) + (min(reviewCount, 10000)/10000 * 50)
  const ratingScore = (rating / 5) * 50;
  const reviewScore = (Math.min(reviewCount, 10000) / 10000) * 50;
  return Math.round(ratingScore + reviewScore);
}

/**
 * Scrapes product data from Amazon search results
 * @returns {Promise<Array>} - Array of product data
 */
async function scrapeSearchResults() {
  const productUrls = [];
  
  // First, get product URLs from search results
  for (const searchUrl of AMAZON_SEARCH_URLS) {
    try {
      console.log(`Scraping search results from: ${searchUrl}`);
      const searchData = await scrapeAmazonUrl(searchUrl, 'search');
      const urls = extractProductUrlsFromSearch(searchData);
      productUrls.push(...urls);
      console.log(`Found ${urls.length} product URLs from search`);
    } catch (error) {
      console.error(`Error scraping search results from ${searchUrl}:`, error);
    }
  }
  
  return scrapeProductUrls([...new Set(productUrls)]);
}

/**
 * Scrapes product data from specific product URLs
 * @param {Array<string>} urls - Array of product URLs to scrape
 * @returns {Promise<Array>} - Array of product data
 */
async function scrapeProductUrls(urls) {
  const products = [];
  
  // Add any manually specified product URLs
  urls = [...new Set([...urls, ...PRODUCT_URLS])];
  
  // Scrape each product URL
  for (const url of urls) {
    try {
      console.log(`Scraping product data from: ${url}`);
      const marketplace = url.includes('amazon.co.uk') ? 'amazon_uk' : 'amazon_com';
      const productData = await scrapeAmazonUrl(url);
      const product = extractProductDetails(productData, marketplace);
      
      if (product) {
        products.push(product);
        console.log(`Successfully scraped product: ${product.brand} ${product.model}`);
      }
    } catch (error) {
      console.error(`Error scraping product data from ${url}:`, error);
    }
  }
  
  return products;
}

/**
 * Merges product data from different marketplaces
 * @param {Array} products - Array of product data
 * @returns {Array} - Array of merged product data
 */
function mergeProductData(products) {
  const productMap = new Map();
  
  // Group products by ID
  for (const product of products) {
    if (!productMap.has(product.id)) {
      productMap.set(product.id, product);
    } else {
      // Merge product data
      const existingProduct = productMap.get(product.id);
      
      // Merge prices
      existingProduct.price = { ...existingProduct.price, ...product.price };
      
      // Merge Amazon URLs
      existingProduct.amazonUrl = { ...existingProduct.amazonUrl, ...product.amazonUrl };
      
      // Use higher rating and review count
      if (product.rating > existingProduct.rating) {
        existingProduct.rating = product.rating;
      }
      if (product.reviewCount > existingProduct.reviewCount) {
        existingProduct.reviewCount = product.reviewCount;
      }
      
      // Use more features if available
      if (product.features.length > existingProduct.features.length) {
        existingProduct.features = product.features;
      }
      
      // Update popularity
      existingProduct.popularity = calculatePopularity(
        existingProduct.rating,
        existingProduct.reviewCount
      );
    }
  }
  
  return Array.from(productMap.values());
}

/**
 * Main function to scrape dash cam product data
 * @returns {Promise<Array>} - Array of product data
 */
async function scrapeDashCamProducts() {
  try {
    console.log('Starting to scrape dash cam products...');
    
    // Scrape products from search results
    const products = await scrapeSearchResults();
    
    // Merge product data from different marketplaces
    const mergedProducts = mergeProductData(products);
    
    console.log(`Successfully scraped ${mergedProducts.length} dash cam products`);
    return mergedProducts;
  } catch (error) {
    console.error('Error scraping dash cam products:', error);
    return [];
  }
}

module.exports = {
  scrapeDashCamProducts,
  scrapeProductUrls,
  PRODUCT_URLS
};
