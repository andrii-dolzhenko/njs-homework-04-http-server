import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { once } from 'node:events';
import { createApp } from '../src/server.js';

let server;
let port;

before(async () => {
  server = createApp();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  port = server.address().port;
});

after(() => new Promise((resolve) => server.close(resolve)));

function request({ path = '/', method = 'GET', body, headers = {}, chunks, targetPort = port } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port: targetPort, path, method, headers }, (res) => {
      const buffers = [];
      res.on('data', (chunk) => buffers.push(chunk));
      res.on('error', reject);
      res.on('end', () => {
        const content = Buffer.concat(buffers);
        resolve({ status: res.statusCode, headers: res.headers, content, text: content.toString('utf8') });
      });
    });

    req.setTimeout(5000, () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
    if (chunks) chunks.forEach((chunk) => req.write(chunk));
    req.end(body);
  });
}

function checkHtml(response, status, text) {
  assert.equal(response.status, status);
  assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(Number(response.headers['content-length']), response.content.length);
  assert.match(response.text, /<!DOCTYPE html>/);
  assert.match(response.text, /<html lang="en">/);
  assert.ok(response.text.includes(text), `Expected ${text}`);
}

function submit(body, options = {}) {
  return request({
    path: '/submit', method: 'POST', body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    ...options
  });
}

for (const [path, title, text] of [
  ['/', 'Home', 'Welcome to the Home Page'],
  ['/about', 'About', 'Learn more about us'],
  ['/contact', 'Contact', 'Get in touch']
]) {
  test(`GET ${path} returns the required HTML and headers`, async () => {
    const response = await request({ path });
    checkHtml(response, 200, text);
    assert.ok(response.text.includes(`<title>${title} | Hamster Gym</title>`));
  });
}

test('query strings do not change the matched route', async () => {
  checkHtml(await request({ path: '/about?from=home' }), 200, 'Learn more about us');
});

test('unknown routes and unsupported method/route pairs return 404', async () => {
  for (const [path, method] of [['/missing', 'GET'], ['/submit', 'GET'], ['/', 'POST'], ['/about', 'PUT']]) {
    checkHtml(await request({ path, method }), 404, 'Page Not Found');
  }
});

test('POST /submit parses and trims form values', async () => {
  const response = await submit('name=++Alex++&email=+alex%40example.com+');
  checkHtml(response, 200, 'Form Submitted');
  assert.match(response.text, /Name: <strong>Alex<\/strong>/);
  assert.match(response.text, /Email: <strong>alex@example.com<\/strong>/);
});

test('form responses preserve Unicode and use a byte-based Content-Length', async () => {
  const body = new URLSearchParams({ name: 'Андрій 🐹', email: 'andrii@example.com' }).toString();
  const response = await submit(body);
  checkHtml(response, 200, 'Андрій 🐹');
  assert.ok(response.content.length > response.text.length);
});

test('UTF-8 characters split across request chunks are preserved', async () => {
  const data = Buffer.from('name=Андрій🐹&email=a%40example.com');
  const chunks = Array.from(data, (byte) => Buffer.from([byte]));
  checkHtml(await submit(undefined, { chunks }), 200, 'Андрій🐹');
});

test('reflected HTML and special characters are escaped', async () => {
  const name = '<script>alert("x")</script> & \'🐹';
  const response = await submit(new URLSearchParams({ name, email: '<b>x</b>' }).toString());
  checkHtml(response, 200, '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;🐹');
  assert.ok(!response.text.includes('<script>alert'));
  assert.ok(response.text.includes('&lt;b&gt;x&lt;/b&gt;'));
});

test('missing, blank and repeated required fields return 400', async () => {
  const bodies = [
    '', 'name=Alex', 'email=a%40b.com', 'name=&email=a',
    'name=%20%20&email=a', 'name=Alex&email=%09%20',
    'name=Al&name=Bob&email=a', 'name=Al&email=a&email=b'
  ];
  for (const body of bodies) checkHtml(await submit(body), 400, 'Invalid form data');
});

test('names need at least two Unicode characters after trimming', async () => {
  for (const name of ['A', ' A ', 'Я', '🐹', '   ']) {
    checkHtml(await submit(new URLSearchParams({ name, email: 'a@example.com' }).toString()), 400, 'Invalid form data');
  }

  for (const name of ['Al', 'Лі', '李明', ' A🐹 ']) {
    checkHtml(await submit(new URLSearchParams({ name, email: 'a@example.com' }).toString()), 200, 'Form Submitted');
  }
});

test('form Content-Type accepts a charset and rejects other or absent types', async () => {
  checkHtml(await submit('name=Al&email=a', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
  }), 200, 'Form Submitted');

  for (const headers of [{}, { 'Content-Type': 'application/json' }, { 'Content-Type': 'text/plain' }]) {
    checkHtml(await submit('name=Al&email=a', { headers }), 400, 'Invalid form data');
  }
});

test('a form body of exactly 1 MB is accepted', async () => {
  const prefix = 'name=Alex&email=a&padding=';
  const body = prefix + 'x'.repeat(1024 * 1024 - prefix.length);
  checkHtml(await submit(body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }), 200, 'Form Submitted');
});

test('a declared body of 1 MB plus one byte returns 413', async () => {
  const body = 'x'.repeat(1024 * 1024 + 1);
  checkHtml(await submit(body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': body.length }
  }), 413, 'Payload Too Large');
});

test('a chunked body is limited without a Content-Length header', async () => {
  const chunks = Array.from({ length: 17 }, () => Buffer.alloc(65536, 'x'));
  checkHtml(await submit(undefined, { chunks }), 413, 'Payload Too Large');
  checkHtml(await request(), 200, 'Welcome to the Home Page');
});

test('static assets have correct MIME types, byte lengths and nosniff headers', async () => {
  for (const [path, type] of [
    ['/styles.css', 'text/css; charset=utf-8'],
    ['/app.js', 'text/javascript; charset=utf-8'],
    ['/favicon.svg', 'image/svg+xml'],
    ['/media/hamster-gym.mp4', 'video/mp4'],
    ['/media/hamster-poster.webp', 'image/webp'],
    ['/media/hamster-wheel.webp', 'image/webp'],
    ['/media/hamster-wheel-still.webp', 'image/webp']
  ]) {
    const response = await request({ path });
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], type);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(Number(response.headers['content-length']), response.content.length);
    assert.ok(response.content.length > 0);
  }
});

test('asset paths cannot read arbitrary project files', async () => {
  for (const path of ['/package.json', '/server.js', '/.env', '/media/../server.js', '/media/%2e%2e%2fserver.js']) {
    checkHtml(await request({ path }), 404, 'Page Not Found');
  }
});

test('HEAD returns the same headers without a response body', async () => {
  for (const path of ['/', '/styles.css', '/media/hamster-gym.mp4', '/missing']) {
    const get = await request({ path });
    const head = await request({ path, method: 'HEAD' });
    assert.equal(head.status, get.status);
    assert.equal(head.headers['content-type'], get.headers['content-type']);
    assert.equal(head.headers['content-length'], get.headers['content-length']);
    assert.equal(head.content.length, 0);
  }
});

test('unexpected async failures return an HTML 500 without exposing the error', async (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const failing = createApp(async () => {
    throw new Error('Private test failure');
  });
  failing.listen(0, '127.0.0.1');
  await once(failing, 'listening');

  try {
    const response = await request({ targetPort: failing.address().port });
    checkHtml(response, 500, 'Server Error');
    assert.ok(!response.text.includes('Private test failure'));
    assert.equal(log.mock.callCount(), 1);
  } finally {
    await new Promise((resolve) => failing.close(resolve));
  }
});
