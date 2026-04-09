/**
 * Helper functions for handling LID (Local ID) in WhatsApp messaging
 */

/**
 * Check if a contact ID appears to be a LID format
 */
export function isLidFormat(contactId: string): boolean {
  // LID format contains @lid suffix
  return contactId.includes('@lid');
}

/**
 * Format contact ID for LID support
 */
export function formatContactForLid(
  contactId: string,
  forceLid: boolean = false
): string {
  // Remove any existing suffixes
  const cleanId = contactId.replace(/@c\.us|@lid/g, '');

  // If forcing LID or contact appears to be LID format
  if (forceLid || isLidFormat(cleanId)) {
    return `${cleanId}@lid`;
  }

  // Use standard format for regular contacts
  return `${cleanId}@c.us`;
}

/**
 * Prepare message options with LID support
 */
export function prepareLidMessageOptions(to: string, options: any = {}) {
  const isLidContact = isLidFormat(to);

  return {
    ...options,
  };
}

/**
 * Error handler for LID-related issues
 */
export function handleLidError(
  error: Error,
  contactId: string
): {
  shouldRetry: boolean;
  newContactId?: string;
  error: string;
} {
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('lid is missing')) {
    // Try with LID format
    return {
      shouldRetry: true,
      newContactId: formatContactForLid(contactId, true),
      error: 'Retrying with LID format',
    };
  }

  if (errorMessage.includes('chat not found') && contactId.includes('@lid')) {
    // Try with standard format
    return {
      shouldRetry: true,
      newContactId: formatContactForLid(contactId.replace('@lid', ''), false),
      error: 'Retrying with standard format',
    };
  }

  return {
    shouldRetry: false,
    error: error.message,
  };
}

/**
 * Retry mechanism for LID-related message sending
 */
export async function sendMessageWithLidRetry(
  sendFunction: (to: string, message: string, options?: any) => Promise<any>,
  originalTo: string,
  message: string,
  options: any = {},
  maxRetries: number = 2
): Promise<any> {
  let lastError: Error = new Error('No attempts made');
  let currentTo = originalTo;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const messageOptions = prepareLidMessageOptions(currentTo, options);
      return await sendFunction(currentTo, message, messageOptions);
    } catch (error) {
      lastError = error as Error;
      const retryInfo = handleLidError(lastError, currentTo);

      if (
        retryInfo.shouldRetry &&
        retryInfo.newContactId &&
        attempt < maxRetries - 1
      ) {
        currentTo = retryInfo.newContactId;
        console.warn(`LID retry attempt ${attempt + 1}: ${retryInfo.error}`);
        continue;
      }

      break;
    }
  }

  throw new Error(
    `Failed to send message after ${maxRetries} attempts. Last error: ${lastError.message}`
  );
}
