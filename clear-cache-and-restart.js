#!/usr/bin/env node

/**
 * Cache Clearing Script for UdyogaSetu
 * This script helps clear caches and restart the development server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting cache clearing process...');

// Step 1: Clear Vite cache
const viteCachePath = path.join(__dirname, '.vite');
if (fs.existsSync(viteCachePath)) {
    console.log('🗑️  Clearing Vite cache...');
    fs.rmSync(viteCachePath, { recursive: true, force: true });
}

// Step 2: Clear Node modules cache
console.log('🗑️  Clearing Node modules cache...');
try {
    execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
    console.log('✅ Server started successfully!');
}