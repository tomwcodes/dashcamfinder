/**
 * DashCamFinder - Filter System
 * A declarative filter architecture with composable filter functions
 */

/**
 * Filter Registry - defines all available filters with their predicates
 * Each filter has:
 * - type: The UI element type (radio, select, text, etc.)
 * - predicate: Function that determines if a product matches the filter
 */
const filterRegistry = {
  marketplace: {
    type: 'radio',
    predicate: (product, value) => {
      if (value === 'amazon_uk') {
        return product.price.amazon_uk !== undefined && product.price.amazon_uk !== -1 && product.amazonUrl.uk;
      }
      return product.price.amazon_com !== undefined && product.price.amazon_com !== -1 && product.amazonUrl.com;
    }
  },
  brand: {
    type: 'select',
    predicate: (product, value) => !value || product.brand === value
  },
  searchText: {
    type: 'text',
    predicate: (product, value) => {
      if (!value) return true;
      
      const searchTerm = value.toLowerCase();
      
      // Search in model and brand
      if (product.model.toLowerCase().includes(searchTerm) || 
          product.brand.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in features array if it exists
      if (Array.isArray(product.features) && product.features.length > 0) {
        for (const feature of product.features) {
          if (feature.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
      }
      
      // Search in processed specifications if they exist
      if (product.specs) {
        // Search in video specs
        const videoSpecs = product.specs.video || {};
        for (const [key, val] of Object.entries(videoSpecs)) {
          if (typeof val === 'string' && val.toLowerCase().includes(searchTerm)) {
            return true;
          }
          if (key.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
        
        // Search in physical specs
        const physicalSpecs = product.specs.physical || {};
        for (const [key, val] of Object.entries(physicalSpecs)) {
          if (typeof val === 'string' && val.toLowerCase().includes(searchTerm)) {
            return true;
          }
          if (key.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
        
        // Search in connectivity specs
        const connectivitySpecs = product.specs.connectivity || {};
        for (const [key, val] of Object.entries(connectivitySpecs)) {
          if (typeof val === 'string' && val.toLowerCase().includes(searchTerm)) {
            return true;
          }
          if (key.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
        
        // Search in features specs
        const featureSpecs = product.specs.features || {};
        for (const [key, val] of Object.entries(featureSpecs)) {
          if (typeof val === 'string' && val.toLowerCase().includes(searchTerm)) {
            return true;
          }
          if (key.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
        
        // Search in storage specs
        const storageSpecs = product.specs.storage || {};
        for (const [key, val] of Object.entries(storageSpecs)) {
          if (typeof val === 'string' && val.toLowerCase().includes(searchTerm)) {
            return true;
          }
          if (key.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
      }
      
      // Search in resolution field if it exists
      if (product.resolution && product.resolution.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    }
  },
  priceRange: {
    type: 'range',
    predicate: (product, value, allFilters) => {
      if (!value.min && !value.max) return true;
      
      const price = allFilters.marketplace === 'amazon_uk' 
        ? product.price.amazon_uk 
        : product.price.amazon_com;
      
      if (value.min && price < value.min) return false;
      if (value.max && price > value.max) return false;
      return true;
    }
  },
  minRating: {
    type: 'select',
    predicate: (product, value) => !value || product.rating >= parseFloat(value)
  }
};

/**
 * Specification Filter Factory - creates predicates for specification filters
 * @param {string} specKey - The specification key in format "category:property:value"
 * @returns {Function} - A predicate function that takes a product and returns boolean
 */
const createSpecFilter = (specKey) => {
  const [category, property, value] = specKey.split(':');
  
  // Handle resolution filters
  if (category === 'resolution') {
    return product => {
      const specs = product.specs || {};
      const videoSpecs = specs.video || {};
      return videoSpecs.resolution === property || product.resolution === property;
    };
  }
  
  if (value) {
    // For numeric comparisons (e.g., FOV >= 140)
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      if (category === 'physical' && property === 'fov') {
        return product => {
          const specs = product.specs || {};
          const categorySpecs = specs[category] || {};
          return categorySpecs[property] && categorySpecs[property] >= numValue;
        };
      }
      if (category === 'physical' && property === 'channels') {
        return product => {
          const specs = product.specs || {};
          const categorySpecs = specs[category] || {};
          return categorySpecs[property] && categorySpecs[property] >= numValue;
        };
      }
    }
  } else {
    // For boolean properties (e.g., wifi, parkingMode)
    return product => {
      const specs = product.specs || {};
      const categorySpecs = specs[category] || {};
      return !!categorySpecs[property];
    };
  }
  
  // Default case
  return () => true;
};

/**
 * Apply filters to a list of products
 * @param {Array} products - The list of products to filter
 * @param {Object} filterState - The current state of all filters
 * @returns {Array} - Filtered products
 */
const applyFilters = (products, filterState) => {
  return products.filter(product => {
    // Apply basic filters from registry
    for (const [filterName, filterValue] of Object.entries(filterState)) {
      if (filterName === 'selectedSpecs') continue; // Handle separately
      
      const filter = filterRegistry[filterName];
      if (filter && filterValue !== undefined && filterValue !== '') {
        if (!filter.predicate(product, filterValue, filterState)) {
          return false;
        }
      }
    }
    
    // Apply specification filters
    if (filterState.selectedSpecs && filterState.selectedSpecs.length > 0) {
      for (const specKey of filterState.selectedSpecs) {
        const specFilter = createSpecFilter(specKey);
        if (!specFilter(product)) {
          return false;
        }
      }
    }
    
    return true;
  });
};

/**
 * Get the current filter state from UI elements
 * @returns {Object} - The current filter state
 */
const getFilterState = () => {
  return {
    marketplace: document.querySelector('input[name="marketplace"]:checked').value,
    brand: document.getElementById('brand-select').value,
    searchText: document.getElementById('search-input').value,
    priceRange: {
      min: document.getElementById('min-price').value ? parseFloat(document.getElementById('min-price').value) : null,
      max: document.getElementById('max-price').value ? parseFloat(document.getElementById('max-price').value) : null
    },
    minRating: document.getElementById('min-rating').value,
    selectedSpecs: Array.from(document.querySelectorAll('input[name="specs"]:checked')).map(checkbox => checkbox.value)
  };
};

// Export functions for use in other modules
export {
  filterRegistry,
  createSpecFilter,
  applyFilters,
  getFilterState
};
