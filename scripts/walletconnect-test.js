#!/usr/bin/env node

/**
 * WalletConnect Configuration Validator
 * Validates the WalletConnect project ID and configuration
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
let projectId = null;

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=(.+)/);
    if (match) {
        projectId = match[1].trim();
    }
} catch (error) {
    console.error('❌ Could not read .env.local file');
}

console.log('🔍 WalletConnect Configuration Validator');
console.log('==========================================');

if (!projectId) {
    console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local');
    process.exit(1);
}

console.log(`📋 Project ID: ${projectId}`);

// Validate project ID format
if (projectId.length !== 32) {
    console.warn(`⚠️  Project ID length is ${projectId.length}, expected 32 characters`);
}

// Test WalletConnect API endpoint
const testUrl = `https://api.web3modal.org/getProjects?projectId=${projectId}`;
console.log(`🌐 Testing WalletConnect API: ${testUrl}`);

https.get(testUrl, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ WalletConnect API is accessible');
            console.log('✅ Project ID appears to be valid');
        } else if (res.statusCode === 403) {
            console.error('❌ 403 Forbidden - Project ID is invalid or restricted');
            console.log('💡 Please create a new project at: https://cloud.walletconnect.com/');
        } else if (res.statusCode === 404) {
            console.error('❌ 404 Not Found - Project ID does not exist');
            console.log('💡 Please create a new project at: https://cloud.walletconnect.com/');
        } else {
            console.error(`❌ Unexpected response: ${res.statusCode}`);
            console.log(`Response: ${data}`);
        }
        
        // Recommendations
        console.log('\n🛠️  Recommendations:');
        console.log('1. Create a new project at https://cloud.walletconnect.com/');
        console.log('2. Add your domain to the allowed origins');
        console.log('3. Update NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local');
        console.log('4. Restart your development server');
    });
}).on('error', (err) => {
    console.error('❌ Network error:', err.message);
    console.log('💡 Check your internet connection');
});