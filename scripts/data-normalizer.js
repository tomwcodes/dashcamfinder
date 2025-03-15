/**
 * DashCamFinder - Data Normalizer
 * Standardizes extracted specification values to ensure consistency
 */

/**
 * Normalize all specifications in a product
 * @param {Object} product - Product with extracted specifications
 * @returns {Object} - Product with normalized specifications
 */
function normalizeProductSpecs(product) {
  if (!product || !product.specs) {
    return product;
  }

  const normalizedProduct = { ...product };

  // Normalize video specifications
  if (normalizedProduct.specs.video) {
    normalizedProduct.specs.video = {
      ...normalizedProduct.specs.video,
      resolution: normalizeResolution(getSpecValue(normalizedProduct.specs.video.resolution)),
      fps: normalizeFrameRate(getSpecValue(normalizedProduct.specs.video.fps)),
      hdr: normalizeBoolean(getSpecValue(normalizedProduct.specs.video.hdr)),
      nightVision: normalizeBoolean(getSpecValue(normalizedProduct.specs.video.nightVision)),
      wdr: normalizeBoolean(getSpecValue(normalizedProduct.specs.video.wdr))
    };
  }

  // Normalize physical specifications
  if (normalizedProduct.specs.physical) {
    normalizedProduct.specs.physical = {
      ...normalizedProduct.specs.physical,
      fov: normalizeAngle(getSpecValue(normalizedProduct.specs.physical.fov)),
      screenSize: normalizeScreenSize(getSpecValue(normalizedProduct.specs.physical.screenSize)),
      screenType: normalizeScreenType(getSpecValue(normalizedProduct.specs.physical.screenType)),
      channels: normalizeChannels(getSpecValue(normalizedProduct.specs.physical.channels))
    };
  }

  // Normalize connectivity specifications
  if (normalizedProduct.specs.connectivity) {
    normalizedProduct.specs.connectivity = {
      ...normalizedProduct.specs.connectivity,
      wifi: normalizeBoolean(getSpecValue(normalizedProduct.specs.connectivity.wifi)),
      wifiFrequency: normalizeWifiFrequency(getSpecValue(normalizedProduct.specs.connectivity.wifiFrequency)),
      bluetooth: normalizeBoolean(getSpecValue(normalizedProduct.specs.connectivity.bluetooth)),
      gps: normalizeBoolean(getSpecValue(normalizedProduct.specs.connectivity.gps)),
      voiceControl: normalizeBoolean(getSpecValue(normalizedProduct.specs.connectivity.voiceControl))
    };
  }

  // Normalize feature specifications
  if (normalizedProduct.specs.features) {
    normalizedProduct.specs.features = {
      ...normalizedProduct.specs.features,
      parkingMode: normalizeBoolean(getSpecValue(normalizedProduct.specs.features.parkingMode)),
      motionDetection: normalizeBoolean(getSpecValue(normalizedProduct.specs.features.motionDetection)),
      loopRecording: normalizeBoolean(getSpecValue(normalizedProduct.specs.features.loopRecording)),
      emergencyRecording: normalizeBoolean(getSpecValue(normalizedProduct.specs.features.emergencyRecording)),
      timeLapse: normalizeBoolean(getSpecValue(normalizedProduct.specs.features.timeLapse))
    };
  }

  // Normalize storage specifications
  if (normalizedProduct.specs.storage) {
    normalizedProduct.specs.storage = {
      ...normalizedProduct.specs.storage,
      includedStorage: normalizeStorage(getSpecValue(normalizedProduct.specs.storage.includedStorage)),
      maxStorage: normalizeStorage(getSpecValue(normalizedProduct.specs.storage.maxStorage)),
      memoryCardIncluded: normalizeBoolean(getSpecValue(normalizedProduct.specs.storage.memoryCardIncluded))
    };
  }

  // Normalize additional specifications
  if (normalizedProduct.specs.additional) {
    normalizedProduct.specs.additional = {
      ...normalizedProduct.specs.additional,
      modelNumber: normalizeModelNumber(getSpecValue(normalizedProduct.specs.additional.modelNumber)),
      powerOptions: normalizePowerOptions(getSpecValue(normalizedProduct.specs.additional.powerOptions))
    };
  }

  return normalizedProduct;
}

/**
 * Get the value from a specification object
 * @param {Object|null} spec - Specification object with value and confidence
 * @returns {*} - The value or null if not available
 */
function getSpecValue(spec) {
  if (!spec || spec === null) {
    return null;
  }
  return spec.value;
}

/**
 * Normalize resolution value
 * @param {string|null} value - Raw resolution value
 * @returns {string|null} - Normalized resolution value
 */
function normalizeResolution(value) {
  if (value === null) {
    return null;
  }

  const resolutionMap = {
    '4k': '4K',
    '2160p': '4K',
    '2.7k': '1440p',
    '2.5k': '1440p',
    '2k': '1440p',
    '1440p': '1440p',
    '1080p': '1080p',
    'full hd': '1080p',
    'fhd': '1080p',
    'hd': '720p',
    '720p': '720p',
    'sd': 'SD'
  };

  const normalized = value.toString().toLowerCase().trim();
  return resolutionMap[normalized] || value;
}

/**
 * Normalize frame rate value
 * @param {number|string|null} value - Raw frame rate value
 * @returns {number|null} - Normalized frame rate value
 */
function normalizeFrameRate(value) {
  if (value === null) {
    return null;
  }

  // Convert to number
  const fps = parseInt(value, 10);
  
  // Common frame rates
  const commonFps = [24, 25, 30, 50, 60, 120];
  
  // If it's already a common frame rate, return it
  if (commonFps.includes(fps)) {
    return fps;
  }
  
  // If it's close to a common frame rate, normalize it
  for (const common of commonFps) {
    if (Math.abs(fps - common) <= 2) {
      return common;
    }
  }
  
  // Otherwise, return the original value
  return fps;
}

/**
 * Normalize boolean value
 * @param {boolean|string|number|null} value - Raw boolean value
 * @returns {boolean} - Normalized boolean value
 */
function normalizeBoolean(value) {
  if (value === null) {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || 
           normalized === 'yes' || 
           normalized === 'y' || 
           normalized === '1' ||
           normalized === 'on' ||
           normalized === 'enabled';
  }

  return Boolean(value);
}

/**
 * Normalize angle value
 * @param {number|string|null} value - Raw angle value
 * @returns {number|null} - Normalized angle value
 */
function normalizeAngle(value) {
  if (value === null) {
    return null;
  }

  // Extract number if it's a string with units
  if (typeof value === 'string') {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      value = parseFloat(match[1]);
    } else {
      return null;
    }
  }

  // Convert to number
  const angle = parseFloat(value);
  
  // Common FOV angles for dash cams
  const commonAngles = [120, 130, 140, 150, 160, 170, 180];
  
  // If it's already a common angle, return it
  if (commonAngles.includes(angle)) {
    return angle;
  }
  
  // If it's close to a common angle, normalize it
  for (const common of commonAngles) {
    if (Math.abs(angle - common) <= 2) {
      return common;
    }
  }
  
  // Otherwise, return the original value
  return angle;
}

/**
 * Normalize screen size value
 * @param {number|string|null} value - Raw screen size value
 * @returns {number|null} - Normalized screen size value
 */
function normalizeScreenSize(value) {
  if (value === null) {
    return null;
  }

  // Extract number if it's a string with units
  if (typeof value === 'string') {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      value = parseFloat(match[1]);
    } else {
      return null;
    }
  }

  // Convert to number with 1 decimal place
  return parseFloat(parseFloat(value).toFixed(1));
}

/**
 * Normalize screen type value
 * @param {string|null} value - Raw screen type value
 * @returns {string|null} - Normalized screen type value
 */
function normalizeScreenType(value) {
  if (value === null) {
    return null;
  }

  const screenTypeMap = {
    'ips': 'IPS',
    'lcd': 'LCD',
    'oled': 'OLED',
    'amoled': 'AMOLED',
    'tft': 'TFT'
  };

  const normalized = value.toString().toLowerCase().trim();
  return screenTypeMap[normalized] || value;
}

/**
 * Normalize channels value
 * @param {number|string|null} value - Raw channels value
 * @returns {number|null} - Normalized channels value
 */
function normalizeChannels(value) {
  if (value === null) {
    return null;
  }

  // Convert to number
  const channels = parseInt(value, 10);
  
  // Validate range (1-3 channels is typical for dash cams)
  if (channels >= 1 && channels <= 3) {
    return channels;
  }
  
  // Default to 1 if out of range
  return 1;
}

/**
 * Normalize WiFi frequency value
 * @param {string|null} value - Raw WiFi frequency value
 * @returns {string|null} - Normalized WiFi frequency value
 */
function normalizeWifiFrequency(value) {
  if (value === null) {
    return null;
  }

  const frequencyMap = {
    '2.4': '2.4GHz',
    '2.4ghz': '2.4GHz',
    '2.4 ghz': '2.4GHz',
    '2.4g': '2.4GHz',
    '5': '5GHz',
    '5ghz': '5GHz',
    '5 ghz': '5GHz',
    '5g': '5GHz',
    'dual': 'Dual-band',
    'dual band': 'Dual-band',
    'dual-band': 'Dual-band',
    'both': 'Dual-band'
  };

  const normalized = value.toString().toLowerCase().trim();
  return frequencyMap[normalized] || value;
}

/**
 * Normalize storage value
 * @param {number|string|null} value - Raw storage value
 * @returns {number|null} - Normalized storage value in GB
 */
function normalizeStorage(value) {
  if (value === null) {
    return null;
  }

  // If it's already a number, return it
  if (typeof value === 'number') {
    return value;
  }

  // Extract number and unit if it's a string
  if (typeof value === 'string') {
    // Check for TB
    const tbMatch = value.match(/(\d+(?:\.\d+)?)\s*TB/i);
    if (tbMatch) {
      return parseFloat(tbMatch[1]) * 1024; // Convert TB to GB
    }

    // Check for GB
    const gbMatch = value.match(/(\d+(?:\.\d+)?)\s*GB/i);
    if (gbMatch) {
      return parseFloat(gbMatch[1]);
    }

    // Check for MB
    const mbMatch = value.match(/(\d+(?:\.\d+)?)\s*MB/i);
    if (mbMatch) {
      return parseFloat(mbMatch[1]) / 1024; // Convert MB to GB
    }

    // Try to extract just a number
    const numMatch = value.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      const num = parseFloat(numMatch[1]);
      // Assume it's GB if it's a reasonable size for a memory card
      if (num >= 1 && num <= 1024) {
        return num;
      }
    }
  }

  return null;
}

/**
 * Normalize model number value
 * @param {string|null} value - Raw model number value
 * @returns {string|null} - Normalized model number value
 */
function normalizeModelNumber(value) {
  if (value === null) {
    return null;
  }

  // Convert to string and trim
  return value.toString().trim();
}

/**
 * Normalize power options value
 * @param {string|null} value - Raw power options value
 * @returns {string|null} - Normalized power options value
 */
function normalizePowerOptions(value) {
  if (value === null) {
    return null;
  }

  const powerOptionsMap = {
    'hardwire': 'Hardwire',
    'hardwiring': 'Hardwire',
    'direct wire': 'Hardwire',
    'car charger': 'Car Charger',
    'cigarette lighter': 'Car Charger',
    '12v': 'Car Charger',
    'battery': 'Battery',
    'rechargeable': 'Battery',
    'capacitor': 'Capacitor',
    'supercapacitor': 'Capacitor',
    'super capacitor': 'Capacitor'
  };

  const normalized = value.toString().toLowerCase().trim();
  return powerOptionsMap[normalized] || value;
}

// Export functions for use in other modules
export {
  normalizeProductSpecs,
  normalizeResolution,
  normalizeFrameRate,
  normalizeBoolean,
  normalizeAngle,
  normalizeScreenSize,
  normalizeScreenType,
  normalizeChannels,
  normalizeWifiFrequency,
  normalizeStorage,
  normalizeModelNumber,
  normalizePowerOptions
};
