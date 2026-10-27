import { parse } from 'node:querystring';

export const MAX_BODY_SIZE = 1024 * 1024;

export class RequestError extends Error {
  constructor(status) {
    super(`Request failed: ${status}`);
    this.status = status;
  }
}

export async function readForm(req) {
  const body = await new Promise((resolve, reject) => {
    let size = 0;
    let chunks = [];
    let rejected = false;

    function fail(error) {
      if (rejected) return;
      rejected = true;
      chunks = [];
      reject(error);
    }

    req.on('error', (error) => fail(error));
    req.on('aborted', () => fail(new RequestError(400)));

    if (Number(req.headers['content-length']) > MAX_BODY_SIZE) {
      fail(new RequestError(413));
      req.resume();
      return;
    }

    const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();

    if (contentType !== 'application/x-www-form-urlencoded') {
      fail(new RequestError(400));
      req.resume();
      return;
    }

    req.on('data', (chunk) => {
      if (rejected) return;
      size += chunk.length;

      if (size > MAX_BODY_SIZE) {
        fail(new RequestError(413));
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!rejected) resolve(Buffer.concat(chunks).toString('utf8'));
    });
  });

  const data = parse(body);

  if (typeof data.name !== 'string' || typeof data.email !== 'string') {
    throw new RequestError(400);
  }

  const name = data.name.trim();
  const email = data.email.trim();

  if (Array.from(name).length < 2 || !email) throw new RequestError(400);

  return { name, email };
}
