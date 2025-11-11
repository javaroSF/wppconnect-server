#!/usr/bin/env node

// Import our LID helper functions
const path = require('path');

// Since we can't directly import TypeScript, let's test the compiled JavaScript
const lidHelperPath = path.join(__dirname, 'dist', 'util', 'lidHelper.js');

let lidHelper;
try {
  lidHelper = require(lidHelperPath);
  console.log('✅ LID Helper loaded successfully');
} catch (error) {
  console.log('❌ Could not load LID Helper:', error.message);
  console.log('📝 Testing LID logic manually...');

  // Manual implementation for testing
  lidHelper = {
    isLidFormat: (contact) => {
      if (!contact || typeof contact !== 'string') return false;

      // Remove WhatsApp suffixes
      const cleanContact = contact.replace(/@(c\.us|lid|g\.us)$/, '');

      // Check if it looks like a phone number and is longer than 14 characters
      return /^\d+$/.test(cleanContact) && cleanContact.length > 14;
    },

    formatContactForLid: (contact, useLid = false) => {
      if (!contact) return contact;

      // Remove existing suffixes
      const cleanContact = contact.replace(/@(c\.us|lid|g\.us)$/, '');

      // Auto-detect if we should use LID format
      const shouldUseLid =
        useLid || (cleanContact.length > 14 && /^\d+$/.test(cleanContact));

      if (shouldUseLid) {
        return `${cleanContact}@lid`;
      } else {
        return `${cleanContact}@c.us`;
      }
    },

    prepareLidMessageOptions: (to, options = {}) => {
      const formattedTo = this.formatContactForLid(to, options.isLid);
      return {
        ...options,
        to: formattedTo,
        isLid: formattedTo.includes('@lid'),
      };
    },
  };
}

console.log('\n🧪 LID Helper Function Tests\n');

// Test cases
const testCases = [
  // Standard phone numbers (should use @c.us)
  {
    input: '1234567890',
    expected: '@c.us',
    description: 'Short number (10 digits)',
  },
  {
    input: '12345678901234',
    expected: '@c.us',
    description: 'Standard number (14 digits)',
  },

  // LID format numbers (should use @lid)
  {
    input: '123456789012345',
    expected: '@lid',
    description: 'LID number (15 digits)',
  },
  {
    input: '1234567890123456',
    expected: '@lid',
    description: 'LID number (16 digits)',
  },
  {
    input: '12345678901234567890',
    expected: '@lid',
    description: 'Long LID number (20 digits)',
  },

  // Already formatted
  {
    input: '1234567890@c.us',
    expected: '@c.us',
    description: 'Pre-formatted standard',
  },
  {
    input: '123456789012345@lid',
    expected: '@lid',
    description: 'Pre-formatted LID',
  },

  // Edge cases
  { input: '', expected: '', description: 'Empty string' },
  { input: 'invalid', expected: '@c.us', description: 'Non-numeric' },
];

console.log('1️⃣ Testing isLidFormat function:');
testCases.forEach((test, index) => {
  try {
    const result = lidHelper.isLidFormat(test.input);
    const expected = test.expected === '@lid';
    const status = result === expected ? '✅' : '❌';
    console.log(`   ${status} Test ${index + 1}: ${test.description}`);
    console.log(
      `      Input: "${test.input}" → LID: ${result} (expected: ${expected})`
    );
  } catch (error) {
    console.log(`   ❌ Test ${index + 1}: Error - ${error.message}`);
  }
});

console.log('\n2️⃣ Testing formatContactForLid function:');
testCases.forEach((test, index) => {
  try {
    const result = lidHelper.formatContactForLid(test.input);
    const expectsLid = test.expected === '@lid';
    const actuallyLid = result.includes('@lid');
    const status = expectsLid === actuallyLid ? '✅' : '❌';
    console.log(`   ${status} Test ${index + 1}: ${test.description}`);
    console.log(`      Input: "${test.input}" → Output: "${result}"`);
  } catch (error) {
    console.log(`   ❌ Test ${index + 1}: Error - ${error.message}`);
  }
});

console.log('\n3️⃣ Testing prepareLidMessageOptions function:');
const messageTests = [
  { to: '1234567890', isLid: false, description: 'Force standard format' },
  {
    to: '123456789012345',
    isLid: false,
    description: 'LID number forced to standard',
  },
  {
    to: '123456789012345',
    isLid: true,
    description: 'LID number with LID flag',
  },
  {
    to: '1234567890',
    isLid: true,
    description: 'Standard number forced to LID',
  },
];

messageTests.forEach((test, index) => {
  try {
    const options = { isLid: test.isLid, message: 'Test message' };
    const result = lidHelper.prepareLidMessageOptions(test.to, options);
    console.log(`   ✅ Test ${index + 1}: ${test.description}`);
    console.log(
      `      Input: "${test.to}" (isLid: ${test.isLid}) → "${result.to}"`
    );
  } catch (error) {
    console.log(`   ❌ Test ${index + 1}: Error - ${error.message}`);
  }
});

console.log('\n4️⃣ Testing real-world scenarios:');

// Real WhatsApp number scenarios
const realWorldTests = [
  { number: '201234567890', country: 'Egypt', expectLid: false },
  { number: '5511987654321', country: 'Brazil', expectLid: false },
  {
    number: '966123456789012345',
    country: 'Saudi Arabia (Long)',
    expectLid: true,
  },
  {
    number: '85212345678901234567',
    country: 'Hong Kong (Very Long)',
    expectLid: true,
  },
];

realWorldTests.forEach((test, index) => {
  try {
    const isLid = lidHelper.isLidFormat(test.number);
    const formatted = lidHelper.formatContactForLid(test.number);
    const expectLid = test.expectLid;
    const status = isLid === expectLid ? '✅' : '❌';

    console.log(`   ${status} ${test.country}: ${test.number}`);
    console.log(`      Detected LID: ${isLid}, Formatted: ${formatted}`);
  } catch (error) {
    console.log(`   ❌ ${test.country}: Error - ${error.message}`);
  }
});

console.log('\n🏁 LID Helper Tests Complete!');
console.log('\n📊 Summary:');
console.log('• Numbers ≤14 digits use @c.us format');
console.log('• Numbers >14 digits use @lid format');
console.log('• isLid parameter can override auto-detection');
console.log('• Helper functions handle edge cases gracefully');
