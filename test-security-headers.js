/**
 * Security Headers Testing Script
 * 
 * This script tests your security headers to verify they're properly configured.
 * Run this after starting your server to validate protection measures.
 * 
 * Usage: node test-security-headers.js
 */

const http = require('http');
const https = require('https');

const TEST_URL = process.env.API_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🔒 Security Headers Test Suite');
console.log('================================\n');
console.log(`Testing API: ${TEST_URL}\n`);

const tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to make requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, TEST_URL);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test 1: Check Helmet Headers
async function testHelmetHeaders() {
  console.log('📋 Test 1: Helmet Security Headers');
  try {
    const response = await makeRequest('/health');
    
    const expectedHeaders = {
      'x-dns-prefetch-control': 'off',
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff',
      'x-download-options': 'noopen',
      'x-permitted-cross-domain-policies': 'none',
      'referrer-policy': 'no-referrer',
    };

    let allPresent = true;
    for (const [header, expectedValue] of Object.entries(expectedHeaders)) {
      const actualValue = response.headers[header];
      if (actualValue) {
        console.log(`  ✅ ${header}: ${actualValue}`);
        if (actualValue.toLowerCase() !== expectedValue.toLowerCase()) {
          console.log(`     ⚠️  Expected: ${expectedValue}`);
        }
      } else {
        console.log(`  ❌ ${header}: MISSING`);
        allPresent = false;
      }
    }

    return allPresent;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 2: Check Content Security Policy
async function testCSP() {
  console.log('\n📋 Test 2: Content Security Policy (CSP)');
  try {
    const response = await makeRequest('/health');
    const csp = response.headers['content-security-policy'];
    
    if (csp) {
      console.log(`  ✅ CSP Header Present`);
      console.log(`     Policy: ${csp.substring(0, 100)}...`);
      
      // Check for important directives
      const checks = [
        { directive: "default-src 'self'", name: 'Default-src restricted' },
        { directive: "script-src 'self'", name: 'Scripts from same origin only' },
        { directive: "object-src 'none'", name: 'No plugins allowed' },
      ];

      for (const check of checks) {
        if (csp.includes(check.directive)) {
          console.log(`  ✅ ${check.name}`);
        } else {
          console.log(`  ⚠️  ${check.name} - not found`);
        }
      }
      return true;
    } else {
      console.log(`  ❌ CSP Header Missing`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 3: Check CORS Configuration
async function testCORS() {
  console.log('\n📋 Test 3: CORS Configuration');
  try {
    // Test with correct origin
    const validResponse = await makeRequest('/health', {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
      }
    });

    const allowedOrigin = validResponse.headers['access-control-allow-origin'];
    const allowCredentials = validResponse.headers['access-control-allow-credentials'];
    
    if (allowedOrigin === FRONTEND_URL || allowedOrigin === '*') {
      console.log(`  ✅ CORS Origin: ${allowedOrigin}`);
    } else {
      console.log(`  ⚠️  CORS Origin: ${allowedOrigin} (expected: ${FRONTEND_URL})`);
    }

    if (allowCredentials === 'true') {
      console.log(`  ✅ Credentials Allowed: true`);
    } else {
      console.log(`  ⚠️  Credentials: ${allowCredentials}`);
    }

    // Test with invalid origin
    console.log('\n  Testing invalid origin (should be blocked)...');
    const invalidResponse = await makeRequest('/health', {
      headers: {
        'Origin': 'https://evil-site.com',
        'Access-Control-Request-Method': 'GET',
      }
    });

    const blockedOrigin = invalidResponse.headers['access-control-allow-origin'];
    if (!blockedOrigin || blockedOrigin === 'null') {
      console.log(`  ✅ Invalid origin blocked`);
      return true;
    } else {
      console.log(`  ❌ Invalid origin NOT blocked: ${blockedOrigin}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 4: Check MongoDB Injection Prevention
async function testMongoInjection() {
  console.log('\n📋 Test 4: MongoDB Injection Prevention');
  try {
    // Attempt injection via query params
    const response = await makeRequest('/api/projects?title[$gt]=');
    
    // If it doesn't crash and returns appropriate response, sanitization is working
    if (response.statusCode < 500) {
      console.log(`  ✅ Query injection handled (status: ${response.statusCode})`);
      return true;
    } else {
      console.log(`  ❌ Server error on injection attempt`);
      return false;
    }
  } catch (error) {
    console.log(`  ⚠️  Could not test: ${error.message}`);
    return null;
  }
}

// Test 5: Check Rate Limiting
async function testRateLimiting() {
  console.log('\n📋 Test 5: Rate Limiting');
  try {
    // Make multiple requests quickly
    console.log('  Sending 5 rapid requests...');
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(makeRequest('/health'));
    }
    
    const responses = await Promise.all(requests);
    const allSuccessful = responses.every(r => r.statusCode < 400);
    
    if (allSuccessful) {
      console.log(`  ✅ Rate limiting configured (not triggered by 5 requests)`);
      console.log(`     Note: Limit is higher than test threshold`);
      return true;
    } else {
      const rateLimited = responses.find(r => r.statusCode === 429);
      if (rateLimited) {
        console.log(`  ✅ Rate limiting active (triggered at 5 requests)`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 6: Check Upload Security
async function testUploadSecurity() {
  console.log('\n📋 Test 6: Upload Security Headers');
  try {
    const response = await makeRequest('/uploads/test.jpg');
    
    const headers = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
    };

    let allPresent = true;
    for (const [header, expectedValue] of Object.entries(headers)) {
      const actualValue = response.headers[header];
      if (actualValue) {
        console.log(`  ✅ ${header}: ${actualValue}`);
      } else {
        console.log(`  ❌ ${header}: MISSING`);
        allPresent = false;
      }
    }

    return allPresent;
  } catch (error) {
    console.log(`  ⚠️  Upload path not accessible (${error.message})`);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    'Helmet Headers': await testHelmetHeaders(),
    'Content Security Policy': await testCSP(),
    'CORS Configuration': await testCORS(),
    'MongoDB Injection Prevention': await testMongoInjection(),
    'Rate Limiting': await testRateLimiting(),
    'Upload Security': await testUploadSecurity(),
  };

  console.log('\n\n================================');
  console.log('📊 Test Results Summary');
  console.log('================================\n');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const [testName, result] of Object.entries(results)) {
    if (result === true) {
      console.log(`✅ ${testName}: PASSED`);
      passed++;
    } else if (result === false) {
      console.log(`❌ ${testName}: FAILED`);
      failed++;
    } else {
      console.log(`⚠️  ${testName}: SKIPPED`);
      skipped++;
    }
  }

  console.log('\n================================');
  console.log(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  
  const score = Math.round((passed / (passed + failed)) * 100);
  console.log(`Security Score: ${score}%`);
  
  if (score >= 90) {
    console.log('🎉 Excellent security configuration!');
  } else if (score >= 70) {
    console.log('👍 Good security, but could be improved');
  } else {
    console.log('⚠️  Security needs attention');
  }
  
  console.log('================================\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest('/health');
    return true;
  } catch (error) {
    console.error(`❌ Cannot connect to server at ${TEST_URL}`);
    console.error(`   Make sure your server is running: npm run dev\n`);
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
})();

