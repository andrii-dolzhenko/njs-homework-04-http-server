export function sendResponse(req, res, status, content, contentType = 'text/html; charset=utf-8') {
  if (res.writableEnded || res.destroyed) return;

  const body = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');

  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': body.length,
    'X-Content-Type-Options': 'nosniff'
  });

  res.end(req.method === 'HEAD' ? undefined : body);
}
