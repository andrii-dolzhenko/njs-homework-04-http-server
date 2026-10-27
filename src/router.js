import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { readForm } from './form.js';
import { renderPage, renderSubmission, renderError } from './views.js';
import { sendResponse } from './response.js';

const pages = new Map([
  ['/', 'home'],
  ['/about', 'about'],
  ['/contact', 'contact']
]);

const assets = new Map([
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
  ['/media/hamster-gym.mp4', ['media/hamster-gym.mp4', 'video/mp4']],
  ['/media/hamster-poster.webp', ['media/hamster-poster.webp', 'image/webp']],
  ['/media/hamster-wheel.webp', ['media/hamster-wheel.webp', 'image/webp']],
  ['/media/hamster-wheel-still.webp', ['media/hamster-wheel-still.webp', 'image/webp']]
]);

export async function routeRequest(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');
  const isRead = req.method === 'GET' || req.method === 'HEAD';

  if (isRead && pages.has(pathname)) {
    sendResponse(req, res, 200, renderPage(pages.get(pathname)));
    return;
  }

  if (isRead && assets.has(pathname)) {
    const [file, contentType] = assets.get(pathname);
    const content = await readFile(new URL(`../public/${file}`, import.meta.url));
    sendResponse(req, res, 200, content, contentType);
    return;
  }

  if (req.method === 'POST' && pathname === '/submit') {
    const data = await readForm(req);
    sendResponse(req, res, 200, renderSubmission(data));
    return;
  }

  req.resume();
  sendResponse(req, res, 404, renderError(404));
}
