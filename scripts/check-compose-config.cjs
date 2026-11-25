const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-compose-'));
const values = {
  SECRET_KEY: 'compose-test-key',
  WEBHOOK_URL: 'https://hooks.example.test/events',
  WEBHOOK_HEADERS_JSON: '{"Authorization":"Bearer compose-test-token"}',
  WEBHOOK_ALLOWED_URLS: 'https://hooks.example.test/other',
  WEBHOOK_RETRY_ATTEMPTS: '4',
  WEBHOOK_RETRY_DELAY: '7000',
  WEBHOOK_REQUEST_TIMEOUT: '45000',
  TOKEN_STORE_TYPE: 'file',
  TOKEN_STORE_PATH: './tokens',
  CUSTOM_USER_DATA_DIR: './userDataDir/',
  MAX_LISTENERS: '27',
  PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser',
  WHATSAPP_VERSION: '2.3000.1049703040-alpha',
};
const environment = { ...process.env };
for (const name of Object.keys(values)) delete environment[name];
function render(contents) {
  const file = path.join(directory, '.env');
  fs.writeFileSync(file, contents);
  return JSON.parse(
    execFileSync(
      'docker',
      [
        'compose',
        '-f',
        path.join(root, 'docker-compose.yml'),
        '--env-file',
        file,
        'config',
        '--format',
        'json',
      ],
      { cwd: root, env: environment, encoding: 'utf8' }
    )
  ).services.wppconnect;
}
try {
  const configured = render(
    Object.entries(values)
      .map(([key, value]) => key + '=' + value)
      .join('\n')
  );
  for (const [name, value] of Object.entries(values)) {
    assert.equal(
      String(configured.environment[name]),
      value,
      name + ' must reach the container'
    );
  }
  assert.equal(configured.container_name, 'wpp-server');
  assert.equal(String(configured.ports[0].published), '21465');
  assert.equal(configured.ports[0].target, 21465);
  assert.ok(
    configured.volumes.some(
      (volume) => volume.target === '/usr/src/wpp-server/tokens'
    ),
    'existing token bind mount must remain present'
  );
  assert.ok(
    configured.volumes.some(
      (volume) => volume.target === '/usr/src/wpp-server/userDataDir'
    ),
    'browser profiles must use persistent storage'
  );
  const defaults = render('');
  assert.equal(
    String(defaults.environment.PUPPETEER_EXECUTABLE_PATH),
    '/usr/bin/chromium-browser'
  );
  assert.equal(
    String(defaults.environment.WHATSAPP_VERSION),
    '2.3000.1049703040-alpha'
  );
  console.log(
    'Compose forwards production settings and retains persistent session mounts'
  );
} finally {
  if (path.dirname(directory) !== path.resolve(os.tmpdir()))
    throw new Error('Unexpected test directory');
  fs.rmSync(directory, { recursive: true, force: true });
}
