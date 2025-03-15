#!/usr/bin/env node
/**
 * Test script for Oxylabs residential proxies
 * This script tests the connection to Oxylabs residential proxies
 * by making a simple request to ip.oxylabs.io/location
 */

const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Get Oxylabs credentials from environment variables
const OXYLABS_PROXY_USERNAME = process.env.OXYLABS_PROXY_USERNAME;
const OXYLABS_PROXY_PASSWORD = process.env.OXYLABS_PROXY_PASSWORD;
const OXYLABS_PROXY_SERVER = process.env.OXYLABS_PROXY_SERVER;

// Check if proxy credentials are available
if (!OXYLABS_PROXY_USERNAME || !OXYLABS_PROXY_PASSWORD || !OXYLABS_PROXY_SERVER) {
  console.error('ERROR: Oxylabs proxy credentials not found in environment variables.');
  console.error('Please set OXYLABS_PROXY_USERNAME, OXYLABS_PROXY_PASSWORD, and OXYLABS_PROXY_SERVER in your .env file.');
  process.exit(1);
}

async function testProxy() {
  try {
    // Test with US country code
    const country = 'US';
    
    // Format: customer-USERNAME-cc-{country}:password@proxy
    const proxyUrl = `http://customer-${OXYLABS_PROXY_USERNAME}-cc-${country}:${OXYLABS_PROXY_PASSWORD}@${OXYLABS_PROXY_SERVER}`;
    console.log(`Using proxy URL: ${proxyUrl}`);
    
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    
    console.log('Making request to ip.oxylabs.io/location...');
    const response = await fetch('https://ip.oxylabs.io/location', {
      method: 'get',
      agent: proxyAgent,
      timeout: 30000 // 30 seconds timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.text();
    console.log('Response:', data);
    console.log('Proxy test successful!');
  } catch (error) {
    console.error('Error testing proxy:', error.message);
    process.exit(1);
  }
}

testProxy();
