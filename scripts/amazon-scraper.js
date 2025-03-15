/**
 * Amazon Scraper using Oxylabs Residential Proxies
 * This script handles the integration with Oxylabs Residential Proxies
 * to collect dash cam product data from Amazon.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Get Oxylabs credentials from environment variables
const OXYLABS_USERNAME = process.env.OXYLABS_USERNAME;
const OXYLABS_PASSWORD = process.env.OXYLABS_PASSWORD;
const OXYLABS_PROXY_USERNAME = process.env.OXYLABS_PROXY_USERNAME;
const OXYLABS_PROXY_PASSWORD = process.env.OXYLABS_PROXY_PASSWORD;
const OXYLABS_PROXY_SERVER = process.env.OXYLABS_PROXY_SERVER;

// Check if credentials are available
if (!OXYLABS_USERNAME || !OXYLABS_PASSWORD) {
  console.error('ERROR: Oxylabs credentials not found in environment variables.');
  console.error('Please set OXYLABS_USERNAME and OXYLABS_PASSWORD in your .env file.');
  console.error('See scripts/.env.example for reference.');
}

// Check if proxy credentials are available
if (!OXYLABS_PROXY_USERNAME || !OXYLABS_PROXY_PASSWORD || !OXYLABS_PROXY_SERVER) {
  console.error('ERROR: Oxylabs proxy credentials not found in environment variables.');
  console.error('Please set OXYLABS_PROXY_USERNAME, OXYLABS_PROXY_PASSWORD, and OXYLABS_PROXY_SERVER in your .env file.');
}

// Amazon search URLs for dash cams
const AMAZON_SEARCH_URLS = [
  'https://www.amazon.com/s?k=dash+cam',
  'https://www.amazon.com/s?k=dashboard+camera',
  'https://www.amazon.co.uk/s?k=dash+cam',
  'https://www.amazon.co.uk/s?k=dashboard+camera'
];

// Product URLs - Add specific product URLs you want to scrape
const PRODUCT_URLS = [
  // Garmin dash cams (these have been verified to work)
"https://www.amazon.com/REDTIGER-Camera-Included-170%C2%B0Wide-Parking/dp/B098WVKF19?crid=34NPEKYH2ZLUN&dib=eyJ2IjoiMSJ9.bJfIa99xDAJ1uLaHV0bnuExy-NgwMMZC3y6jv-SdA7etHmGXtDbnF56aj1mAuPuM-WDbWwHjGeI9euXogwkEDxZMtGDxhwFSfj5X6Ki2Pqo3u-sGdHutjPI2imwjP6--SIo0ANW7fAmi6-oUem6l_JwSLW5CRMQYeixdY_1cSj_7XICTci2U2yPXodCkYmIRKTo3PeDl836nFuDWJ-tzuanrS_6yA6swfmqGcc1EugU.2ydXndrkl49PvjME5-gev50QVCMxIya9kkRmpFn5KrA&dib_tag=se&keywords=REDTIGER+F7NP&qid=1742043826&sprefix=redtiger+f7np%2Caps%2C994&sr=8-3",
  "https://www.amazon.com/ROVE-R2-4K-DUAL-STARVIS-Included/dp/B0D6J5B98H?crid=2S8600HGGU00I&dib=eyJ2IjoiMSJ9.fbmQrFB_4WbWWTQMJgk8MUHFl4DGZpLNeZeI70alOGKX8H0IJgMa1DrwcDoXBNHRr-IPDnT4Ev-F3KKvLtTwrIkfQ3DRBv9vL_-rxI2G-f8g5bNeayJn85KkRF-RHRqaHT-vlcBTkqwLM-J4lXm5rV0hNdUvGrG6_lhRJhoU84CriJqSCNSbuV2Pqyj-S392oWGqKum3VQzBQTIJr9RiJVww7Xn6mXAoGo4iv5s-Q_I.JtmqixVNJX1aEDEBWn1sDgUO6R4EfeyJvcFl8NkYUgI&dib_tag=se&keywords=rove+r2&qid=1742043872&sprefix=rove+r2%2Caps%2C378&sr=8-3",
  "https://www.amazon.com/VIOFO-STARVIS-Control-Parking-Supercapacitor/dp/B0C5MVB7NX?crid=1PV1LJBU7THD9&dib=eyJ2IjoiMSJ9.gYfZw9JImHmo4H1GGP__xZxTYkWfmeG77as2zl9MUE8GrwZvIB8vFVg-q8VK0BW1uZ51rWRy5_T8GXte6c2dNUHJnMznrSbu1ELhuB4IbzIzhIAm8uhSRf2o4Kz7ncCkDnkx08Gv47Xgp6AEjvpBCbREKZPLPccRM3s8_aihSUV57GG5huFKRiBh63-O9HZgqPYk2MFuYRcrRwDpx2pVxxxq8yO4dhrT6YXlsN3VsOc.Pk-uwVZoaY-JIi5CELCoNU3RGV1LQDtN4Y1iOSctam4&dib_tag=se&keywords=VIOFO+A119+Mini&qid=1742043987&sprefix=viofo+a119+mini%2Caps%2C565&sr=8-1",
  "https://www.amazon.com/Camera-Dashboard-Recorder-Parking-Recording/dp/B0CC9G8G9Q?dib=eyJ2IjoiMSJ9.gU_4ddAohlhcjSh4pje7raFhsAmAkOHUdfY7FvemfqmcqnY-yAv8ofQhMTyAm3nPShtLt-FhImRmi-LOmEXbe0b0SqO2wj6fWfP_phR8LmwHkdCNxRIWv6pZVdCKHWGKUcPrVPjfZHwYHcAIPObetw.iNCJnW04aQxWfLs0XwkMvngLWE6Xh7s2W3hGjuN_5Hs&dib_tag=se&keywords=GMAIPOP+G900&qid=1742044066&sr=8-1",
  "https://www.amazon.com/Dashcams-Parking-Monitor-Recording-Support/dp/B0BKF6XQVY?crid=3HMXQGMRY272G&dib=eyJ2IjoiMSJ9.OprHLJirSbRZ_UFHFwaT91S3YyxE7EGHbi612be7Nwf2ildLz52_jvZaPeUacQl5HNqMraL6u3Hav1n3vZDviDrUA2Cf7BhY2eNSLVsiQYcgKBh2xuopW3na2ErPzmWwWtrNvvTzkD2guVE7-QVdEaCCBocT9fkdaRQ6EfM9Zs9G5f1VUpT0v2JcPd-zZlc8b4j0dfGgf8bcvPMaJNujeY2HLvKuUqg9kKjTB95uJWE.-a3FoDmI6M2I9Yt4OlTYsDXH_6BRZqZKCzvbjJ26GDU&dib_tag=se&keywords=ARIFAYZ+Q4&qid=1742044121&sprefix=arifayz+q4%2Caps%2C430&sr=8-1",
"https://www.amazon.co.uk/REDTIGER-Recorder-G-Sensor-Recording-Capacitor-Black/dp/B098WVKF19?dib=eyJ2IjoiMSJ9.y40nKtSbRlHhzWAvtQ8Dtw9ZpK1WtqoKns-nBdrcMHPPQwVZ4xYYQRQWvhydZVqtmt_mtEAncsOsZSTz38fWvmzx_WI43v2VyWytYPw-gi_cjhhXIFluX6Nt6bN6ZhxstSa42FjtKyzQ546naTLrqAIKZwREtTBHSlPfrXcVyNbwvwEhIl32I_JCSAIBBVUMx-TXMlRIJpGj_-jAoz8wl8piAuz1b0oTjeB3-K_9-7c.XPxgjKbNIS8vIHIw340lu95dXZIeoGJw5gZLigIUhAc&dib_tag=se&keywords=REDTIGER+F7NP&qid=1742043753&sr=8-4",
  "https://www.amazon.co.uk/R2-4K-Dashboard-Recorder-G-Sensor-Parking/dp/B074JT3698?dib=eyJ2IjoiMSJ9.7l9gIO2RVHx25O7qKMvtKn7pWTgiM_BsSw1WwJwxyYo8V8THs4qFF0UGGOrhKSzVZuaqxuZ5Q7WzZBDsQwSGorlHPaqFYuBVQ-V3vonUU_38bvH_jKdB4kERHyQDv1pY1F6YcyLG2ywzuyeh8e7c-ER6fh_B60EXwsGCkykdu8T_PNuQhQNyLKr5Xko05xs_V3mNKODEq64BSZtXwpufdgEMJrMfnSUbLfzpAzT7J-E.O0qtE34mhbdR2d9cZ963uQpXr8A2XrI7uKBUNXaB7FA&dib_tag=se&keywords=rove+r2&qid=1742043944&sr=8-4",
  "https://www.amazon.co.uk/VIOFO-A119-Dash-Front-Camera-Black/dp/B07RXQLV5C"
];

/**
 * Makes a request to Amazon using Oxylabs Residential Proxies
 * @param {string} url - The Amazon URL to scrape
 * @returns {Promise<Object>} - The parsed HTML response and metadata
 */
async function scrapeAmazonUrl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      // Determine if this is a UK or US Amazon URL
      const isUK = url.includes('amazon.co.uk');
      // Use country code for geo_location
      const country = isUK ? 'GB' : 'US';
      
      // Create proxy agent
      // Format: customer-USERNAME-cc-{country}:password@proxy
      const proxyUrl = `http://customer-${OXYLABS_PROXY_USERNAME}-cc-${country}:${OXYLABS_PROXY_PASSWORD}@${OXYLABS_PROXY_SERVER}`;
      console.log(`Using proxy URL: ${proxyUrl}`);
      const proxyAgent = new HttpsProxyAgent(proxyUrl);
      
      // Common user agents to mimic real browsers
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      ];
      
      // Randomly select a user agent
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      
      // Set request options
      const options = {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        },
        agent: proxyAgent,
        timeout: 60000 // 60 seconds timeout
      };
      
      console.log(`Scraping ${url} using residential proxy (${country})`);
      
      // Make the request
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Check if the response is empty
      if (!html || html.trim() === '') {
        throw new Error(`Empty response for URL: ${url}`);
      }
      
      // Check if we got a captcha page
      if (html.includes('captcha') && html.includes('robot')) {
        throw new Error(`Captcha detected for URL: ${url}`);
      }
      
      // Create a result object similar to the Oxylabs API response
      const result = {
        results: [{
          content: {
            url: url,
            html: html
          }
        }]
      };
      
      // Parse the HTML to extract product data
      const productData = parseAmazonHtml(html, url);
      
      if (productData) {
        result.results[0].content = {
          ...result.results[0].content,
          ...productData
        };
      }
      
      resolve(result);
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error.message);
      reject(error);
    }
  });
}

/**
 * Parses Amazon HTML to extract product data
 * @param {string} html - The HTML content
 * @param {string} url - The Amazon URL
 * @returns {Object} - Extracted product data
 */
function parseAmazonHtml(html, url) {
  try {
    // Basic product object
    const product = {
      url: url,
      asin: extractAsin(url),
      title: extractFromHtml(html, /<span id="productTitle"[^>]*>([^<]+)<\/span>/),
      brand: extractFromHtml(html, /<a id="bylineInfo"[^>]*>([^<]+)<\/a>/),
      price: extractPrice(html),
      rating: extractRating(html),
      reviews_count: extractReviewCount(html),
      images: extractImages(html),
      bullet_points: extractBulletPoints(html),
      description: extractDescription(html)
    };
    
    return product;
  } catch (error) {
    console.error('Error parsing Amazon HTML:', error);
    return null;
  }
}

/**
 * Extracts ASIN from Amazon URL
 * @param {string} url - The Amazon URL
 * @returns {string} - The ASIN
 */
function extractAsin(url) {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : '';
}

/**
 * Extracts data from HTML using regex
 * @param {string} html - The HTML content
 * @param {RegExp} regex - The regex pattern
 * @returns {string} - The extracted data
 */
function extractFromHtml(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Extracts price from HTML
 * @param {string} html - The HTML content
 * @returns {number} - The price
 */
function extractPrice(html) {
  // Try different price selectors
  const pricePatterns = [
    /<span class="a-offscreen">([^<]+)<\/span>/,
    /<span id="priceblock_ourprice"[^>]*>([^<]+)<\/span>/,
    /<span id="priceblock_dealprice"[^>]*>([^<]+)<\/span>/
  ];
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      // Extract numbers from the price string
      const priceStr = match[1].replace(/[^\d.,]/g, '');
      return parseFloat(priceStr.replace(',', '.'));
    }
  }
  
  return 0;
}

/**
 * Extracts rating from HTML
 * @param {string} html - The HTML content
 * @returns {number} - The rating
 */
function extractRating(html) {
  const ratingMatch = html.match(/([0-9.]+) out of 5 stars/);
  return ratingMatch ? parseFloat(ratingMatch[1]) : 0;
}

/**
 * Extracts review count from HTML
 * @param {string} html - The HTML content
 * @returns {number} - The review count
 */
function extractReviewCount(html) {
  const reviewMatch = html.match(/([0-9,]+) ratings/);
  return reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : 0;
}

/**
 * Extracts images from HTML
 * @param {string} html - The HTML content
 * @returns {Array<string>} - Array of image URLs
 */
function extractImages(html) {
  const images = [];
  
  // Try to find the image gallery data
  const imageDataMatch = html.match(/"large":"(https:\/\/[^"]+)"/g);
  
  if (imageDataMatch) {
    imageDataMatch.forEach(match => {
      const url = match.match(/"large":"(https:\/\/[^"]+)"/)[1];
      images.push(url);
    });
  }
  
  // If no images found, try to find the main image
  if (images.length === 0) {
    const mainImageMatch = html.match(/<img id="landingImage"[^>]*src="([^"]+)"/);
    if (mainImageMatch) {
      images.push(mainImageMatch[1]);
    }
  }
  
  return images;
}

/**
 * Extracts bullet points from HTML
 * @param {string} html - The HTML content
 * @returns {Array<string>} - Array of bullet points
 */
function extractBulletPoints(html) {
  const bulletPoints = [];
  
  // Find the feature bullets section
  const featureSection = html.match(/<div id="feature-bullets"[^>]*>[\s\S]*?<\/div>/);
  
  if (featureSection) {
    // Extract each bullet point
    const bulletMatches = featureSection[0].match(/<span class="a-list-item">([^<]+)<\/span>/g);
    
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const text = match.match(/<span class="a-list-item">([^<]+)<\/span>/)[1].trim();
        if (text) {
          bulletPoints.push(text);
        }
      });
    }
  }
  
  return bulletPoints;
}

/**
 * Extracts description from HTML
 * @param {string} html - The HTML content
 * @returns {string} - The description
 */
function extractDescription(html) {
  // Try different description selectors
  const descriptionPatterns = [
    /<div id="productDescription"[^>]*>[\s\S]*?<p>([^<]+)<\/p>/,
    /<div id="description"[^>]*>[\s\S]*?<p>([^<]+)<\/p>/
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return '';
}

/**
 * Extracts product URLs from a search results page
 * @param {Object} searchData - The parsed search results
 * @returns {Array<string>} - Array of product URLs
 */
function extractProductUrlsFromSearch(searchData) {
  try {
    const html = searchData.results[0].content.html;
    const productUrls = [];
    
    // Extract product URLs from search results
    const productMatches = html.match(/\/dp\/[A-Z0-9]{10}[^"]+/g);
    
    if (productMatches) {
      const domain = searchData.results[0].content.url.includes('amazon.co.uk') 
        ? 'https://www.amazon.co.uk' 
        : 'https://www.amazon.com';
      
      // Create unique set of product URLs
      const uniqueUrls = [...new Set(productMatches)].map(path => {
        // Clean up the URL path
        const cleanPath = path.split('ref=')[0];
        return `${domain}${cleanPath}`;
      });
      
      productUrls.push(...uniqueUrls);
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
    
    // Check if this is a "Page Not Found" or similar error page
    if (product.title && (
        product.title.includes('Page Not Found') || 
        product.title.includes('Error') || 
        product.title.includes('not available') ||
        product.title.includes('not exist')
    )) {
      console.error('Product page appears to be an error page:', product.title);
      return null;
    }
    
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
    
    if (!title) {
      console.error('No title found for product');
      return null;
    }
    
    // If brand is still empty, try to extract it from the title
    if (!brand) {
      // Common dash cam brands
      const dashCamBrands = ['Nextbase', 'Garmin', 'REDTIGER', 'ROVE', 'Thinkware', 'BlackVue', 
                            'Vantrue', 'APEMAN', 'AUKEY', 'CHORTAU', '70mai', 'Kingslim', 'Crosstour', 
                            'REXING', 'Anker', 'Pioneer', 'VIOFO', 'YI', 'Cobra', 'DDPai', 'GMAIPOP',
                            'ARIFAYZ'];
      
      for (const knownBrand of dashCamBrands) {
        if (title.includes(knownBrand)) {
          brand = knownBrand;
          break;
        }
      }
      
      // If still no brand, use the first word of the title
      if (!brand) {
        const titleParts = title.split(' ');
        if (titleParts.length > 0) {
          brand = titleParts[0];
        }
      }
    }
    
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
    
    // If model is still empty, use a portion of the title
    if (!model && title) {
      model = title.substring(0, Math.min(50, title.length));
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
    } else if (product.price_buybox) {
      price = parseFloat(product.price_buybox);
    }

    // Extract image URL
    let imageUrl = '';
    
    // Try different paths for image
    if (product.main_image && typeof product.main_image === 'string') {
      imageUrl = product.main_image;
    } else if (product.images && product.images.length > 0) {
      if (typeof product.images[0] === 'string') {
        imageUrl = product.images[0];
      } else if (product.images[0].url) {
        imageUrl = product.images[0].url;
      } else if (product.images[0].link) {
        imageUrl = product.images[0].link;
      }
    } else if (product.image && typeof product.image === 'string') {
      imageUrl = product.image;
    } else if (product.image_url) {
      imageUrl = product.image_url;
    } else if (product.image_urls && product.image_urls.length > 0) {
      imageUrl = product.image_urls[0];
    } else if (product.primary_image) {
      imageUrl = product.primary_image;
    }
    
    // If no image URL was found, use a placeholder
    if (!imageUrl) {
      imageUrl = 'https://via.placeholder.com/300x300?text=No+Image+Available';
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

    // Extract structured specifications if available
    let structuredSpecs = null;
    if (product.specifications || results.content.specifications) {
      structuredSpecs = product.specifications || results.content.specifications;
    }

    // Extract technical details if available
    let technicalDetails = null;
    if (product.technical_details || results.content.technical_details) {
      technicalDetails = product.technical_details || results.content.technical_details;
    }

    // Extract description
    let description = null;
    if (product.description || results.content.description) {
      description = product.description || results.content.description;
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
    
    // If URL is empty, use the original URL from the request
    if (!url) {
      url = results.url || '';
    }

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

    // Add structured data if available
    if (structuredSpecs) {
      formattedProduct.structuredSpecs = structuredSpecs;
    }

    // Add technical details if available
    if (technicalDetails) {
      formattedProduct.technicalDetails = technicalDetails;
    }

    // Add description if available
    if (description) {
      formattedProduct.description = description;
    }

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
  
  // Remove duplicates from the input URLs and PRODUCT_URLS
  const uniqueUrls = [...new Set([...urls, ...PRODUCT_URLS])];
  
  // Scrape each product URL with a delay between requests to avoid rate limiting
  for (const url of uniqueUrls) {
    try {
      console.log(`Scraping product data from: ${url}`);
      const marketplace = url.includes('amazon.co.uk') ? 'amazon_uk' : 'amazon_com';
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const productData = await scrapeAmazonUrl(url);
      const product = extractProductDetails(productData, marketplace);
      
      if (product) {
        // Validate the product data before adding it
        if (product.brand && product.brand !== 'Page' && 
            product.model && product.model !== 'Not Found' && 
            product.image && !product.image.includes('Error parsing')) {
          
          // Additional validation for model and brand
          if (product.model.length > 5 && product.brand.length > 1) {
            products.push(product);
            console.log(`Successfully scraped product: ${product.brand} ${product.model}`);
          } else {
            console.error(`Invalid product data (short brand/model) for URL ${url}:`, JSON.stringify(product));
          }
        } else {
          console.error(`Invalid product data for URL ${url}:`, JSON.stringify(product));
        }
      }
    } catch (error) {
      console.error(`Error scraping product data from ${url}:`, error);
    }
  }
  
  // If no valid products were scraped, throw an error
  if (products.length === 0) {
    console.error('No valid products were scraped. Check the product URLs and API credentials.');
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

export {
  scrapeDashCamProducts,
  scrapeProductUrls,
  PRODUCT_URLS
};
