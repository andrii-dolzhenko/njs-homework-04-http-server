import { createServer } from 'node:http';
import { routeRequest } from './router.js';
import { RequestError } from './form.js';
import { renderError } from './views.js';
import { sendResponse } from './response.js';

export function createApp(handler = routeRequest) {
  return createServer(async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const status = error instanceof RequestError ? error.status : 500;

      if (status === 500) console.error('Request failed:', error);

      if (!res.headersSent) {
        sendResponse(req, res, status, renderError(status));
      } else {
        res.destroy();
      }
    }
  });
}
