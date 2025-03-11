/**
 * DashCamFinder - Main JavaScript
 * Handles filtering, sorting, and display of dash cam products
 */

// Import the product processor
import { processProductsArray } from './product-processor.js';

// Default product data (used as fallback if JSON file can't be loaded)
let dashCamProducts = [];

// Path to the JSON file containing product data
const PRODUCTS_JSON_PATH = '/data/products.json';

/**
 * Fetches product data from the JSON file
 * @returns {Promise<Array>} - Promise that resolves to the product data array
 */
async function fetchProductData() {
  try {
    const response = await fetch(PRODUCTS_JSON_PATH);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch product data: ${response.status} ${response.statusText}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Process the raw data to extract structured specifications
    const processedData = processProductsArray(data);
    
    console.log(`Loaded and processed ${processedData.length} products from JSON file`);
    return processedData;
  } catch (error) {
    console.error('Error loading product data:', error);
    
    // If we have products in localStorage, use those as a fallback
    const cachedData = localStorage.getItem('dashCamProducts');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        console.log(`Using ${parsedData.length} cached products from localStorage`);
        return parsedData;
      } catch (cacheError) {
        console.error('Error parsing cached product data:', cacheError);
      }
    }
    
    // If all else fails, return an empty array
    console.log('Using empty product array as fallback');
    return [];
  }
}

// Load product data when the page loads
window.addEventListener('DOMContentLoaded', async () => {
  // Show loading indicator
  const resultsContainer = document.getElementById('results-container');
  if (resultsContainer) {
    resultsContainer.innerHTML = '<div class="loading">Loading product data...</div>';
  }
  
  try {
    // Fetch product data
    dashCamProducts = await fetchProductData();
    
    // Cache the data in localStorage for offline use
    localStorage.setItem('dashCamProducts', JSON.stringify(dashCamProducts));
    
    // Initialize the page with the loaded data
    initPage();
  } catch (error) {
    console.error('Error initializing page with product data:', error);
    
    // Show error message
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="error">
          <p>Error loading product data. Please try refreshing the page.</p>
          <p>Error details: ${error.message}</p>
        </div>
      `;
    }
  }
});

// Get unique brands for the filter dropdown
const getBrands = () => {
  const brands = new Set();
  dashCamProducts.forEach(product => brands.add(product.brand));
  return Array.from(brands).sort();
};

// Get unique resolutions for the filter dropdown
const getResolutions = () => {
  const resolutions = new Set();
  dashCamProducts.forEach(product => resolutions.add(product.resolution));
  return Array.from(resolutions).sort();
};

// Filter products based on selected criteria
const filterProducts = (filters) => {
  return dashCamProducts.filter(product => {
    // Filter by marketplace - only show products that have prices for the selected marketplace
    if (filters.marketplace === 'amazon_uk' && (!product.price.amazon_uk || !product.amazonUrl.uk)) {
      return false;
    }
    if (filters.marketplace === 'amazon_com' && (!product.price.amazon_com || !product.amazonUrl.com)) {
      return false;
    }
    
    // Filter by brand if selected
    if (filters.brand && product.brand !== filters.brand) {
      return false;
    }
    
    // Filter by model if search text is provided
    if (filters.searchText && !product.model.toLowerCase().includes(filters.searchText.toLowerCase())) {
      return false;
    }
    
    // Filter by resolution if selected
    if (filters.resolution && product.resolution !== filters.resolution) {
      return false;
    }
    
    // Filter by price range if provided
    const price = filters.marketplace === 'amazon_uk' ? product.price.amazon_uk : product.price.amazon_com;
    if (filters.minPrice && price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && price > filters.maxPrice) {
      return false;
    }
    
    // Filter by minimum rating if provided
    if (filters.minRating && product.rating < filters.minRating) {
      return false;
    }
    
    return true;
  });
};

// Sort products based on selected criteria
const sortProducts = (products, sortBy, marketplace) => {
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-low':
      sortedProducts.sort((a, b) => {
        const priceA = marketplace === 'amazon_uk' ? a.price.amazon_uk : a.price.amazon_com;
        const priceB = marketplace === 'amazon_uk' ? b.price.amazon_uk : b.price.amazon_com;
        return priceA - priceB;
      });
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => {
        const priceA = marketplace === 'amazon_uk' ? a.price.amazon_uk : a.price.amazon_com;
        const priceB = marketplace === 'amazon_uk' ? b.price.amazon_uk : b.price.amazon_com;
        return priceB - priceA;
      });
      break;
    case 'rating':
      sortedProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      sortedProducts.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      break;
    case 'popularity':
      sortedProducts.sort((a, b) => b.popularity - a.popularity);
      break;
    default:
      // Default sort by popularity
      sortedProducts.sort((a, b) => b.popularity - a.popularity);
  }
  
  return sortedProducts;
};

// Format price with currency symbol
const formatPrice = (price, marketplace) => {
  if (!price || price === 0) {
    return 'Price not available';
  }
  
  if (marketplace === 'amazon_uk') {
    return `£${price.toFixed(2)}`;
  }
  return `$${price.toFixed(2)}`;
};

// Generate star rating HTML
const generateStarRating = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let starsHtml = '';
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<i class="fas fa-star"></i>';
  }
  
  // Add half star if needed
  if (halfStar) {
    starsHtml += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<i class="far fa-star"></i>';
  }
  
  return starsHtml;
};

// Table view rendering function removed - using only grid view

// Render products in grid view
const renderProductsGrid = (products, marketplace) => {
  const resultsContainer = document.getElementById('results-container');
  
  if (products.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>No dash cams match your selected filters. Try adjusting your criteria.</p>
      </div>
    `;
    return;
  }
  
  let gridHtml = '<div class="product-grid">';
  
  products.forEach(product => {
    const price = marketplace === 'amazon_uk' ? product.price.amazon_uk : product.price.amazon_com;
    const amazonUrl = marketplace === 'amazon_uk' ? product.amazonUrl.uk : product.amazonUrl.com;
    // Default image if none is provided
    const imageUrl = product.image && product.image.trim() !== '' ? 
      product.image : 
      `https://via.placeholder.com/300x200/f0f0f0/333333?text=${encodeURIComponent(product.brand)}`;
    
    // Get specs from processed data
    const specs = product.specs || {};
    const videoSpecs = specs.video || {};
    const physicalSpecs = specs.physical || {};
    const connectivitySpecs = specs.connectivity || {};
    const featureSpecs = specs.features || {};
    const storageSpecs = specs.storage || {};
    
    // Create badges for key features
    const badges = [];
    
    // Resolution badge
    if (videoSpecs.resolution) {
      badges.push(`<span class="spec-badge resolution">${videoSpecs.resolution}</span>`);
    }
    
    // FOV badge
    if (physicalSpecs.fov) {
      badges.push(`<span class="spec-badge fov">${physicalSpecs.fov}° FOV</span>`);
    }
    
    // WiFi badge
    if (connectivitySpecs.wifi) {
      badges.push(`<span class="spec-badge wifi">WiFi</span>`);
    }
    
    // GPS badge
    if (connectivitySpecs.gps) {
      badges.push(`<span class="spec-badge gps">GPS</span>`);
    }
    
    // Night Vision badge
    if (videoSpecs.nightVision) {
      badges.push(`<span class="spec-badge night-vision">Night Vision</span>`);
    }
    
    // Parking Mode badge
    if (featureSpecs.parkingMode) {
      badges.push(`<span class="spec-badge parking">Parking Mode</span>`);
    }
    
    // Create specs sections
    const specSections = [];
    
    // Video specs section
    const videoSpecsList = [];
    if (videoSpecs.resolution) {
      let resText = videoSpecs.resolution;
      if (videoSpecs.fps) {
        resText += ` @ ${videoSpecs.fps}fps`;
      }
      videoSpecsList.push(resText);
    }
    if (videoSpecs.hdr) {
      videoSpecsList.push('HDR');
    }
    if (videoSpecs.wdr) {
      videoSpecsList.push('WDR');
    }
    if (videoSpecs.nightVision) {
      videoSpecsList.push('Night Vision');
    }
    
    if (videoSpecsList.length > 0) {
      specSections.push(`
        <div class="spec-section">
          <h4>Video</h4>
          <ul>
            ${videoSpecsList.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    // Physical specs section
    const physicalSpecsList = [];
    if (physicalSpecs.fov) {
      physicalSpecsList.push(`${physicalSpecs.fov}° Field of View`);
    }
    if (physicalSpecs.screenSize) {
      let screenText = `${physicalSpecs.screenSize}" Screen`;
      if (physicalSpecs.screenType) {
        screenText += ` (${physicalSpecs.screenType})`;
      }
      physicalSpecsList.push(screenText);
    }
    if (physicalSpecs.channels && physicalSpecs.channels > 1) {
      physicalSpecsList.push(`${physicalSpecs.channels}-Channel Recording`);
    }
    if (physicalSpecs.sizeDescription) {
      physicalSpecsList.push(physicalSpecs.sizeDescription);
    }
    
    if (physicalSpecsList.length > 0) {
      specSections.push(`
        <div class="spec-section">
          <h4>Physical</h4>
          <ul>
            ${physicalSpecsList.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    // Connectivity specs section
    const connectivitySpecsList = [];
    if (connectivitySpecs.wifi) {
      let wifiText = 'WiFi';
      if (connectivitySpecs.wifiFrequency) {
        wifiText += ` (${connectivitySpecs.wifiFrequency})`;
      }
      connectivitySpecsList.push(wifiText);
    }
    if (connectivitySpecs.bluetooth) {
      connectivitySpecsList.push('Bluetooth');
    }
    if (connectivitySpecs.gps) {
      connectivitySpecsList.push('GPS');
    }
    if (connectivitySpecs.voiceControl) {
      connectivitySpecsList.push('Voice Control');
    }
    
    if (connectivitySpecsList.length > 0) {
      specSections.push(`
        <div class="spec-section">
          <h4>Connectivity</h4>
          <ul>
            ${connectivitySpecsList.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    // Features specs section
    const featureSpecsList = [];
    if (featureSpecs.parkingMode) {
      featureSpecsList.push('Parking Mode');
    }
    if (featureSpecs.motionDetection) {
      featureSpecsList.push('Motion Detection');
    }
    if (featureSpecs.loopRecording) {
      featureSpecsList.push('Loop Recording');
    }
    if (featureSpecs.emergencyRecording) {
      featureSpecsList.push('Emergency Recording');
    }
    if (featureSpecs.timeLapse) {
      featureSpecsList.push('Time-Lapse');
    }
    if (featureSpecs.remoteMonitoring) {
      featureSpecsList.push('Remote Monitoring');
    }
    
    if (featureSpecsList.length > 0) {
      specSections.push(`
        <div class="spec-section">
          <h4>Features</h4>
          <ul>
            ${featureSpecsList.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    // Storage specs section
    const storageSpecsList = [];
    if (storageSpecs.memoryCardIncluded) {
      let storageText = 'Memory Card Included';
      if (storageSpecs.includedStorage) {
        storageText = `${storageSpecs.includedStorage}GB Memory Card Included`;
      }
      storageSpecsList.push(storageText);
    }
    if (storageSpecs.maxStorage) {
      storageSpecsList.push(`Supports up to ${storageSpecs.maxStorage}GB`);
    }
    
    if (storageSpecsList.length > 0) {
      specSections.push(`
        <div class="spec-section">
          <h4>Storage</h4>
          <ul>
            ${storageSpecsList.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    // Use clean model name if available
    const modelName = product.cleanModelName || product.model;
    
    // Check if product is new (released within last 30 days)
    const isNew = product.releaseDate && (new Date() - new Date(product.releaseDate)) < 30 * 24 * 60 * 60 * 1000;
    
    // Format release date
    const releaseDate = product.releaseDate ? new Date(product.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
    
    gridHtml += `
      <div class="product-card">
        <div class="product-card-image">
          <img src="${imageUrl}" alt="${product.brand} ${product.model}">
          ${badges.length > 0 ? `<div class="product-card-badges">${badges.join('')}</div>` : ''}
          ${isNew ? '<span class="new-badge">NEW!</span>' : ''}
        </div>
        <div class="product-card-content">
          <h3 class="product-card-title">${product.brand} ${modelName}</h3>
          <div class="product-card-price">${formatPrice(price, marketplace)}</div>
          <div class="product-card-rating">
            <div class="rating-number">${product.rating}</div>
            <div class="stars">${generateStarRating(product.rating)}</div>
            <div class="review-count">${product.reviewCount > 0 ? product.reviewCount.toLocaleString() + ' ratings' : 'No reviews yet'}</div>
          </div>
          ${releaseDate ? `<div class="product-card-release-date">Released: ${releaseDate}</div>` : ''}
          <div class="product-card-specs-toggle">
            <button class="specs-toggle-button">Show Specifications</button>
          </div>
          <div class="product-card-specs">
            ${specSections.join('')}
          </div>
          <div class="product-card-actions">
            <a href="${amazonUrl}" target="_blank" class="button buy-button">View on Amazon</a>
          </div>
        </div>
      </div>
    `;
  });
  
  gridHtml += '</div>';
  
  resultsContainer.innerHTML = gridHtml;
  
  // Add event listeners for specs toggle buttons
  document.querySelectorAll('.specs-toggle-button').forEach(button => {
    button.addEventListener('click', function() {
      const specsContainer = this.parentElement.nextElementSibling;
      const isVisible = specsContainer.style.display === 'block';
      
      specsContainer.style.display = isVisible ? 'none' : 'block';
      this.textContent = isVisible ? 'Show Specifications' : 'Hide Specifications';
    });
  });
};

// Update results count
const updateResultsCount = (count) => {
  const resultsCount = document.getElementById('results-count');
  resultsCount.textContent = `${count} dash cams found`;
};

// Update URL parameters to make filtered views shareable
const updateUrlParams = (filters, sortBy, viewMode) => {
  const url = new URL(window.location.href);
  
  // Clear existing parameters
  url.search = '';
  
  // Add filter parameters
  if (filters.marketplace) url.searchParams.set('marketplace', filters.marketplace);
  if (filters.brand) url.searchParams.set('brand', filters.brand);
  if (filters.searchText) url.searchParams.set('search', filters.searchText);
  if (filters.resolution) url.searchParams.set('resolution', filters.resolution);
  if (filters.minPrice) url.searchParams.set('minPrice', filters.minPrice);
  if (filters.maxPrice) url.searchParams.set('maxPrice', filters.maxPrice);
  if (filters.minRating) url.searchParams.set('minRating', filters.minRating);
  
  // Add sort and view parameters
  if (sortBy) url.searchParams.set('sort', sortBy);
  if (viewMode) url.searchParams.set('view', viewMode);
  
  // Update URL without reloading the page
  window.history.pushState({}, '', url);
  
  // Update page title for SEO
  let title = 'DashCamFinder - Compare Dash Cam Prices and Features';
  
  if (filters.brand) {
    title = `${filters.brand} Dash Cams - Compare Prices and Features | DashCamFinder`;
  }
  
  if (filters.resolution) {
    title = `${filters.resolution} Dash Cams - High Resolution Comparison | DashCamFinder`;
  }
  
  if (filters.brand && filters.resolution) {
    title = `${filters.brand} ${filters.resolution} Dash Cams | DashCamFinder`;
  }
  
  document.title = title;
  
  // Update meta description for SEO
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    let description = 'Compare dash cam prices and features across top brands. Find the perfect dash cam for your vehicle.';
    
    if (filters.brand) {
      description = `Compare ${filters.brand} dash cam prices and features. Find the best ${filters.brand} dash cam for your vehicle.`;
    }
    
    if (filters.resolution) {
      description = `Compare ${filters.resolution} dash cam prices and features. High resolution dash cams for crystal clear footage.`;
    }
    
    if (filters.brand && filters.resolution) {
      description = `Compare ${filters.brand} ${filters.resolution} dash cam prices and features. Find the best high-resolution dash cam for your needs.`;
    }
    
    metaDescription.setAttribute('content', description);
  }
};

// Get URL parameters when page loads
const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    marketplace: urlParams.get('marketplace') || 'amazon_com',
    brand: urlParams.get('brand') || '',
    searchText: urlParams.get('search') || '',
    resolution: urlParams.get('resolution') || '',
    minPrice: urlParams.get('minPrice') ? parseFloat(urlParams.get('minPrice')) : '',
    maxPrice: urlParams.get('maxPrice') ? parseFloat(urlParams.get('maxPrice')) : '',
    minRating: urlParams.get('minRating') ? parseFloat(urlParams.get('minRating')) : '',
    sortBy: urlParams.get('sort') || 'popularity',
    viewMode: urlParams.get('view') || 'table'
  };
};

// Initialize the page with product data
const initPage = () => {
  // If no products were loaded, show an error message
  if (!dashCamProducts || dashCamProducts.length === 0) {
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <p>No product data available. Please check your connection and try again.</p>
        </div>
      `;
    }
    return;
  }
  // Get elements
  const marketplaceRadios = document.querySelectorAll('input[name="marketplace"]');
  const brandSelect = document.getElementById('brand-select');
  const searchInput = document.getElementById('search-input');
  const resolutionSelect = document.getElementById('resolution-select');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  const minRatingSelect = document.getElementById('min-rating');
  const sortSelect = document.getElementById('sort-select');
  // View mode buttons removed - using only grid view
  const resetFiltersButton = document.getElementById('reset-filters');
  
  // Get URL parameters
  const params = getUrlParams();
  
  // Set initial form values from URL parameters
  document.querySelector(`input[name="marketplace"][value="${params.marketplace}"]`).checked = true;
  
  // Populate brand dropdown
  const brands = getBrands();
  let brandOptionsHtml = '<option value="">All Brands</option>';
  brands.forEach(brand => {
    brandOptionsHtml += `<option value="${brand}" ${params.brand === brand ? 'selected' : ''}>${brand}</option>`;
  });
  brandSelect.innerHTML = brandOptionsHtml;
  
  // Populate resolution dropdown
  const resolutions = getResolutions();
  let resolutionOptionsHtml = '<option value="">All Resolutions</option>';
  resolutions.forEach(resolution => {
    resolutionOptionsHtml += `<option value="${resolution}" ${params.resolution === resolution ? 'selected' : ''}>${resolution}</option>`;
  });
  resolutionSelect.innerHTML = resolutionOptionsHtml;
  
  // Set other form values
  searchInput.value = params.searchText;
  minPriceInput.value = params.minPrice;
  maxPriceInput.value = params.maxPrice;
  minRatingSelect.value = params.minRating;
  sortSelect.value = params.sortBy;
  
  // View mode setting removed - using only grid view
  
  // Apply initial filters and render products
  applyFilters();
  
  // Add event listeners
  marketplaceRadios.forEach(radio => {
    radio.addEventListener('change', applyFilters);
  });
  
  brandSelect.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', debounce(applyFilters, 300));
  resolutionSelect.addEventListener('change', applyFilters);
  minPriceInput.addEventListener('input', debounce(applyFilters, 300));
  maxPriceInput.addEventListener('input', debounce(applyFilters, 300));
  minRatingSelect.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
  
  // View mode button event listeners removed - using only grid view
  
  resetFiltersButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Reset form values
    document.querySelector('input[name="marketplace"][value="amazon_com"]').checked = true;
    brandSelect.value = '';
    searchInput.value = '';
    resolutionSelect.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    minRatingSelect.value = '';
    sortSelect.value = 'popularity';
    
    // Apply filters
    applyFilters();
  });
};

// Apply filters and render products
const applyFilters = () => {
  // Get filter values
  const marketplace = document.querySelector('input[name="marketplace"]:checked').value;
  const brand = document.getElementById('brand-select').value;
  const searchText = document.getElementById('search-input').value;
  const resolution = document.getElementById('resolution-select').value;
  const minPrice = document.getElementById('min-price').value ? parseFloat(document.getElementById('min-price').value) : '';
  const maxPrice = document.getElementById('max-price').value ? parseFloat(document.getElementById('max-price').value) : '';
  const minRating = document.getElementById('min-rating').value ? parseFloat(document.getElementById('min-rating').value) : '';
  const sortBy = document.getElementById('sort-select').value;
  
  // View mode handling removed - using only grid view
  const viewMode = 'grid'; // Always use grid view
  
  // Create filters object
  const filters = {
    marketplace,
    brand,
    searchText,
    resolution,
    minPrice,
    maxPrice,
    minRating
  };
  
  // Filter and sort products
  const filteredProducts = filterProducts(filters);
  const sortedProducts = sortProducts(filteredProducts, sortBy, marketplace);
  
  // Update results count
  updateResultsCount(sortedProducts.length);
  
  // Always render products in grid view
  renderProductsGrid(sortedProducts, marketplace);
  
  // Update URL parameters
  updateUrlParams(filters, sortBy, viewMode);
};

// Debounce function to limit how often a function can be called
const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Note: The DOMContentLoaded event listener is now handled in the window.addEventListener above
