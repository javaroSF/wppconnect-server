/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

const originalEnv = process.env;
let directory: string;
let cwd: jest.SpyInstance;

beforeEach(() => {
  directory = mkdtempSync(path.join(tmpdir(), 'wppconnect-env-'));
  cwd = jest.spyOn(process, 'cwd').mockReturnValue(directory);
  process.env = { ...originalEnv };
  delete process.env.SECRET_KEY;
  delete process.env.PORT;
  delete process.env.MAX_LISTENERS;
  delete process.env.CHATWOOT_ALLOWED_URLS;
  delete process.env.WEBHOOK_URL;
  delete process.env.WEBHOOK_HEADERS_JSON;
  delete process.env.WEBHOOK_ALLOWED_URLS;
  delete process.env.WEBHOOK_RETRY_ATTEMPTS;
  delete process.env.WEBHOOK_RETRY_DELAY;
  delete process.env.WEBHOOK_REQUEST_TIMEOUT;
  delete process.env.PUPPETEER_EXECUTABLE_PATH;
  delete process.env.WHATSAPP_VERSION;
  jest.resetModules();
});

afterEach(() => {
  process.env = originalEnv;
  cwd.mockRestore();
  if (path.dirname(directory) !== path.resolve(tmpdir()))
    throw new Error('Unexpected test directory');
  rmSync(directory, { recursive: true, force: true });
});

it('loads the optional cwd .env before resolving server settings', async () => {
  writeFileSync(
    directory + '/.env',
    'SECRET_KEY=test-env-key\nPORT=24552\nMAX_LISTENERS=27\n'
  );
  const { default: config } = await import('./config');
  expect(config.secretKey).toBe('test-env-key');
  expect(config.port).toBe('24552');
  expect(config.maxListeners).toBe(27);
});

it('keeps deployment environment values ahead of the .env file', async () => {
  writeFileSync(
    directory + '/.env',
    'SECRET_KEY=file-key\nPORT=24552\nMAX_LISTENERS=27\n'
  );
  process.env.SECRET_KEY = 'deployment-key';
  process.env.PORT = '24553';
  process.env.MAX_LISTENERS = '0';
  const { default: config } = await import('./config');
  expect(config.secretKey).toBe('deployment-key');
  expect(config.port).toBe('24553');
  expect(config.maxListeners).toBe(0);
});

it('starts with legacy defaults when no .env exists', async () => {
  const { default: config } = await import('./config');
  expect(config.secretKey).toBe('THISISMYSECURETOKEN');
  expect(config.port).toBe('21465');
  expect(config.maxListeners).toBe(15);
  expect(config.createOptions.whatsappVersion).toBe('2.3000.1049703040-alpha');
});

it('loads Chatwoot destinations only from operator configuration', async () => {
  process.env.CHATWOOT_ALLOWED_URLS =
    ' https://support.example.test, http://localhost:3000/ , ';
  const { default: config } = await import('./config');
  expect(config.chatwoot?.allowedUrls).toEqual([
    'https://support.example.test',
    'http://localhost:3000/',
  ]);
});

it('preserves Flowz webhook listeners and loads webhook credentials from environment', async () => {
  process.env.WEBHOOK_URL = 'https://flowz.example.test/wpp/webhook';
  process.env.WEBHOOK_HEADERS_JSON =
    '{"Authorization":"Bearer test-flowz-webhook-token"}';
  process.env.WEBHOOK_ALLOWED_URLS = 'https://flowz.example.test';
  process.env.WEBHOOK_RETRY_ATTEMPTS = '4';
  process.env.WEBHOOK_RETRY_DELAY = '7000';
  process.env.WEBHOOK_REQUEST_TIMEOUT = '45000';
  const { default: config } = await import('./config');

  expect(config.webhook).toEqual(
    expect.objectContaining({
      url: 'https://flowz.example.test/wpp/webhook',
      headers: { Authorization: 'Bearer test-flowz-webhook-token' },
      allowedUrls: ['https://flowz.example.test'],
      retryAttempts: 4,
      retryDelay: 7000,
      requestTimeout: 45000,
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
    })
  );
});
