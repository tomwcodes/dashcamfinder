/**
 * DashCamFinder - Main JavaScript
 * Handles filtering, sorting, and display of dash cam products
 */

// Product data - This would ideally come from an API in a production environment
const dashCamProducts = [
  {
    id: 1,
    brand: "Nextbase",
    model: "522GW",
    image: "https://m.media-amazon.com/images/I/71vHX08pxZL._AC_SL1500_.jpg",
    price: {
      amazon_com: 199.99,
      amazon_uk: 149.99
    },
    rating: 4.5,
    reviewCount: 3254,
    resolution: "1440p",
    features: [
      "Built-in Alexa",
      "Emergency SOS",
      "GPS",
      "Bluetooth",
      "WiFi",
      "Polarizing filter"
    ],
    releaseDate: "2019-05-15",
    popularity: 95,
    amazonUrl: {
      com: "https://www.amazon.com/Nextbase-Dash-Camera-Emergency-Recording/dp/B07PV1M3YF/",
      uk: "https://www.amazon.co.uk/Nextbase-522GW-Dash-Camera-Black/dp/B07Q3SGXPD/"
    }
  },
  {
    id: 2,
    brand: "Garmin",
    model: "Dash Cam 66W",
    image: "https://m.media-amazon.com/images/I/71dpZCe8SDL._AC_SL1500_.jpg",
    price: {
      amazon_com: 249.99,
      amazon_uk: 199.99
    },
    rating: 4.3,
    reviewCount: 2187,
    resolution: "1440p",
    features: [
      "180-degree field of view",
      "Voice control",
      "GPS",
      "WiFi",
      "Parking mode",
      "Incident detection"
    ],
    releaseDate: "2019-04-05",
    popularity: 88,
    amazonUrl: {
      com: "https://www.amazon.com/Garmin-66W-Extra-Wide-Recording-G-sensor/dp/B07R638L8N/",
      uk: "https://www.amazon.co.uk/Garmin-Extra-Wide-Recording-G-sensor-66W/dp/B07R638L8N/"
    }
  },
  {
    id: 3,
    brand: "REDTIGER",
    model: "F7N",
    image: "https://m.media-amazon.com/images/I/71zrI5vBLLL._AC_SL1500_.jpg",
    price: {
      amazon_com: 89.99,
      amazon_uk: 79.99
    },
    rating: 4.4,
    reviewCount: 8765,
    resolution: "4K",
    features: [
      "4K recording",
      "Front and rear cameras",
      "Night vision",
      "24-hour parking mode",
      "Loop recording",
      "G-sensor"
    ],
    releaseDate: "2021-01-20",
    popularity: 92,
    amazonUrl: {
      com: "https://www.amazon.com/REDTIGER-Dashboard-Recording-G-Sensor-Recording/dp/B07RLTXMWS/",
      uk: "https://www.amazon.co.uk/REDTIGER-Dashboard-Recording-G-Sensor-Recording/dp/B07RLTXMWS/"
    }
  },
  {
    id: 4,
    brand: "Rove",
    model: "R2-4K",
    image: "https://m.media-amazon.com/images/I/71uIWQQQABL._AC_SL1500_.jpg",
    price: {
      amazon_com: 119.99,
      amazon_uk: 109.99
    },
    rating: 4.4,
    reviewCount: 25698,
    resolution: "4K",
    features: [
      "4K recording",
      "Built-in WiFi",
      "Super night vision",
      "Parking monitor",
      "Motion detection",
      "G-sensor"
    ],
    releaseDate: "2020-03-15",
    popularity: 96,
    amazonUrl: {
      com: "https://www.amazon.com/R2-4K-Dashboard-Camera-Recorder-Vision/dp/B074JT3698/",
      uk: "https://www.amazon.co.uk/R2-4K-Dashboard-Camera-Recorder-Vision/dp/B074JT3698/"
    }
  },
  {
    id: 5,
    brand: "Thinkware",
    model: "U1000",
    image: "https://m.media-amazon.com/images/I/61vHFfzwRVL._AC_SL1500_.jpg",
    price: {
      amazon_com: 399.99,
      amazon_uk: 349.99
    },
    rating: 4.2,
    reviewCount: 1254,
    resolution: "4K",
    features: [
      "4K UHD recording",
      "Super night vision 2.0",
      "Dual-band WiFi",
      "Advanced parking mode",
      "Energy saving",
      "Time lapse"
    ],
    releaseDate: "2020-09-10",
    popularity: 82,
    amazonUrl: {
      com: "https://www.amazon.com/THINKWARE-U1000-Dashboard-G-Sensor-Recording/dp/B082FCZK4V/",
      uk: "https://www.amazon.co.uk/THINKWARE-U1000-Dashboard-G-Sensor-Recording/dp/B082FCZK4V/"
    }
  },
  {
    id: 6,
    brand: "Vantrue",
    model: "N4",
    image: "https://m.media-amazon.com/images/I/71lK2pJP4GL._AC_SL1500_.jpg",
    price: {
      amazon_com: 259.99,
      amazon_uk: 239.99
    },
    rating: 4.3,
    reviewCount: 3876,
    resolution: "1440p",
    features: [
      "Three channel recording",
      "Infrared night vision",
      "24 hour parking mode",
      "Capacitor instead of battery",
      "G-sensor",
      "Time lapse"
    ],
    releaseDate: "2020-07-22",
    popularity: 85,
    amazonUrl: {
      com: "https://www.amazon.com/Vantrue-N4-Infrared-Capacitor-Detection/dp/B083V6K8RH/",
      uk: "https://www.amazon.co.uk/Vantrue-N4-Infrared-Capacitor-Detection/dp/B083V6K8RH/"
    }
  },
  {
    id: 7,
    brand: "BlackVue",
    model: "DR900X-2CH",
    image: "https://m.media-amazon.com/images/I/61y4JMmgbKL._AC_SL1500_.jpg",
    price: {
      amazon_com: 499.99,
      amazon_uk: 459.99
    },
    rating: 4.6,
    reviewCount: 1876,
    resolution: "4K",
    features: [
      "4K UHD recording",
      "Cloud connectivity",
      "Built-in GPS",
      "Dual-band WiFi",
      "Impact & motion detection",
      "Parking mode"
    ],
    releaseDate: "2021-02-15",
    popularity: 89,
    amazonUrl: {
      com: "https://www.amazon.com/BlackVue-DR900X-2CH-Hardwiring-Recorder-Detection/dp/B08P5FMRKS/",
      uk: "https://www.amazon.co.uk/BlackVue-DR900X-2CH-Hardwiring-Recorder-Detection/dp/B08P5FMRKS/"
    }
  },
  {
    id: 8,
    brand: "70mai",
    model: "Pro Plus+",
    image: "https://m.media-amazon.com/images/I/61VI4uw95rS._AC_SL1500_.jpg",
    price: {
      amazon_com: 119.99,
      amazon_uk: 109.99
    },
    rating: 4.4,
    reviewCount: 5432,
    resolution: "1440p",
    features: [
      "1440p recording",
      "Built-in GPS",
      "ADAS",
      "Emergency recording",
      "App control",
      "140° wide angle"
    ],
    releaseDate: "2020-11-11",
    popularity: 87,
    amazonUrl: {
      com: "https://www.amazon.com/70mai-Dashboard-Recording-G-Sensor-Monitoring/dp/B08LVHY5Q7/",
      uk: "https://www.amazon.co.uk/70mai-Dashboard-Recording-G-Sensor-Monitoring/dp/B08LVHY5Q7/"
    }
  },
  {
    id: 9,
    brand: "VIOFO",
    model: "A129 Pro Duo",
    image: "https://m.media-amazon.com/images/I/61llpAiPGGL._AC_SL1500_.jpg",
    price: {
      amazon_com: 249.99,
      amazon_uk: 229.99
    },
    rating: 4.5,
    reviewCount: 2987,
    resolution: "4K",
    features: [
      "4K front + 1080p rear",
      "GPS logger",
      "WiFi",
      "Parking mode",
      "G-sensor",
      "Motion detection"
    ],
    releaseDate: "2020-05-20",
    popularity: 91,
    amazonUrl: {
      com: "https://www.amazon.com/VIOFO-A129-Dash-Camera-Recording/dp/B07RXQJ148/",
      uk: "https://www.amazon.co.uk/VIOFO-A129-Dash-Camera-Recording/dp/B07RXQJ148/"
    }
  },
  {
    id: 10,
    brand: "Kingslim",
    model: "D4",
    image: "https://m.media-amazon.com/images/I/71zCweT0MQL._AC_SL1500_.jpg",
    price: {
      amazon_com: 149.99,
      amazon_uk: 139.99
    },
    rating: 4.3,
    reviewCount: 4567,
    resolution: "4K",
    features: [
      "4K front + 1080p rear",
      "Built-in WiFi",
      "GPS",
      "Super night vision",
      "Parking monitor",
      "170° wide angle"
    ],
    releaseDate: "2021-03-30",
    popularity: 86,
    amazonUrl: {
      com: "https://www.amazon.com/Kingslim-D4-2160P-Recorder-G-Sensor/dp/B08LTWG5LT/",
      uk: "https://www.amazon.co.uk/Kingslim-D4-2160P-Recorder-G-Sensor/dp/B08LTWG5LT/"
    }
  },
  {
    id: 11,
    brand: "Nexar",
    model: "Beam",
    image: "https://m.media-amazon.com/images/I/71Iek5ycXKL._AC_SL1500_.jpg",
    price: {
      amazon_com: 129.99,
      amazon_uk: 119.99
    },
    rating: 4.2,
    reviewCount: 3456,
    resolution: "1080p",
    features: [
      "Cloud storage",
      "Automatic incident recording",
      "Parking mode",
      "GPS",
      "Night vision",
      "Smartphone app"
    ],
    releaseDate: "2021-01-05",
    popularity: 84,
    amazonUrl: {
      com: "https://www.amazon.com/Nexar-Beam-Full-Road-Dash/dp/B07ZPKQM6X/",
      uk: "https://www.amazon.co.uk/Nexar-Beam-Full-Road-Dash/dp/B07ZPKQM6X/"
    }
  },
  {
    id: 12,
    brand: "Cobra",
    model: "SC 400",
    image: "https://m.media-amazon.com/images/I/71Yx9Lq+9QL._AC_SL1500_.jpg",
    price: {
      amazon_com: 199.99,
      amazon_uk: 189.99
    },
    rating: 4.1,
    reviewCount: 1234,
    resolution: "4K",
    features: [
      "4K recording",
      "160° field of view",
      "Driver alerts",
      "Emergency recording",
      "Parking mode",
      "G-sensor"
    ],
    releaseDate: "2020-08-15",
    popularity: 79,
    amazonUrl: {
      com: "https://www.amazon.com/Cobra-SC-400-Powered-G-Sensor-SC400/dp/B08B3PDGQB/",
      uk: "https://www.amazon.co.uk/Cobra-SC-400-Powered-G-Sensor-SC400/dp/B08B3PDGQB/"
    }
  }
];

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

// Render products in table view
const renderProductsTable = (products, marketplace) => {
  const resultsContainer = document.getElementById('results-container');
  
  if (products.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>No dash cams match your selected filters. Try adjusting your criteria.</p>
      </div>
    `;
    return;
  }
  
  let tableHtml = `
    <table class="results-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>Price</th>
          <th>Rating</th>
          <th>Features</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  products.forEach(product => {
    const price = marketplace === 'amazon_uk' ? product.price.amazon_uk : product.price.amazon_com;
    const amazonUrl = marketplace === 'amazon_uk' ? product.amazonUrl.uk : product.amazonUrl.com;
    
    tableHtml += `
      <tr>
        <td>
          <img src="${product.image}" alt="${product.brand} ${product.model}" class="product-image">
        </td>
        <td>
          <div class="product-title">${product.brand} ${product.model}</div>
          <div class="product-resolution">${product.resolution} Resolution</div>
        </td>
        <td>
          <div class="product-price">${formatPrice(price, marketplace)}</div>
        </td>
        <td>
          <div class="product-rating">
            <div class="stars">${generateStarRating(product.rating)}</div>
            <span>${product.rating} (${product.reviewCount.toLocaleString()})</span>
          </div>
        </td>
        <td>
          <div class="product-features">
            <ul>
              ${product.features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
        </td>
        <td>
          <a href="${amazonUrl}" target="_blank" class="button buy-button">View on Amazon</a>
        </td>
      </tr>
    `;
  });
  
  tableHtml += `
      </tbody>
    </table>
  `;
  
  resultsContainer.innerHTML = tableHtml;
};

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
    
    gridHtml += `
      <div class="product-card">
        <div class="product-card-image">
          <img src="${product.image}" alt="${product.brand} ${product.model}">
        </div>
        <div class="product-card-content">
          <h3 class="product-card-title">${product.brand} ${product.model}</h3>
          <div class="product-card-price">${formatPrice(price, marketplace)}</div>
          <div class="product-card-rating">
            <div class="stars">${generateStarRating(product.rating)}</div>
            <span>${product.rating} (${product.reviewCount.toLocaleString()})</span>
          </div>
          <div class="product-card-features">
            <ul>
              ${product.features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          <div class="product-card-actions">
            <span class="text-muted">${product.resolution}</span>
            <a href="${amazonUrl}" target="_blank" class="button buy-button">View on Amazon</a>
          </div>
        </div>
      </div>
    `;
  });
  
  gridHtml += '</div>';
  
  resultsContainer.innerHTML = gridHtml;
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

// Initialize the page
const initPage = () => {
  // Get elements
  const marketplaceRadios = document.querySelectorAll('input[name="marketplace"]');
  const brandSelect = document.getElementById('brand-select');
  const searchInput = document.getElementById('search-input');
  const resolutionSelect = document.getElementById('resolution-select');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  const minRatingSelect = document.getElementById('min-rating');
  const sortSelect = document.getElementById('sort-select');
  const viewModeButtons = document.querySelectorAll('.view-mode-button');
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
  
  // Set active view mode
  viewModeButtons.forEach(button => {
    if (button.dataset.view === params.viewMode) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
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
  
  viewModeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all buttons
      viewModeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Apply filters with new view mode
      applyFilters();
    });
  });
  
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
  
  // Get active view mode
  const viewMode = document.querySelector('.view-mode-button.active').dataset.view;
  
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
  
  // Render products based on view mode
  if (viewMode === 'table') {
    renderProductsTable(sortedProducts, marketplace);
  } else {
    renderProductsGrid(sortedProducts, marketplace);
  }
  
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

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);
