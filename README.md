# Hamster Gym — Node.js HTTP Server

A small HTTP server built with Node.js core modules. It serves three HTML pages, handles form submissions, and returns styled error pages. No external dependencies are needed.

## Run

Requires Node.js 24 or newer.

```bash
git clone https://github.com/andrii-dolzhenko/njs-homework-04-http-server.git
cd njs-homework-04-http-server
npm start
```

Open <http://localhost:3000>. Use `PORT=4000 npm start` to change the port, or `npm run dev` to restart on file changes. There is no install or build step.

## Routes

| Method | Route | Response |
| --- | --- | --- |
| GET | `/` | 200 · Home — Welcome to the Home Page |
| GET | `/about` | 200 · About — Learn more about us |
| GET | `/contact` | 200 · Contact — Get in touch, with a form |
| POST | `/submit` | 200 · Form Submitted, with the submitted name and email |
| GET | `/styles.css`, `/app.js`, `/favicon.svg`, `/media/*` | Local styles, script, icon and four listed media files |
| Any | Unknown route or unsupported method/route pair | 404 · Page Not Found |

The GET routes also support HEAD. Query strings do not change the matched page. Static files are served from an explicit allowlist in `src/router.js`.

## Request examples

With the server running:

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/about
curl -i http://localhost:3000/contact

curl -i http://localhost:3000/submit \
  --data-urlencode 'name=Alex' \
  --data-urlencode 'email=alex@example.com'
```

The last request returns an HTML document containing:

```html
<h1 class="headline headline--result">Form Submitted</h1>
```

The submitted values appear as `Name: Alex` and `Email: alex@example.com`. They are HTML-escaped before rendering.

Every HTML response includes `Content-Type: text/html; charset=utf-8`, a byte-based `Content-Length`, and `X-Content-Type-Options: nosniff`.

## Errors and limits

| Status | Message | Condition |
| --- | --- | --- |
| 400 | Invalid form data | A name is shorter than two characters, a required field is missing, blank or repeated, or the form Content-Type is incorrect |
| 404 | Page Not Found | No route matches |
| 413 | Payload Too Large | The POST body exceeds 1,048,576 bytes (1 MB) |
| 500 | Server Error | An unexpected request-handling failure |

```bash
curl -i http://localhost:3000/missing
curl -i http://localhost:3000/submit -d 'name=&email='

node -e 'process.stdout.write("x".repeat(1048577))' | \
  curl -i http://localhost:3000/submit \
    -H 'Content-Type: application/x-www-form-urlencoded' --data-binary @-
```

Forms use `application/x-www-form-urlencoded` and are parsed with `node:querystring`. After trimming, the name must have at least two Unicode characters and the email must be non-empty. The same name rule is checked in the browser, which also checks email syntax. Repeated required fields are rejected. Bodies are limited by their actual byte count, including chunked requests.

This is a fictional club and a learning project. Submissions are shown in the response only; nothing is stored or emailed. There is no database, account system or registration service. The server does not support file uploads or JSON submissions. Media is small and served as complete files; byte-range seeking is not implemented.

## Checks

```bash
npm test
npm run check
```

Tests use `node:test` and real HTTP requests to a temporary local port. They cover routes, headers, form parsing, Unicode, HTML escaping, body-size boundaries, chunked bodies, static assets and error responses. `npm run check` also checks JavaScript syntax. GitHub Actions runs the same command on pushes and pull requests.

The interface supports keyboard navigation, visible focus, labelled fields and reduced motion. The mobile header stays visible when scrolling; its menu opens over the content and closes with its button, Escape, a click outside the header or focus leaving it. Page content fades in unless reduced motion is enabled. Video and animation have pause controls. Navigation and form submissions work without JavaScript.

## Files

- `server.js` — port configuration and startup.
- `src/` — routing, form parsing, HTML templates, escaping and responses.
- `public/` — CSS, browser script and supplied media.
- `test/` — HTTP integration tests.

The server runs locally or on a host that supports a running Node.js process. GitHub Pages cannot execute this server.
