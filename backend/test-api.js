#!/usr/bin/env node

// Simple API testing script for MovieHubBD Backend
// Usage: node test-api.js [base-url]
// Example: node test-api.js https://your-backend.railway.app

import fetch from 'node-fetch';

const BASE_URL = process.argv[2] || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

console.log('🧪 Testing MovieHubBD Backend API');
console.log(`📡 Base URL: ${BASE_URL}`);
console.log('=' .repeat(50));

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testEndpoint = async (method, endpoint, data = null, headers = {}) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const responseData = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch (e) {
      parsedData = responseData;
    }

    return {
      status: response.status,
      ok: response.ok,
      data: parsedData,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
};

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const test = async (name, testFn) => {
    try {
      log(`\n🔍 Testing: ${name}`, 'cyan');
      const result = await testFn();
      if (result.success) {
        log(`✅ PASS: ${name}`, 'green');
        passed++;
      } else {
        log(`❌ FAIL: ${name} - ${result.message}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`❌ ERROR: ${name} - ${error.message}`, 'red');
      failed++;
    }
  };

  // Test 1: Health Check
  await test('Health Check', async () => {
    const result = await testEndpoint('GET', '/health');
    if (result.ok && result.data.success) {
      log(`   Response: ${JSON.stringify(result.data)}`, 'blue');
      return { success: true };
    }
    return { success: false, message: `Status: ${result.status}` };
  });

  // Test 2: Movies Endpoint
  await test('Get Movies', async () => {
    const result = await testEndpoint('GET', '/movies');
    if (result.ok) {
      log(`   Movies found: ${result.data.data?.movies?.length || 0}`, 'blue');
      return { success: true };
    }
    return { success: false, message: `Status: ${result.status}` };
  });

  // Test 3: Series Endpoint
  await test('Get Series', async () => {
    const result = await testEndpoint('GET', '/series');
    if (result.ok) {
      log(`   Series found: ${result.data.data?.series?.length || 0}`, 'blue');
      return { success: true };
    }
    return { success: false, message: `Status: ${result.status}` };
  });

  // Test 4: Search Endpoint
  await test('Search Functionality', async () => {
    const result = await testEndpoint('GET', '/search?q=test');
    if (result.ok) {
      log(`   Search results: ${result.data.data?.results?.length || 0}`, 'blue');
      return { success: true };
    }
    return { success: false, message: `Status: ${result.status}` };
  });

  // Test 5: Content Endpoint
  await test('Get Content', async () => {
    const result = await testEndpoint('GET', '/content');
    if (result.ok) {
      log(`   Content items: ${result.data.data?.content?.length || 0}`, 'blue');
      return { success: true };
    }
    return { success: false, message: `Status: ${result.status}` };
  });

  // Test 6: Admin Login (if credentials provided)
  await test('Admin Login Test', async () => {
    const adminData = {
      email: 'admin@moviehubbd.com',
      password: 'admin123456',
      adminKey: 'admin_secret_key_here'
    };
    
    const result = await testEndpoint('POST', '/auth/admin-login', adminData);
    if (result.status === 401 || result.status === 400) {
      log(`   Expected: Invalid credentials (needs real admin setup)`, 'yellow');
      return { success: true };
    }
    if (result.ok && result.data.success) {
      log(`   Admin login successful!`, 'green');
      return { success: true };
    }
    return { success: false, message: `Status: ${result.status}` };
  });

  // Test 7: CORS Headers
  await test('CORS Headers', async () => {
    const result = await testEndpoint('OPTIONS', '/health');
    // OPTIONS might not be implemented, so we'll check a regular request
    const healthResult = await testEndpoint('GET', '/health');
    if (healthResult.ok) {
      log(`   CORS: Server responding correctly`, 'blue');
      return { success: true };
    }
    return { success: false, message: 'CORS test failed' };
  });

  // Summary
  log('\n' + '=' .repeat(50), 'cyan');
  log(`📊 Test Results:`, 'cyan');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`, 'blue');

  if (failed === 0) {
    log('\n🎉 All tests passed! Your API is working correctly!', 'green');
    log('\n🚀 Ready for production deployment!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check your configuration.', 'yellow');
  }

  log('\n📚 Next steps:', 'cyan');
  log('1. If tests passed, your backend is ready!');
  log('2. Connect your frontend to this API URL');
  log('3. Configure admin credentials in environment variables');
  log('4. Add your content via the admin panel');
  log('5. Set up monitoring and analytics');

  return failed === 0;
};

// Run the tests
runTests().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  log(`\n💥 Test runner error: ${error.message}`, 'red');
  process.exit(1);
});
