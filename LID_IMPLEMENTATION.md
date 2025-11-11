# WPPConnect Server LID Support Documentation

## Overview

This implementation adds Local ID (LID) support to resolve the "Lid is missing in chat table" error that occurs with modern WhatsApp Web when handling contacts with long phone numbers (>14 digits).

## Problem Solved

- **Error**: `Lid is missing in chat table`
- **Cause**: WhatsApp Web now requires LID format for contact IDs longer than 14 digits
- **Solution**: Automatic detection and proper formatting of LID vs standard contacts

## Key Components

### 1. Browser Configuration (`src/config.ts`)

Enhanced browser arguments for LID compatibility:

```javascript
browserArgs: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-features=VizDisplayCompositor',
  '--disable-blink-features=AutomationControlled',
  // ... other LID-compatible arguments
];
```

### 2. LID Helper Utilities (`src/util/lidHelper.ts`)

Core functions for LID support:

- **`isLidFormat(contact)`**: Detects if contact needs LID formatting
- **`formatContactForLid(contact, useLid?)`**: Formats contact with proper suffix
- **`prepareLidMessageOptions(to, options)`**: Prepares message options with LID support
- **`sendMessageWithLidRetry(...)`**: Retry mechanism for LID-related errors
- **`handleLidError(error, contact)`**: Error analysis and retry logic

### 3. Controller Integration (`src/controller/messageController.ts`)

Enhanced message sending with LID support:

```javascript
// Automatic LID detection and formatting
const messageOptions = prepareLidMessageOptions(to, options);
const result = await sendMessageWithLidRetry(
  sendFunction,
  originalTo,
  message,
  options
);
```

### 4. Type Definitions (`src/types/ServerOptions.ts`)

Extended configuration options:

```typescript
interface CreateOptions {
  whatsappVersion?: string;
  puppeteerOptions?: LaunchOptions;
  sessionTimeoutMs?: number;
  disableSpins?: boolean;
  disableWelcome?: boolean;
  // ... other LID-related options
}
```

## Contact Format Logic

### Standard Format (≤14 digits)

- **Input**: `1234567890`
- **Output**: `1234567890@c.us`
- **Use Case**: Regular phone numbers

### LID Format (>14 digits)

- **Input**: `123456789012345`
- **Output**: `123456789012345@lid`
- **Use Case**: Long international numbers, premium numbers

## API Usage

### Send Message with LID Support

```http
POST /api/{session}/send-message
Content-Type: application/json

{
  "phone": "123456789012345",
  "message": "Hello LID contact!",
  "isLid": true  // Optional: auto-detected if >14 digits
}
```

### Response Example

```json
{
  "success": true,
  "result": {
    "id": "message_id",
    "to": "123456789012345@lid",
    "timestamp": 1699721234
  }
}
```

## Testing

### Unit Tests

Run the LID helper function tests:

```bash
node testLidHelper.js
```

### Integration Tests

Test with real session (requires QR scan):

```bash
node simpleTest.js
```

## Configuration Examples

### Enable LID Support (Recommended)

```javascript
// config.ts
export const createConfig = {
  whatsappVersion: 'latest',
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-features=VizDisplayCompositor',
    // ... full LID-compatible args
  ],
  puppeteerOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};
```

### Legacy Mode (Standard Only)

```javascript
// For testing without LID support
export const legacyConfig = {
  whatsappVersion: '2.2412.54',
  browserArgs: ['--no-sandbox'],
  disableLidSupport: true, // Custom flag
};
```

## Error Handling

### Before LID Implementation

```
❌ Error: Lid is missing in chat table
   → Message failed for contact: 123456789012345@c.us
```

### After LID Implementation

```
✅ Success: Auto-detected LID format
   → Message sent to: 123456789012345@lid
   → Retry mechanism: 0/3 attempts needed
```

## Best Practices

1. **Auto-Detection**: Let the system detect LID vs standard format
2. **Explicit Override**: Use `isLid: true/false` only when necessary
3. **Error Monitoring**: Watch logs for LID-related patterns
4. **Testing**: Validate with both standard and LID format contacts

## Troubleshooting

### Common Issues

1. **Browser Not Starting**

   - Solution: Clear userDataDir folders, restart with LID-compatible args

2. **LID Detection False Positives**

   - Check: Ensure phone numbers are numeric and properly formatted

3. **Retry Loop**
   - Monitor: Check retry logic and error patterns in logs

### Debug Logging

Enable verbose logging to monitor LID behavior:

```javascript
// Add to config.ts
debug: true,
logLevel: 'verbose'
```

## Migration Guide

### From Non-LID to LID Support

1. Update configuration with LID-compatible browser args
2. Restart all WhatsApp sessions
3. Monitor logs for successful LID detection
4. Test with long phone numbers (>14 digits)

### Rollback Procedure

1. Revert browser arguments to previous configuration
2. Set `whatsappVersion` to a specific older version
3. Clear browser cache and restart

## Performance Impact

- **Minimal overhead**: LID detection is a simple string length check
- **Retry mechanism**: Only triggered on LID-specific errors
- **Memory usage**: Negligible additional memory for helper functions

## Security Considerations

- LID support doesn't change authentication or privacy
- Browser arguments are standard Puppeteer/Chrome flags
- Contact formatting happens client-side (no external calls)

## Version Compatibility

- **WPPConnect**: 2.8.6+
- **WhatsApp Web**: Latest (auto-updated)
- **Node.js**: 14+
- **Chrome**: Latest stable

---

## Summary

This LID implementation ensures your WPPConnect server remains compatible with modern WhatsApp Web requirements while maintaining backward compatibility with existing contacts. The automatic detection and retry mechanisms provide a robust solution for handling both standard and LID format contacts seamlessly.
