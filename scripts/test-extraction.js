#!/usr/bin/env node
/**
 * Test Extraction Script
 * This script tests the enhanced specification extraction system
 * with a sample product to verify the results.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processProductData } from './product-processor.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample product data
const sampleProduct = {
  id: 1234,
  brand: "REDTIGER",
  model: "REDTIGER F7NP Front Rear, 4K/2.5K Full HD Dash Camera for Cars, Included 32GB Card, Built-in Wi-Fi GPS, 3.16\" IPS Screen, Night Vision, 170°Wide Angle, WDR, 24H Parking Mode",
  image: "https://m.media-amazon.com/images/I/41IK3vBCYyL._AC_.jpg",
  price: {
    amazon_com: 119.99
  },
  rating: 4.4,
  reviewCount: 14124,
  resolution: "4K",
  features: [
    "4K+1080P DUAL RECORDING- REDTIGER brings to you F7NP dual dash cam which records video of up to Ultra HD 4K(3840*2160P)+FHD 1080P resolutions. It helps you to read the key details like road signs and vehicle license plates.To reduce the blind areas it has the front wide angle of 170 degree and rear wide angle of 140 degree. This helps you during unexpected circumstances like collision to retain and present evidence.",
    "SUPERIOR NIGHT VISION- REDTIGER driving recorder adopts an excellent optical lens with an ultra-large F1.5 aperture and 6 layer glass, and is equipped with HDR/WDR technology to capture important details clearly under low light conditions.",
    "WiFi/SMART APP CONTROL- You just need to connect the dash cam to your smartphone APP via WiFi and then you can use the \"Redtiger\" app to view, playback, and manage the dash cam on your IOS or Android devices. You can also download and edit videos in the app. By just one-click you can share your travel experiences and wonderful moments with your friends and family.",
    "DASH CAM WITH GPS- REDTIGER dash cam has a built-in GPS and records the driving route, real-time speed, precise location data.You can track on google maps via WiFi using the App or with our Windows and Mac GPSPlayer, which will provide further additional evidence if an accident occurs.",
    "RELIABLE FEATURES FOR ACCIDENT RECORDING- Even when the card is full the REDTIGER dash cam will continue recording with its Loop Recording feature. As soon as the G sensor detects a sudden collision, it locks and saves the collision video. It also has a 24-hour parking monitor available on the dash cam to record continuously for 24 hours with time-lapse recording at parking mode. Please note that a hardware kit is needed.",
    "SUPER AFTERSALES-Our greatest pursuit is to satisfy the needs of consumers. REDTIGER dash cam is backed by full 18-MONTH Assurance and 100% Satisfaction Guarantee.Email our customer service and we will assist you with any questions or concerns. We also offer 7*24 hours technical support."
  ],
  releaseDate: "2024-03-15",
  popularity: 94,
  amazonUrl: {
    com: "https://www.amazon.com/REDTIGER-Camera-Included-170%C2%B0Wide-Parking/dp/B098WVKF19"
  }
};

/**
 * Test the specification extraction system
 */
function testExtraction() {
  console.log('Testing specification extraction system...');
  console.log('Sample product:', sampleProduct.brand, sampleProduct.model);
  
  // Process the sample product
  const processedProduct = processProductData(sampleProduct);
  
  // Display the extracted specifications
  console.log('\nExtracted Specifications:');
  
  // Video specifications
  console.log('\nVideo Specifications:');
  if (processedProduct.specs.video) {
    for (const [key, value] of Object.entries(processedProduct.specs.video)) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  // Physical specifications
  console.log('\nPhysical Specifications:');
  if (processedProduct.specs.physical) {
    for (const [key, value] of Object.entries(processedProduct.specs.physical)) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  // Connectivity specifications
  console.log('\nConnectivity Specifications:');
  if (processedProduct.specs.connectivity) {
    for (const [key, value] of Object.entries(processedProduct.specs.connectivity)) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  // Feature specifications
  console.log('\nFeature Specifications:');
  if (processedProduct.specs.features) {
    for (const [key, value] of Object.entries(processedProduct.specs.features)) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  // Storage specifications
  console.log('\nStorage Specifications:');
  if (processedProduct.specs.storage) {
    for (const [key, value] of Object.entries(processedProduct.specs.storage)) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  // Additional specifications
  console.log('\nAdditional Specifications:');
  if (processedProduct.specs.additional) {
    for (const [key, value] of Object.entries(processedProduct.specs.additional)) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  // Extraction metadata
  console.log('\nExtraction Metadata:');
  if (processedProduct.extractionMetadata) {
    console.log(`  Processing Timestamp: ${processedProduct.extractionMetadata.processingTimestamp}`);
    
    console.log('\n  Sources Used:');
    for (const category in processedProduct.extractionMetadata.sourcesUsed) {
      console.log(`    ${category}:`);
      for (const spec in processedProduct.extractionMetadata.sourcesUsed[category]) {
        const source = processedProduct.extractionMetadata.sourcesUsed[category][spec];
        console.log(`      ${spec}: source=${source.source}, confidence=${source.confidence.toFixed(2)}, pattern=${source.pattern}`);
      }
    }
  }
  
  // Save the processed product to a file for inspection
  const outputFile = path.join(__dirname, '..', 'data', 'test-extraction-result.json');
  fs.writeFileSync(outputFile, JSON.stringify(processedProduct, null, 2));
  console.log(`\nSaved processed product to ${outputFile}`);
}

// Run the test
testExtraction();
