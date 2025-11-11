import { BucketLocationConstraint } from '@aws-sdk/client-s3';

export interface ServerOptions {
  secretKey: string;
  host: string;
  port: number;
  deviceName: string;
  poweredBy: string;
  startAllSession: boolean;
  tokenStoreType: string;
  maxListeners: number;
  customUserDataDir: string;
  sessionTimeoutMs?: number;
  disableSpins?: boolean;
  disableWelcome?: boolean;
  webhook: {
    url: string;
    autoDownload: boolean;
    uploadS3: boolean;
    readMessage: boolean;
    allUnreadOnStart: boolean;
    listenAcks: boolean;
    onPresenceChanged: boolean;
    onParticipantsChanged: boolean;
    onReactionMessage: boolean;
    onPollResponse: boolean;
    onRevokedMessage: boolean;
    onSelfMessage: boolean;
    ignore: string[];
    headers?: { [key: string]: string };
  };
  websocket: {
    autoDownload: boolean;
    uploadS3: boolean;
  };
  archive: {
    enable: boolean;
    waitTime: number;
    daysToArchive: number;
  };
  log: {
    level: string;
    logger: string[];
  };
  createOptions: {
    browserArgs: string[];
    whatsappVersion?: string;
    puppeteerOptions?: {
      headless?: boolean;
      defaultViewport?: null;
      args?: string[];
    };
    linkPreviewApiServers?: string[] | null;
  };
  mapper: {
    enable: boolean;
    prefix: string;
  };
  db: {
    mongodbDatabase: string;
    mongodbCollection: string;
    mongodbUser: string;
    mongodbPassword: string;
    mongodbHost: string;
    mongoIsRemote: boolean;
    mongoURLRemote: string;
    mongodbPort: number;
    redisHost: string;
    redisPort: number;
    redisPassword: string;
    redisDb: string;
    redisPrefix: string;
  };
  aws_s3: {
    region: BucketLocationConstraint | null;
    access_key_id: string | null;
    secret_key: string | null;
    defaultBucketName: string | null;
    endpoint?: string | null;
    forcePathStyle?: boolean | null;
  };
}
