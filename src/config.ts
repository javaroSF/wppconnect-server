import { ServerOptions } from './types/ServerOptions';

export default {
  secretKey: 'THISISMYSECURETOKEN',
  host: 'http://localhost',
  port: '21465',
  deviceName: 'WppConnect',
  poweredBy: 'WPPConnect-Server',
  startAllSession: true,
  tokenStoreType: 'file',
  maxListeners: 15,
  customUserDataDir: './userDataDir/',
  // Session management options to help with LID compatibility
  sessionTimeoutMs: 30000,
  disableSpins: true,
  disableWelcome: true,
  webhook: {
    // Use port 8087 for more reliable webhook testing
    url: 'http://192.168.1.5:8083/whatsappService/api/wpp/webhook',
    // url: 'http://157.180.31.251:8083/whatsappService/api/wpp/webhook',
    // Backup option: you can also use webhook.site for testing
    // url: 'https://webhook.site/your-unique-id',
    autoDownload: false,
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
    onMessageReactions: true,
    onMessageReply: true,
    onMessageForward: true,
    onMessageQuoted: true,
    onMessagePinned: true,
    onMessageDeleted: true,

    ignore: ['status@broadcast'],
    headers: {
      'X-API-Key': 'YOUR_API_KEY_VALUE',
      'Accept-Language': 'en',
      'x-secret-key':
        '$2a$12$Q/LMmpvntlGK8RgH9UdRdeDgx./Pa4mQgXZmC.dITsvbWqaSErPMG',
    },
  },
  websocket: {
    autoDownload: false,
    uploadS3: false,
  },
  chatwoot: {
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
      // Additional arguments to help with LID and WhatsApp Web compatibility
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
    // LID support configuration
    whatsappVersion: 'latest',
    puppeteerOptions: {
      headless: true,
      defaultViewport: null,
      args: [
        '--disable-features=VizDisplayCompositor',
        '--no-default-browser-check',
        '--disable-dev-tools',
      ],
    },
    /**
     * Example of configuring the linkPreview generator
     * If you set this to 'null', it will use global servers; however, you have the option to define your own server
     * Clone the repository https://github.com/wppconnect-team/wa-js-api-server and host it on your server with ssl
     *
     * Configure the attribute as follows:
     * linkPreviewApiServers: [ 'https://www.yourserver.com/wa-js-api-server' ]
     */
    linkPreviewApiServers: null,

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
    mongodbDatabase: 'tokens',
    mongodbCollection: '',
    mongodbUser: '',
    mongodbPassword: '',
    mongodbHost: '',
    mongoIsRemote: true,
    mongoURLRemote: '',
    mongodbPort: 27017,
    redisHost: 'localhost',
    redisPort: 6379,
    redisPassword: '',
    redisDb: 0,
    redisPrefix: 'docker',
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
