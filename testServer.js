const { create, Whatsapp } = require('@wppconnect-team/wppconnect');
const express = require('express');

const app = express();
app.use(express.json());

let client = null;

// Simple session creation with LID support
async function createSession() {
  try {
    console.log('🚀 Creating session with LID support...');

    client = await create({
      session: 'testLID',
      headless: true,
      devtools: false,
      debug: false,
      logQR: true,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
      puppeteerOptions: {
        executablePath: undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    console.log('✅ Session created successfully');
    return client;
  } catch (error) {
    console.error('❌ Session creation failed:', error.message);
    throw error;
  }
}

// Test message sending with different formats
app.post('/test-message', async (req, res) => {
  try {
    if (!client) {
      return res.status(400).json({ error: 'Session not ready' });
    }

    const { phone, message, isLid = false } = req.body;

    console.log(`📱 Testing message: ${phone} (LID: ${isLid})`);

    // Format contact based on isLid parameter
    let formattedPhone;
    if (isLid || phone.length > 14) {
      formattedPhone = `${phone}@lid`;
    } else {
      formattedPhone = `${phone}@c.us`;
    }

    console.log(`📞 Formatted contact: ${formattedPhone}`);

    // Send message
    const result = await client.sendText(formattedPhone, message);

    res.json({
      success: true,
      result,
      format: formattedPhone,
    });
  } catch (error) {
    console.error('❌ Message send error:', error.message);
    res.status(500).json({
      error: error.message,
      details: error.stack,
    });
  }
});

// Status endpoint
app.get('/status', async (req, res) => {
  try {
    if (!client) {
      return res.json({ status: 'disconnected' });
    }

    const isConnected = await client.isConnected();
    const hasActiveSession = await client.getSessionTokenBrowser();

    res.json({
      status: isConnected ? 'connected' : 'disconnected',
      hasSession: !!hasActiveSession,
      ready: isConnected && !!hasActiveSession,
    });
  } catch (error) {
    res.json({
      status: 'error',
      error: error.message,
    });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, async () => {
  console.log(`🌐 Test server running on port ${PORT}`);

  try {
    await createSession();
    console.log('🎉 Ready for testing!');
    console.log('📋 Test endpoints:');
    console.log(`   GET  http://localhost:${PORT}/status`);
    console.log(`   POST http://localhost:${PORT}/test-message`);
  } catch (error) {
    console.error('💥 Failed to initialize:', error.message);
  }
});
