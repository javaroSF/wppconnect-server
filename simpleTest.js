#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:21465/api';
const TEST_SESSION = 'testLID';
const TEST_PHONE = '1234567890123456'; // LID format (>14 digits)

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testLIDFunctionality() {
  console.log('🧪 Simple LID Test Starting...');

  try {
    // 1. Start session
    console.log('\n1️⃣ Starting test session...');
    try {
      const startResponse = await axios.post(
        `${API_BASE}/${TEST_SESSION}/start-session`,
        {},
        {
          timeout: 30000,
        }
      );
      console.log(`✅ Session start response: ${startResponse.status}`);
    } catch (error) {
      console.log(
        `⚠️ Session start: ${error.response?.status || error.message}`
      );
    }

    // Wait for session to initialize
    console.log('\n⏳ Waiting for session to initialize...');
    await wait(10000);

    // 2. Check session status
    console.log('\n2️⃣ Checking session status...');
    try {
      const statusResponse = await axios.get(
        `${API_BASE}/${TEST_SESSION}/status`,
        {
          timeout: 10000,
        }
      );
      console.log('📱 Session status:', statusResponse.data);

      if (statusResponse.data.status !== 'ready') {
        console.log('⚠️ Session not ready, cannot test messaging');
        return;
      }
    } catch (error) {
      console.log(
        `❌ Status check failed: ${error.response?.status || error.message}`
      );
      return;
    }

    // 3. Test standard message format
    console.log('\n3️⃣ Testing standard format (isLid=false)...');
    try {
      const standardResponse = await axios.post(
        `${API_BASE}/${TEST_SESSION}/send-message`,
        {
          phone: TEST_PHONE,
          message: 'Test message with standard format',
          isLid: false,
        },
        {
          timeout: 10000,
        }
      );
      console.log('✅ Standard format success:', standardResponse.data);
    } catch (error) {
      console.log(
        `❌ Standard format failed: ${error.response?.data || error.message}`
      );
    }

    // 4. Test LID message format
    console.log('\n4️⃣ Testing LID format (isLid=true)...');
    try {
      const lidResponse = await axios.post(
        `${API_BASE}/${TEST_SESSION}/send-message`,
        {
          phone: TEST_PHONE,
          message: 'Test message with LID format',
          isLid: true,
        },
        {
          timeout: 10000,
        }
      );
      console.log('✅ LID format success:', lidResponse.data);
    } catch (error) {
      console.log(
        `❌ LID format failed: ${error.response?.data || error.message}`
      );
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n🏁 Simple LID Test Complete');
}

// Run the test
testLIDFunctionality().catch(console.error);
