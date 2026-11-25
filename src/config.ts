import dotenv from 'dotenv';

import { ServerOptions } from './types/ServerOptions';

// Loading is optional; deployment environment variables keep precedence.
dotenv.config({ override: false });
const env = process.env;

function envNumber(name: string, fallback: number): number {
  const value = env[name];
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envJsonHeaders(name: string): Record<string, string> {
  const value = env[name];
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      Object.values(parsed).every((header) => typeof header === 'string')
    )
      return parsed as Record<string, string>;
  } catch {
    // Invalid local configuration must not prevent the server from starting.
  }
  return {};
}

export default {
  secretKey: env.SECRET_KEY || 'THISISMYSECURETOKEN',
  host: env.HOST || 'http://localhost',
  port: env.PORT || '21465',
  deviceName: 'WppConnect',
  poweredBy: 'WPPConnect-Server',
  startAllSession: true,
  tokenStoreType: env.TOKEN_STORE_TYPE || 'file',
  tokenStorePath: env.TOKEN_STORE_PATH || './.flowz-dev/tokens',
  maxListeners: envNumber('MAX_LISTENERS', 15),
  customUserDataDir: env.CUSTOM_USER_DATA_DIR || './.flowz-dev/userDataDir/',
  sessionTimeoutMs: 30000,
  disableSpins: true,
  disableWelcome: true,
  webhook: {
    url: env.WEBHOOK_URL || null,
    allowedUrls: (env.WEBHOOK_ALLOWED_URLS || '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean),
    autoDownload: false,
    retryAttempts: envNumber('WEBHOOK_RETRY_ATTEMPTS', 3),
    retryDelay: envNumber('WEBHOOK_RETRY_DELAY', 5000),
    requestTimeout: envNumber('WEBHOOK_REQUEST_TIMEOUT', 30000),
    // Bytes; media larger than this is not inlined as base64 (0 = no limit).
    autoDownloadMaxSize: envNumber('WEBHOOK_AUTO_DOWNLOAD_MAX_SIZE', 0),
    uploadS3: false,
    readMessage: true,
    allUnreadOnStart: false,
    listenAcks: true,
    onPresenceChanged: true,
    onParticipantsChanged: true,
    onReactionMessage: true,
    onPollResponse: true,
    onRevokedMessage: true,
    onLabelUpdated: true,
    onSelfMessage: true,
    ignore: ['status@broadcast'],
    headers: envJsonHeaders('WEBHOOK_HEADERS_JSON'),
  },
  websocket: {
    autoDownload: false,
    uploadS3: false,
  },
  chatwoot: {
    allowedUrls: (env.CHATWOOT_ALLOWED_URLS || '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean),
    sendQrCode: true,
    sendStatus: true,
  },
  archive: {
    enable: false,
    waitTime: 10,
    daysToArchive: 45,
  },
  log: {
    level: 'silly', // Before open a issue, change level to silly and retry a action
    logger: ['console', 'file'],
  },
  createOptions: {
    browserArgs: [
      '--disable-web-security',
      '--no-sandbox',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled',
      '--no-default-browser-check',
      '--disable-dev-tools',
      '--disable-infobars',
      '--disable-notifications',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-hang-monitor',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
    ],
    /**
     * Example of configuring the linkPreview generator
     * If you set this to 'null', it will use global servers; however, you have the option to define your own server
     * Clone the repository https://github.com/wppconnect-team/wa-js-api-server and host it on your server with ssl
     *
     * Configure the attribute as follows:
     * linkPreviewApiServers: [ 'https://www.yourserver.com/wa-js-api-server' ]
     */
    linkPreviewApiServers: null,

    // `latest` is mutable and can drift ahead of the injected WA-JS API.
    // Operators may override this only with a version present in the pinned
    // @wppconnect/wa-version catalogue.
    whatsappVersion: env.WHATSAPP_VERSION || '2.3000.1049703040-alpha',
    puppeteerOptions: {
      headless: true,
      defaultViewport: null,
      executablePath: env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--disable-features=VizDisplayCompositor',
        '--no-default-browser-check',
        '--disable-dev-tools',
      ],
    },

    /**
     * Set specific whatsapp version
     */
    // whatsappVersion: '2.xxxxx',
  },
  mapper: {
    enable: false,
    prefix: 'tagone-',
  },
  db: {
    mongodbDatabase: env.MONGODB_DATABASE || 'tokens',
    mongodbCollection: env.MONGODB_COLLECTION || '',
    mongodbUser: env.MONGODB_USER || '',
    mongodbPassword: env.MONGODB_PASSWORD || '',
    mongodbHost: env.MONGODB_HOST || '',
    mongoIsRemote: true,
    mongoURLRemote: env.MONGO_URL_REMOTE || '',
    mongodbPort: envNumber('MONGODB_PORT', 27017),
    redisHost: env.REDIS_HOST || 'localhost',
    redisPort: envNumber('REDIS_PORT', 6379),
    redisPassword: env.REDIS_PASSWORD || '',
    redisDb: envNumber('REDIS_DB', 0),
    redisPrefix: env.REDIS_PREFIX || 'docker',
  },
  aws_s3: {
    region: 'sa-east-1' as any,
    access_key_id: null,
    secret_key: null,
    defaultBucketName: null,
    endpoint: null,
    forcePathStyle: null,
  },
} as unknown as ServerOptions;
