/**
 * DashCamFinder - Product Processor
 * Processes raw product data to extract structured specifications
 */

/**
 * Process raw product data to extract structured specifications
 * @param {Object} rawProduct - Raw product data from API
 * @returns {Object} - Enhanced product with structured specifications
 */
function processProductData(rawProduct) {
  // Create a copy of the raw product
  const processedProduct = { ...rawProduct };
  
  // Initialize structured specifications
  processedProduct.specs = {
    video: {},
    physical: {},
    connectivity: {},
    features: {},
    storage: {},
    additional: {}
  };
  
  // Extract specifications from model string
  const modelString = rawProduct.model || '';
  
  // Extract video specifications
  processedProduct.specs.video = extractVideoSpecs(modelString, rawProduct);
  
  // Extract physical specifications
  processedProduct.specs.physical = extractPhysicalSpecs(modelString);
  
  // Extract connectivity specifications
  processedProduct.specs.connectivity = extractConnectivitySpecs(modelString);
  
  // Extract special features
  processedProduct.specs.features = extractFeatures(modelString, rawProduct.features);
  
  // Extract storage information
  processedProduct.specs.storage = extractStorageSpecs(modelString);
  
  // Extract additional information
  processedProduct.specs.additional = extractAdditionalInfo(modelString);
  
  // Create a clean model name (without all the specifications)
  processedProduct.cleanModelName = extractCleanModelName(rawProduct.brand, modelString);
  
  return processedProduct;
}

/**
 * Extract video specifications from model string
 * @param {string} modelString - The product model string
 * @param {Object} rawProduct - The raw product data
 * @returns {Object} - Video specifications
 */
function extractVideoSpecs(modelString, rawProduct) {
  const videoSpecs = {};
  
  // Resolution (use the existing resolution field if available)
  videoSpecs.resolution = rawProduct.resolution || extractResolution(modelString);
  
  // Frame rate
  const fpsMatch = modelString.match(/(\d+)fps|(\d+)FPS|(\d+)\s*frames?\s*per\s*second/i);
  if (fpsMatch) {
    const fps = fpsMatch[1] || fpsMatch[2] || fpsMatch[3];
    videoSpecs.fps = parseInt(fps, 10);
  }
  
  // HDR support
  videoSpecs.hdr = /HDR|High\s*Dynamic\s*Range/i.test(modelString);
  
  // Night vision
  videoSpecs.nightVision = /night\s*vision|starvis|starlight|low\s*light/i.test(modelString);
  
  // WDR (Wide Dynamic Range)
  videoSpecs.wdr = /WDR|Wide\s*Dynamic\s*Range/i.test(modelString);
  
  return videoSpecs;
}

/**
 * Extract resolution from model string if not already provided
 * @param {string} modelString - The product model string
 * @returns {string|null} - Extracted resolution or null if not found
 */
function extractResolution(modelString) {
  // Common resolutions
  const resolutionPatterns = [
    { pattern: /4K|2160p|3840\s*x\s*2160/i, value: '4K' },
    { pattern: /2.5K|1440p|2560\s*x\s*1440/i, value: '1440p' },
    { pattern: /1080p|1920\s*x\s*1080|Full\s*HD|FHD/i, value: '1080p' },
    { pattern: /720p|1280\s*x\s*720|HD/i, value: '720p' }
  ];
  
  for (const { pattern, value } of resolutionPatterns) {
    if (pattern.test(modelString)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Extract physical specifications from model string
 * @param {string} modelString - The product model string
 * @returns {Object} - Physical specifications
 */
function extractPhysicalSpecs(modelString) {
  const physicalSpecs = {};
  
  // Field of view (FOV)
  const fovMatch = modelString.match(/(\d+)[\s-]*degree(?:s)?(?:\s*FOV)?|FOV[\s:]*(\d+)[\s-]*degree(?:s)?/i);
  if (fovMatch) {
    const fov = fovMatch[1] || fovMatch[2];
    physicalSpecs.fov = parseInt(fov, 10);
  }
  
  // Screen size
  const screenMatch = modelString.match(/(\d+(?:\.\d+)?)["\s-]*inch(?:es)?(?:\s*screen|\s*display)?|(?:screen|display)[\s:]*(\d+(?:\.\d+)?)["\s-]*inch(?:es)?/i);
  if (screenMatch) {
    const screenSize = screenMatch[1] || screenMatch[2];
    physicalSpecs.screenSize = parseFloat(screenSize);
  }
  
  // Screen type
  if (/IPS\s*screen|IPS\s*display/i.test(modelString)) {
    physicalSpecs.screenType = 'IPS';
  } else if (/LCD\s*screen|LCD\s*display/i.test(modelString)) {
    physicalSpecs.screenType = 'LCD';
  } else if (/OLED\s*screen|OLED\s*display/i.test(modelString)) {
    physicalSpecs.screenType = 'OLED';
  }
  
  // Channels (front/rear)
  if (/dual\s*camera|front\s*and\s*rear|2\s*channel|2ch/i.test(modelString)) {
    physicalSpecs.channels = 2;
  } else if (/3\s*channel|3ch/i.test(modelString)) {
    physicalSpecs.channels = 3;
  } else {
    physicalSpecs.channels = 1; // Default to single channel
  }
  
  // Size descriptors
  if (/compact|mini|small/i.test(modelString)) {
    physicalSpecs.sizeDescription = 'Compact';
  } else if (/discreet/i.test(modelString)) {
    physicalSpecs.sizeDescription = 'Discreet';
  }
  
  return physicalSpecs;
}

/**
 * Extract connectivity specifications from model string
 * @param {string} modelString - The product model string
 * @returns {Object} - Connectivity specifications
 */
function extractConnectivitySpecs(modelString) {
  const connectivitySpecs = {};
  
  // WiFi
  if (/WiFi|Wi-Fi|Wireless/i.test(modelString)) {
    connectivitySpecs.wifi = true;
    
    // WiFi frequency
    if (/5GHz|5\s*GHz|5G\s*WiFi/i.test(modelString)) {
      connectivitySpecs.wifiFrequency = '5GHz';
    } else if (/2\.4GHz|2\.4\s*GHz|2\.4G\s*WiFi/i.test(modelString)) {
      connectivitySpecs.wifiFrequency = '2.4GHz';
    }
  }
  
  // Bluetooth
  connectivitySpecs.bluetooth = /Bluetooth|BT\d/i.test(modelString);
  
  // GPS
  connectivitySpecs.gps = /GPS|Global\s*Positioning/i.test(modelString);
  
  // Voice control
  connectivitySpecs.voiceControl = /voice\s*control|voice\s*command|voice\s*activated/i.test(modelString);
  
  return connectivitySpecs;
}

/**
 * Extract special features from model string and features array
 * @param {string} modelString - The product model string
 * @param {Array} featuresArray - The product features array
 * @returns {Object} - Special features
 */
function extractFeatures(modelString, featuresArray) {
  const features = {};
  const combinedText = modelString + ' ' + (Array.isArray(featuresArray) ? featuresArray.join(' ') : '');
  
  // Parking mode
  features.parkingMode = /parking\s*mode|parking\s*monitor/i.test(combinedText);
  
  // Motion detection
  features.motionDetection = /motion\s*detect|motion\s*sensor/i.test(combinedText);
  
  // Loop recording
  features.loopRecording = /loop\s*recording|loop\s*record|seamless\s*recording/i.test(combinedText);
  
  // Emergency recording
  features.emergencyRecording = /emergency\s*recording|emergency\s*record|g-sensor|collision\s*detection/i.test(combinedText);
  
  // Time-lapse
  features.timeLapse = /time\s*lapse|timelapse/i.test(combinedText);
  
  // Monitor while away
  features.remoteMonitoring = /monitor\s*your\s*vehicle\s*while\s*away|remote\s*monitoring|remote\s*view/i.test(combinedText);
  
  return features;
}

/**
 * Extract storage specifications from model string
 * @param {string} modelString - The product model string
 * @returns {Object} - Storage specifications
 */
function extractStorageSpecs(modelString) {
  const storageSpecs = {};
  
  // Included memory card
  const includedStorageMatch = modelString.match(/includes?\s*(\d+)GB\s*(?:memory\s*card|SD\s*card)|(\d+)GB\s*(?:memory\s*card|SD\s*card)\s*included/i);
  if (includedStorageMatch) {
    const storage = includedStorageMatch[1] || includedStorageMatch[2];
    storageSpecs.includedStorage = parseInt(storage, 10);
  }
  
  // Maximum supported storage
  const maxStorageMatch = modelString.match(/support(?:s)?\s*(?:up\s*to)?\s*(\d+)GB|max(?:imum)?\s*(\d+)GB/i);
  if (maxStorageMatch) {
    const storage = maxStorageMatch[1] || maxStorageMatch[2];
    storageSpecs.maxStorage = parseInt(storage, 10);
  }
  
  // Memory card included (boolean)
  storageSpecs.memoryCardIncluded = /includes?\s*(?:memory\s*card|SD\s*card)|(?:memory\s*card|SD\s*card)\s*included/i.test(modelString);
  
  return storageSpecs;
}

/**
 * Extract additional information from model string
 * @param {string} modelString - The product model string
 * @returns {Object} - Additional information
 */
function extractAdditionalInfo(modelString) {
  const additionalInfo = {};
  
  // Model number (often at the end with a specific format)
  const modelNumberMatch = modelString.match(/(?:[-\s])(\d+[-\d]+(?:[-\w]+)?)\s*$/);
  if (modelNumberMatch) {
    additionalInfo.modelNumber = modelNumberMatch[1];
  }
  
  // Extract any other relevant information
  // This could be expanded based on specific patterns in your data
  
  return additionalInfo;
}

/**
 * Extract a clean model name without all the specifications
 * @param {string} brand - The product brand
 * @param {string} modelString - The product model string
 * @returns {string} - Clean model name
 */
function extractCleanModelName(brand, modelString) {
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

// Export functions for use in other modules
export {
  processProductData,
  processProductsArray
};
