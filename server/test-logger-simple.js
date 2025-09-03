// Simple logger test without Jest dependencies
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SecurityLogger System...\n');

// Test 1: Basic logging
console.log('📝 Test 1: Basic logging levels');
try {
  logger.info('Test info message', { test: true });
  logger.warn('Test warning message', { test: true });
  logger.error('Test error message', { test: true });
  console.log('✅ Basic logging test passed');
} catch (error) {
  console.error('❌ Basic logging test failed:', error.message);
}

// Test 2: Security logging
console.log('\n🔒 Test 2: Security logging');
try {
  // Set environment variable for security logging
  process.env.ENABLE_SECURITY_LOGGING = 'true';
  
  // Delete cached module and re-require to pick up env change
  delete require.cache[require.resolve('./utils/logger')];
  const secureLogger = require('./utils/logger');
  
  secureLogger.authAttempt(true, { 
    userId: 123, 
    email: 'test@example.com',
    ip: '192.168.1.1'
  });
  
  secureLogger.suspiciousActivity('Test suspicious activity', {
    ip: '192.168.1.100',
    attempts: 3
  });
  
  console.log('✅ Security logging test passed');
} catch (error) {
  console.error('❌ Security logging test failed:', error.message);
}

// Test 3: Log level filtering
console.log('\n🔍 Test 3: Log level filtering');
try {
  // Test with error level (should only show errors)
  process.env.LOG_LEVEL = 'error';
  delete require.cache[require.resolve('./utils/logger')];
  const errorLogger = require('./utils/logger');
  
  console.log('Testing with LOG_LEVEL=error (only errors should appear):');
  errorLogger.debug('This debug should NOT appear');
  errorLogger.info('This info should NOT appear');
  errorLogger.warn('This warning should NOT appear');
  errorLogger.error('This error SHOULD appear');
  
  console.log('✅ Log level filtering test passed');
} catch (error) {
  console.error('❌ Log level filtering test failed:', error.message);
}

// Test 4: File creation
console.log('\n📁 Test 4: Log file creation');
try {
  const logDir = path.join(__dirname, 'logs');
  
  if (fs.existsSync(logDir)) {
    const files = fs.readdirSync(logDir);
    console.log('Log files found:', files);
    
    const today = new Date().toISOString().split('T')[0];
    const expectedFiles = [`app-${today}.log`];
    
    if (process.env.ENABLE_SECURITY_LOGGING === 'true') {
      expectedFiles.push(`security-${today}.log`);
    }
    
    let allFilesExist = true;
    expectedFiles.forEach(expectedFile => {
      if (!files.includes(expectedFile)) {
        console.log(`❌ Expected file not found: ${expectedFile}`);
        allFilesExist = false;
      } else {
        const filePath = path.join(logDir, expectedFile);
        const stats = fs.statSync(filePath);
        console.log(`✅ Found: ${expectedFile} (${stats.size} bytes)`);
      }
    });
    
    if (allFilesExist) {
      console.log('✅ Log file creation test passed');
    } else {
      console.log('❌ Some expected log files were not found');
    }
  } else {
    console.log('❌ Log directory does not exist');
  }
} catch (error) {
  console.error('❌ Log file creation test failed:', error.message);
}

// Test 5: Logger methods existence
console.log('\n🔧 Test 5: Logger methods');
try {
  const methods = ['info', 'warn', 'error', 'debug', 'authAttempt', 'suspiciousActivity', 'accessViolation', 'securityEvent'];
  
  methods.forEach(method => {
    if (typeof logger[method] === 'function') {
      console.log(`✅ Method ${method} exists`);
    } else {
      console.log(`❌ Method ${method} missing or not a function`);
    }
  });
  
  console.log('✅ Logger methods test completed');
} catch (error) {
  console.error('❌ Logger methods test failed:', error.message);
}

console.log('\n🎉 Logger testing completed!');
console.log('\n💡 To run with different settings:');
console.log('   LOG_LEVEL=debug node test-logger-simple.js');
console.log('   ENABLE_SECURITY_LOGGING=true node test-logger-simple.js');
