#!/usr/bin/env node

const express = require('express');
const app = express();
const port = 8087;

// Middleware to parse JSON
app.use(express.json());

// Webhook endpoint
app.post('/whatsappService/api/wpp/webhook', (req, res) => {
  console.log('Received webhook:', {
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body,
  });

  // Always return success
  res.status(200).json({
    status: 'success',
    message: 'Webhook received successfully',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', port: port });
});

app.listen(port, () => {
  console.log(`Test webhook server running at http://localhost:${port}`);
  console.log(
    `Webhook endpoint: http://localhost:${port}/whatsappService/api/wpp/webhook`
  );
  console.log(`Health check: http://localhost:${port}/health`);
});
