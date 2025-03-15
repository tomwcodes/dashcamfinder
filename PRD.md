# DashCamFinder - Product Requirements Document (PRD)

## 1. Introduction

### 1.1 Purpose
This document outlines the requirements and specifications for the DashCamFinder web application, a platform designed to help users compare dash cam prices and features across various brands and models. The application provides a user-friendly interface for filtering and sorting dash cams based on different criteria, with a focus on providing comprehensive product information to aid purchasing decisions.

### 1.2 Scope
DashCamFinder is a web-based application that aggregates dash cam product data from Amazon marketplaces (US and UK), allowing users to filter, sort, and compare products based on various specifications and features. The application includes automated data collection through the Oxylabs E-Commerce Scraper API, with daily updates to ensure pricing and availability information remains current.

### 1.3 Definitions, Acronyms, and Abbreviations
- **API**: Application Programming Interface
- **FOV**: Field of View
- **HDR**: High Dynamic Range
- **WDR**: Wide Dynamic Range
- **SEO**: Search Engine Optimization
- **UI**: User Interface
- **UX**: User Experience

## 2. Product Overview

### 2.1 Product Perspective
DashCamFinder is a standalone web application that integrates with the Oxylabs E-Commerce Scraper API to collect product data from Amazon. The application serves as an affiliate marketing platform, providing users with up-to-date information on dash cam products while generating revenue through Amazon affiliate links.

### 2.2 Product Features
- Responsive design that works on mobile, tablet, and desktop devices
- Advanced filtering system with multi-select checkbox dropdowns for specifications
- Marketplace selection (Amazon US/UK) with appropriate currency display
- Brand, price range, and rating filters
- Specification-based filtering (resolution, video features, physical specs, connectivity, features)
- Text search functionality across product names, brands, and specifications
- Sorting options by popularity, price, rating, and release date
- Detailed product cards with expandable specifications
- Dynamic URL parameters for shareable filtered views
- Daily data refresh system using cron jobs
- Fallback to localStorage cache if JSON file can't be loaded

### 2.3 User Classes and Characteristics
- **General Consumers**: Individuals looking to purchase a dash cam for personal use
- **Professional Drivers**: Taxi drivers, delivery drivers, and other professionals who need dash cams for work
- **Tech Enthusiasts**: Users interested in the latest dash cam technology and features
- **Price-Conscious Shoppers**: Users primarily concerned with finding the best value for their budget

### 2.4 Operating Environment
- Web browsers: Chrome, Firefox, Safari, Edge (latest versions)
- Devices: Desktop computers, laptops, tablets, and mobile phones
- Operating systems: Windows, macOS, iOS, Android
- Server environment: Linux with Node.js for data collection scripts

### 2.5 Design and Implementation Constraints
- The application must be built with vanilla HTML, CSS, and JavaScript without frameworks
- Product data must be updated daily to ensure accuracy
- The application must be responsive and work on all device sizes
- The application must follow accessibility guidelines
- The application must be optimized for search engines

### 2.6 Assumptions and Dependencies
- Dependency on the Oxylabs E-Commerce Scraper API for data collection
- Dependency on Amazon's affiliate program for monetization
- Assumption that Amazon product data structure remains consistent
- Assumption that cron jobs run reliably for daily updates

## 3. System Features

### 3.1 Marketplace Selection
#### 3.1.1 Description
Users can select between Amazon US and Amazon UK marketplaces to view products available in their region with appropriate currency display.

#### 3.1.2 Requirements
- Radio button selection between US and UK marketplaces
- Visual indication of selected marketplace with flag icons
- Currency display appropriate to the selected marketplace ($ or £)
- Products should only appear in their respective marketplace sections

### 3.2 Advanced Filtering System
#### 3.2.1 Description
A comprehensive filtering system allowing users to narrow down dash cam options based on various criteria including brand, price range, rating, and specifications.

#### 3.2.2 Requirements
- Brand filter dropdown populated dynamically from available products
- Price range filters with minimum and maximum inputs
- Minimum rating filter with options for 3+, 3.5+, 4+, and 4.5+ stars
- Multi-select specification filters organized into categories:
  - Video: Resolution (4K, 1440p, 1080p), HDR, WDR, Night Vision
  - Physical: Field of View (140°+, 160°+), Dual Channel
  - Connectivity: WiFi, Bluetooth, GPS, Voice Control
  - Features: Parking Mode, Motion Detection, Loop Recording, Emergency Recording
- Selected filters displayed as removable tags
- Reset filters button to clear all selections
- Filter state reflected in URL parameters for shareable links

### 3.3 Search Functionality
#### 3.3.1 Description
Text search functionality allowing users to find products by searching across model names, brands, features, and specifications.

#### 3.3.2 Requirements
- Search input field with appropriate placeholder text
- Search across product model names, brands, and features
- Search within specification values
- Debounced search to prevent excessive filtering during typing
- Search term reflected in URL parameters

### 3.4 Product Display
#### 3.4.1 Description
A visually appealing and informative display of filtered products in a grid layout with detailed product cards.

#### 3.4.2 Requirements
- Grid layout optimized for different screen sizes
- Product cards with:
  - Product image
  - Brand and model name
  - Price with appropriate currency symbol
  - Rating displayed as stars with numerical value
  - Review count
  - Key specification badges (resolution, FOV, WiFi, GPS, etc.)
  - Expandable detailed specifications section
  - "View on Amazon" button linking to the appropriate marketplace
- Visual indication for unavailable products
- "NEW" badge for products released within the last 30 days
- Count of results displayed

### 3.5 Sorting Options
#### 3.5.1 Description
Options to sort the filtered products by different criteria.

#### 3.5.2 Requirements
- Sort by popularity (default)
- Sort by price (low to high and high to low)
- Sort by rating (high to low)
- Sort by release date (newest first)
- Sort selection reflected in URL parameters

### 3.6 Data Collection and Updates
#### 3.6.1 Description
Automated system to collect and update product data from Amazon using the Oxylabs E-Commerce Scraper API.

#### 3.6.2 Requirements
- Integration with Oxylabs E-Commerce Scraper API
- Script to scrape product data from specific Amazon product URLs
- Daily update process to refresh product data
- Backup system to preserve previous data
- Logging system for debugging and monitoring
- Fallback to cached data if API requests fail

### 3.7 SEO Optimization
#### 3.7.1 Description
Features to optimize the application for search engines and improve discoverability.

#### 3.7.2 Requirements
- Dynamic page titles based on selected filters
- Dynamic meta descriptions based on selected filters
- Structured data using Schema.org markup
- Canonical URLs to prevent duplicate content
- Sitemap.xml for search engine guidance
- Robots.txt for search engine crawling instructions

## 4. External Interface Requirements

### 4.1 User Interfaces
#### 4.1.1 Header
- Logo and site name
- Navigation links to other pages (Buying Guide)
- Responsive design that adapts to different screen sizes

#### 4.1.2 Filter Section
- Marketplace selection with flag icons
- Filter controls organized in a clean, intuitive layout
- Multi-select dropdown for specifications
- Selected filters displayed as removable tags

#### 4.1.3 Results Section
- Results count display
- Sorting controls
- Grid layout of product cards
- Responsive design that adjusts columns based on screen size

#### 4.1.4 Footer
- Affiliate disclosure
- Links to privacy policy and affiliate disclosure pages
- Contact information
- Copyright information

### 4.2 Software Interfaces
#### 4.2.1 Oxylabs E-Commerce Scraper API
- Authentication using username and password
- Request payload format for product and search scraping
- Response parsing for different data structures
- Error handling for API failures

#### 4.2.2 Amazon Affiliate Program
- Integration with Amazon affiliate links
- Proper disclosure of affiliate relationship
- Tracking of clicks and conversions

### 4.3 Hardware Interfaces
Not applicable as this is a web-based application.

### 4.4 Communication Interfaces
- HTTPS for secure communication
- RESTful API calls to Oxylabs E-Commerce Scraper API

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- Page load time under 2 seconds for initial load
- Filter operations should complete within 300ms
- Smooth scrolling and animations at 60fps
- Efficient DOM manipulation to prevent layout thrashing
- Optimized images for faster loading

### 5.2 Safety Requirements
- No collection of personal user data
- Transparent affiliate relationship disclosure
- No misleading information about products

### 5.3 Security Requirements
- Secure storage of API credentials using environment variables
- No exposure of sensitive information to client-side code
- Protection against common web vulnerabilities (XSS, CSRF)

### 5.4 Software Quality Attributes
#### 5.4.1 Reliability
- Fallback mechanisms for API failures
- Graceful degradation when features are not supported
- Consistent behavior across different browsers and devices

#### 5.4.2 Availability
- 99.9% uptime target
- Automated monitoring of system health
- Backup and recovery procedures

#### 5.4.3 Maintainability
- Well-structured and documented code
- Modular architecture for easier updates
- Comprehensive logging for debugging

#### 5.4.4 Portability
- Cross-browser compatibility
- Responsive design for different devices
- No dependencies on platform-specific features

### 5.5 Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Alternative text for images

## 6. Data Management

### 6.1 Data Storage
- Product data stored in JSON format
- Daily backups of product data
- Local storage cache for offline functionality

### 6.2 Data Processing
- Extraction of structured specifications from product descriptions
- Calculation of popularity scores based on ratings and review counts
- Merging of product data from different marketplaces

### 6.3 Data Retention
- Historical price data not currently retained
- Product data refreshed daily with previous day's backup

## 7. Future Enhancements

### 7.1 Short-term Improvements
- Dark mode toggle functionality
- Search functionality for all product text
- Product comparison feature to compare multiple dash cams side by side
- "Recently Viewed" section using localStorage
- User reviews section
- Privacy policy page
- Analytics tracking
- Image optimization for faster loading
- Lazy loading for product images
- Contact form

### 7.2 Long-term Architecture Evolution
- Move to a component-based framework (React, Vue, etc.)
- Implement server-side rendering for better SEO and performance
- Add a backend API for dynamic data retrieval
- Implement user accounts and saved preferences
- Add content management system for editorial content
- Implement analytics and personalization features
- Price history tracking and alerts

## 8. Appendices

### 8.1 Project Structure
```
dashcamfinder/
├── index.html                # Main application page with product comparison functionality
├── buying-guide.html         # Educational content about dash cam selection
├── affiliate-disclosure.html # Legal disclosure for affiliate relationships
├── privacy-policy.html       # Privacy policy page (to be implemented)
├── robots.txt                # Search engine crawling instructions
├── sitemap.xml               # Site structure for search engines
├── README.md                 # Project documentation
├── data/
│   ├── products.json         # Stored product data (updated daily)
│   └── products.backup.json  # Backup of product data
├── scripts/
│   ├── main.js               # Client-side functionality for filtering, sorting, and display
│   ├── filter-system.js      # Advanced filtering system implementation
│   ├── product-processor.js  # Processing of raw product data into structured specifications
│   ├── amazon-scraper.js     # Oxylabs API integration script
│   ├── update-products.js    # Script to update product data
│   ├── reset-products.js     # Script to reset product data using only PRODUCT_URLS
│   └── use-backup-data.js    # Script to restore from backup data
├── styles/
│   └── main.css              # Global styles with CSS variables and responsive design
└── cron/
    ├── daily-update.sh       # Shell script for daily updates
    └── setup-cron.sh         # Script to set up the cron job
```

### 8.2 Development Guidelines
- Task-based development approach
- Update todolist.md to reflect completed tasks
- Update memory.md to reflect the current state of the project
- Fix warnings and errors in the code
- Follow KISS and DRY principles
- Use environment variables for sensitive information
- Implement proper error handling for API requests
- Test API integrations with a variety of response formats

### 8.3 API Integration Guidelines
- Use zip/postal codes for geo_location parameter in Oxylabs API
- Handle API errors gracefully with appropriate error messages
- Log API responses for debugging purposes
- Implement robust property access paths with multiple fallback options
- Use type checking and validation when extracting data from API responses
- Implement fallback values for all extracted properties

### 8.4 Marketplace-Specific Filtering Guidelines
- Ensure products only appear in their respective marketplace sections
- Check if a product has the required data for a specific marketplace before displaying
- Implement proper filtering to exclude products that don't have data for the selected marketplace
- Maintain separate price and URL fields for each marketplace

### 8.5 Advanced Filtering Guidelines
- Use a structured approach for specification filtering with category:property:value format
- Implement checkbox dropdowns for multi-select filtering
- Group related specifications into logical categories
- Display selected filters as removable tags
- Include all selected specifications in URL parameters
- Update SEO metadata based on selected specifications
- Implement proper event delegation for dynamically added filter tags
- Use debouncing for filter operations that may be triggered frequently
