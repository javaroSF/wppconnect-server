#!/usr/bin/env node

/**
 * LID Test Script - Test LID functionality with different contact formats
 * Usage: node lidTest.js [session] [contact] [message]
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:21465';
const SESSION = process.argv[2] || 'Laila_88043e21f8da';
const CONTACT = process.argv[3] || '1234567890123456'; // Long contact for LID testing
const MESSAGE = process.argv[4] || 'LID Test Message';

async function testLidMessage() {
  console.log('🧪 Starting LID Message Test');
  console.log(`📱 Session: ${SESSION}`);
  console.log(`👤 Contact: ${CONTACT}`);
  console.log(`💬 Message: ${MESSAGE}`);
  console.log('');

  // Test 1: Send with isLid=false (standard format)
  console.log('Test 1: Sending with isLid=false (standard format)');
  try {
    const response1 = await axios.post(`${BASE_URL}/${SESSION}/send-message`, {
      phone: [CONTACT],
      message: MESSAGE + ' - Standard Format',
      isLid: false,
    });
    console.log('✅ Standard format success:', response1.data);
  } catch (error) {
    console.log(
      '❌ Standard format failed:',
      error.response?.data || error.message
    );
  }

  console.log('');

  // Test 2: Send with isLid=true (LID format)
  console.log('Test 2: Sending with isLid=true (LID format)');
  try {
    const response2 = await axios.post(`${BASE_URL}/${SESSION}/send-message`, {
      phone: [CONTACT],
      message: MESSAGE + ' - LID Format',
      isLid: true,
    });
    console.log('✅ LID format success:', response2.data);
  } catch (error) {
    console.log('❌ LID format failed:', error.response?.data || error.message);
  }

  console.log('');

  // Test 3: Check session status
  console.log('Test 3: Checking session status');
  try {
    const statusResponse = await axios.get(
      `${BASE_URL}/${SESSION}/check-connection-session`
    );
    console.log('📊 Session status:', statusResponse.data);
  } catch (error) {
    console.log(
      '❌ Status check failed:',
      error.response?.data || error.message
    );
  }

  console.log('');
  console.log('🏁 LID Test Complete');
}

// Run the test
testLidMessage().catch(console.error);
