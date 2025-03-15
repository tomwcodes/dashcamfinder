/**
 * DashCamFinder - Specification Extractor
 * Extracts structured specifications from various sources in product data
 */

/**
 * Extract specifications from product data
 * @param {Object} product - Raw product data
 * @returns {Object} - Structured specifications
 */
export function extractSpecifications(product) {
  // Initialize structured specifications
  const specs = {
    video: {},
    physical: {},
    connectivity: {},
    features: {},
    storage: {},
    additional: {}
  };
  
  // Extract specifications from different sources
  const sources = [
    { name: 'model', data: product.model || '', priority: 2 },
    { name: 'features', data: Array.isArray(product.features) ? product.features.join(' ') : '', priority: 1 },
    { name: 'structuredSpecs', data: product.structuredSpecs || {}, priority: 3 },
    { name: 'description', data: product.description || '', priority: 0 },
    { name: 'technicalDetails', data: product.technicalDetails || {}, priority: 3 }
  ];
  
  // Extract video specifications
  specs.video = {
    resolution: extractResolution(sources),
    fps: extractFrameRate(sources),
    hdr: extractBoolean(sources, 'hdr', /\bHDR\b|High\s*Dynamic\s*Range/i),
    nightVision: extractBoolean(sources, 'nightVision', /night\s*vision|starvis|starlight|low\s*light/i),
    wdr: extractBoolean(sources, 'wdr', /\bWDR\b|Wide\s*Dynamic\s*Range/i)
  };
  
  // Extract physical specifications
  specs.physical = {
    fov: extractFOV(sources),
    screenSize: extractScreenSize(sources),
    screenType: extractScreenType(sources),
    channels: extractChannels(sources),
    sizeDescription: extractSizeDescription(sources)
  };
  
  // Extract connectivity specifications
  specs.connectivity = {
    wifi: extractBoolean(sources, 'wifi', /WiFi|Wi-Fi|Wireless|connect\s*to\s*smartphone/i),
    wifiFrequency: extractWifiFrequency(sources),
    bluetooth: extractBoolean(sources, 'bluetooth', /Bluetooth|BT\d/i),
    gps: extractBoolean(sources, 'gps', /GPS|Global\s*Positioning/i),
    voiceControl: extractBoolean(sources, 'voiceControl', /voice\s*control|voice\s*command|voice\s*activated/i)
  };
  
  // Extract feature specifications
  specs.features = {
    parkingMode: extractBoolean(sources, 'parkingMode', /parking\s*mode|parking\s*monitor/i),
    motionDetection: extractBoolean(sources, 'motionDetection', /motion\s*detect|motion\s*sensor/i),
    loopRecording: extractBoolean(sources, 'loopRecording', /loop\s*recording|loop\s*record|seamless\s*recording/i),
    emergencyRecording: extractBoolean(sources, 'emergencyRecording', /emergency\s*recording|emergency\s*record|g-sensor|collision\s*detection/i),
    timeLapse: extractBoolean(sources, 'timeLapse', /time\s*lapse|timelapse/i),
    remoteMonitoring: extractBoolean(sources, 'remoteMonitoring', /monitor\s*your\s*vehicle\s*while\s*away|remote\s*monitoring|remote\s*view/i)
  };
  
  // Extract storage specifications
  specs.storage = {
    includedStorage: extractIncludedStorage(sources),
    maxStorage: extractMaxStorage(sources),
    memoryCardIncluded: extractBoolean(sources, 'memoryCardIncluded', /includes?\s*(?:memory\s*card|SD\s*card)|(?:memory\s*card|SD\s*card)\s*included/i)
  };
  
  // Extract additional specifications
  specs.additional = {
    modelNumber: extractModelNumber(sources),
    operatingTemperature: extractOperatingTemperature(sources),
    powerSource: extractPowerSource(sources)
  };
  
  return specs;
}

/**
 * Extract resolution from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Resolution specification
 */
function extractResolution(sources) {
  // Common resolutions
  const resolutionPatterns = [
    { pattern: /4K|2160p|3840\s*x\s*2160/i, value: '4K', confidence: 0.9 },
    { pattern: /2.5K|1440p|2560\s*x\s*1440/i, value: '1440p', confidence: 0.9 },
    { pattern: /1080p|1920\s*x\s*1080|Full\s*HD|FHD/i, value: '1080p', confidence: 0.9 },
    { pattern: /720p|1280\s*x\s*720|HD/i, value: '720p', confidence: 0.9 }
  ];
  
  // Check each source for resolution
  for (const source of sources) {
    for (const { pattern, value, confidence } of resolutionPatterns) {
      if (typeof source.data === 'string' && pattern.test(source.data)) {
        return {
          value: value,
          source: source.name,
          confidence: confidence * source.priority / 3,
          pattern: pattern.toString()
        };
      }
    }
  }
  
  // Check if resolution is already provided in the product
  if (sources[0].data && sources[0].data.resolution) {
    return {
      value: sources[0].data.resolution,
      source: 'product',
      confidence: 0.95,
      pattern: 'direct'
    };
  }
  
  // Default to 1080p if not found
  return {
    value: '1080p',
    source: 'default',
    confidence: 0.3,
    pattern: 'default'
  };
}

/**
 * Extract frame rate from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Frame rate specification
 */
function extractFrameRate(sources) {
  const fpsPatterns = [
    { pattern: /(\d+)\s*fps/i, confidence: 0.9 },
    { pattern: /(\d+)\s*frames?\s*per\s*second/i, confidence: 0.9 },
    { pattern: /(\d+)\s*hz\s*recording/i, confidence: 0.8 }
  ];
  
  // Check each source for frame rate
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, confidence } of fpsPatterns) {
        const match = source.data.match(pattern);
        if (match) {
          const fps = parseInt(match[1], 10);
          if (fps > 0 && fps <= 240) { // Reasonable range check
            return {
              value: fps,
              source: source.name,
              confidence: confidence * source.priority / 3,
              pattern: pattern.toString()
            };
          }
        }
      }
    }
  }
  
  // Default to 30fps if not found
  return {
    value: 30,
    source: 'default',
    confidence: 0.3,
    pattern: 'default'
  };
}

/**
 * Extract boolean value from sources
 * @param {Array} sources - Array of data sources
 * @param {string} name - Name of the specification
 * @param {RegExp} pattern - Pattern to match
 * @returns {Object} - Boolean specification
 */
function extractBoolean(sources, name, pattern) {
  // Check each source for the pattern
  for (const source of sources) {
    if (typeof source.data === 'string' && pattern.test(source.data)) {
      return {
        value: true,
        source: source.name,
        confidence: 0.8 * source.priority / 3,
        pattern: pattern.toString()
      };
    }
  }
  
  // Check structured specs
  const structuredSource = sources.find(s => s.name === 'structuredSpecs');
  if (structuredSource && structuredSource.data) {
    // Try to find the value in structured specs
    const specs = structuredSource.data;
    for (const key in specs) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes(name.toLowerCase())) {
        const value = specs[key];
        if (typeof value === 'boolean') {
          return {
            value: value,
            source: 'structuredSpecs',
            confidence: 0.9,
            pattern: 'structured'
          };
        } else if (typeof value === 'string') {
          const isTrue = /yes|true|supported|1/i.test(value);
          return {
            value: isTrue,
            source: 'structuredSpecs',
            confidence: 0.85,
            pattern: 'structured'
          };
        }
      }
    }
  }
  
  // Default to false if not found
  return {
    value: false,
    source: 'default',
    confidence: 0.5,
    pattern: 'default'
  };
}

/**
 * Extract field of view (FOV) from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - FOV specification
 */
function extractFOV(sources) {
  const fovPatterns = [
    { pattern: /(\d+)[\s-]*degree(?:s)?(?:\s*FOV)?/i, confidence: 0.9 },
    { pattern: /FOV[\s:]*(\d+)[\s-]*degree(?:s)?/i, confidence: 0.9 },
    { pattern: /(\d+)°(?:\s*wide)?(?:\s*angle)?/i, confidence: 0.85 },
    { pattern: /wide\s*angle[\s:]*(\d+)[\s-]*degree(?:s)?/i, confidence: 0.8 }
  ];
  
  // Check each source for FOV
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, confidence } of fovPatterns) {
        const match = source.data.match(pattern);
        if (match) {
          const fov = parseInt(match[1], 10);
          if (fov > 0 && fov <= 360) { // Reasonable range check
            return {
              value: fov,
              source: source.name,
              confidence: confidence * source.priority / 3,
              pattern: pattern.toString()
            };
          }
        }
      }
    }
  }
  
  // Default to 140 if not found (common FOV for dash cams)
  return {
    value: 140,
    source: 'default',
    confidence: 0.3,
    pattern: 'default'
  };
}

/**
 * Extract screen size from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Screen size specification
 */
function extractScreenSize(sources) {
  const screenSizePatterns = [
    { pattern: /(\d+(?:\.\d+)?)["\s-]*inch(?:es)?(?:\s*screen|\s*display)?/i, confidence: 0.9 },
    { pattern: /(?:screen|display)[\s:]*(\d+(?:\.\d+)?)["\s-]*inch(?:es)?/i, confidence: 0.9 },
    { pattern: /(\d+(?:\.\d+)?)[""](?:\s*screen|\s*display)?/i, confidence: 0.85 }
  ];
  
  // Check each source for screen size
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, confidence } of screenSizePatterns) {
        const match = source.data.match(pattern);
        if (match) {
          const screenSize = parseFloat(match[1]);
          if (screenSize > 0 && screenSize <= 15) { // Reasonable range check
            return {
              value: screenSize,
              source: source.name,
              confidence: confidence * source.priority / 3,
              pattern: pattern.toString()
            };
          }
        }
      }
    }
  }
  
  // No default for screen size
  return null;
}

/**
 * Extract screen type from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Screen type specification
 */
function extractScreenType(sources) {
  const screenTypePatterns = [
    { pattern: /IPS\s*(?:screen|display)/i, value: 'IPS', confidence: 0.9 },
    { pattern: /LCD\s*(?:screen|display)/i, value: 'LCD', confidence: 0.9 },
    { pattern: /OLED\s*(?:screen|display)/i, value: 'OLED', confidence: 0.9 },
    { pattern: /TFT\s*(?:screen|display)/i, value: 'TFT', confidence: 0.9 },
    { pattern: /LED\s*(?:screen|display)/i, value: 'LED', confidence: 0.85 }
  ];
  
  // Check each source for screen type
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, value, confidence } of screenTypePatterns) {
        if (pattern.test(source.data)) {
          return {
            value: value,
            source: source.name,
            confidence: confidence * source.priority / 3,
            pattern: pattern.toString()
          };
        }
      }
    }
  }
  
  // Default to LCD if not found
  return {
    value: 'LCD',
    source: 'default',
    confidence: 0.4,
    pattern: 'default'
  };
}

/**
 * Extract number of channels (front/rear) from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Channels specification
 */
function extractChannels(sources) {
  const channelPatterns = [
    { pattern: /dual\s*camera/i, value: 2, confidence: 0.9 },
    { pattern: /front\s*and\s*rear/i, value: 2, confidence: 0.9 },
    { pattern: /2\s*channel|2ch/i, value: 2, confidence: 0.9 },
    { pattern: /3\s*channel|3ch/i, value: 3, confidence: 0.9 },
    { pattern: /front\s*rear\s*interior/i, value: 3, confidence: 0.9 },
    { pattern: /triple\s*camera/i, value: 3, confidence: 0.9 },
    { pattern: /single\s*camera/i, value: 1, confidence: 0.9 },
    { pattern: /front\s*only/i, value: 1, confidence: 0.85 }
  ];
  
  // Check each source for channels
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, value, confidence } of channelPatterns) {
        if (pattern.test(source.data)) {
          return {
            value: value,
            source: source.name,
            confidence: confidence * source.priority / 3,
            pattern: pattern.toString()
          };
        }
      }
    }
  }
  
  // Default to 1 channel if not found
  return {
    value: 1,
    source: 'default',
    confidence: 0.5,
    pattern: 'default'
  };
}

/**
 * Extract size description from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Size description specification
 */
function extractSizeDescription(sources) {
  const sizePatterns = [
    { pattern: /compact|mini|small/i, value: 'Compact', confidence: 0.8 },
    { pattern: /discreet/i, value: 'Discreet', confidence: 0.8 },
    { pattern: /low\s*profile/i, value: 'Low Profile', confidence: 0.8 }
  ];
  
  // Check each source for size description
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, value, confidence } of sizePatterns) {
        if (pattern.test(source.data)) {
          return {
            value: value,
            source: source.name,
            confidence: confidence * source.priority / 3,
            pattern: pattern.toString()
          };
        }
      }
    }
  }
  
  // No default for size description
  return null;
}

/**
 * Extract WiFi frequency from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - WiFi frequency specification
 */
function extractWifiFrequency(sources) {
  const wifiFrequencyPatterns = [
    { pattern: /5GHz|5\s*GHz|5G\s*WiFi/i, value: '5GHz', confidence: 0.9 },
    { pattern: /2\.4GHz|2\.4\s*GHz|2\.4G\s*WiFi/i, value: '2.4GHz', confidence: 0.9 },
    { pattern: /dual\s*band\s*WiFi/i, value: 'Dual Band', confidence: 0.9 }
  ];
  
  // Check each source for WiFi frequency
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, value, confidence } of wifiFrequencyPatterns) {
        if (pattern.test(source.data)) {
          return {
            value: value,
            source: source.name,
            confidence: confidence * source.priority / 3,
            pattern: pattern.toString()
          };
        }
      }
    }
  }
  
  // No default for WiFi frequency
  return null;
}

/**
 * Extract included storage from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Included storage specification
 */
function extractIncludedStorage(sources) {
  const includedStoragePatterns = [
    { pattern: /includes?\s*(\d+)GB\s*(?:memory\s*card|SD\s*card)/i, confidence: 0.9 },
    { pattern: /(\d+)GB\s*(?:memory\s*card|SD\s*card)\s*included/i, confidence: 0.9 },
    { pattern: /comes?\s*with\s*(\d+)GB\s*(?:memory\s*card|SD\s*card)/i, confidence: 0.9 }
  ];
  
  // Check each source for included storage
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, confidence } of includedStoragePatterns) {
        const match = source.data.match(pattern);
        if (match) {
          const storage = parseInt(match[1], 10);
          if (storage > 0) { // Reasonable range check
            return {
              value: storage,
              source: source.name,
              confidence: confidence * source.priority / 3,
              pattern: pattern.toString()
            };
          }
        }
      }
    }
  }
  
  // No default for included storage
  return null;
}

/**
 * Extract maximum supported storage from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Maximum storage specification
 */
function extractMaxStorage(sources) {
  const maxStoragePatterns = [
    { pattern: /support(?:s)?\s*(?:up\s*to)?\s*(\d+)GB/i, confidence: 0.9 },
    { pattern: /max(?:imum)?\s*(\d+)GB/i, confidence: 0.9 },
    { pattern: /up\s*to\s*(\d+)GB\s*(?:memory\s*card|SD\s*card)/i, confidence: 0.9 }
  ];
  
  // Check each source for maximum storage
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, confidence } of maxStoragePatterns) {
        const match = source.data.match(pattern);
        if (match) {
          const storage = parseInt(match[1], 10);
          if (storage > 0) { // Reasonable range check
            return {
              value: storage,
              source: source.name,
              confidence: confidence * source.priority / 3,
              pattern: pattern.toString()
            };
          }
        }
      }
    }
  }
  
  // Default to 128GB if not found (common max storage for dash cams)
  return {
    value: 128,
    source: 'default',
    confidence: 0.3,
    pattern: 'default'
  };
}

/**
 * Extract model number from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Model number specification
 */
function extractModelNumber(sources) {
  // Model number often at the end with a specific format
  const modelNumberPattern = /(?:[-\s])(\d+[-\d]+(?:[-\w]+)?)\s*$/;
  
  // Check each source for model number
  for (const source of sources) {
    if (typeof source.data === 'string') {
      const match = source.data.match(modelNumberPattern);
      if (match) {
        return {
          value: match[1],
          source: source.name,
          confidence: 0.7 * source.priority / 3,
          pattern: modelNumberPattern.toString()
        };
      }
    }
  }
  
  // No default for model number
  return null;
}

/**
 * Extract operating temperature from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Operating temperature specification
 */
function extractOperatingTemperature(sources) {
  const temperaturePatterns = [
    { pattern: /operating\s*temperature\s*(?:range)?[\s:]*(-?\d+)(?:\s*to\s*|\s*-\s*)(-?\d+)\s*(?:°C|°F|C|F)/i, confidence: 0.9 },
    { pattern: /temperature\s*range[\s:]*(-?\d+)(?:\s*to\s*|\s*-\s*)(-?\d+)\s*(?:°C|°F|C|F)/i, confidence: 0.8 }
  ];
  
  // Check each source for operating temperature
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, confidence } of temperaturePatterns) {
        const match = source.data.match(pattern);
        if (match) {
          const min = parseInt(match[1], 10);
          const max = parseInt(match[2], 10);
          return {
            value: `${min}°C to ${max}°C`,
            source: source.name,
            confidence: confidence * source.priority / 3,
            pattern: pattern.toString()
          };
        }
      }
    }
  }
  
  // No default for operating temperature
  return null;
}

/**
 * Extract power source from sources
 * @param {Array} sources - Array of data sources
 * @returns {Object} - Power source specification
 */
function extractPowerSource(sources) {
  const powerSourcePatterns = [
    { pattern: /hardwire|direct\s*wire/i, value: 'Hardwire', confidence: 0.9 },
    { pattern: /car\s*charger|cigarette\s*lighter|12v/i, value: 'Car Charger', confidence: 0.9 },
    { pattern: /battery|rechargeable/i, value: 'Battery', confidence: 0.9 },
    { pattern: /capacitor|supercapacitor|super\s*capacitor/i, value: 'Capacitor', confidence: 0.9 }
  ];
  
  // Check each source for power source
  for (const source of sources) {
    if (typeof source.data === 'string') {
      for (const { pattern, value, confidence } of powerSourcePatterns) {
        if (pattern.test(source.data)) {
          return {
            value: value,
            source: source.name,
            confidence: confidence * source.priority / 3,
            pattern: pattern.toString()
          };
        }
      }
    }
  }
  
  // Default to Car Charger if not found (most common for dash cams)
  return {
    value: 'Car Charger',
    source: 'default',
    confidence: 0.5,
    pattern: 'default'
  };
}
