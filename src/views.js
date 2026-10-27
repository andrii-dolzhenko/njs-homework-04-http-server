import { escapeHtml } from './escape.js';

const arrow = '<span aria-hidden="true">↗</span>';

function layout(title, content, activePage = '') {
  const nav = [
    ['home', '/', 'Home'],
    ['about', '/about', 'About'],
    ['contact', '/contact', 'Contact']
  ].map(([page, href, label]) => {
    const current = page === activePage ? ' aria-current="page"' : '';
    return `<a href="${href}"${current}>${label}</a>`;
  }).join('\n          ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Hamster Gym: a tiny fitness club built with a native Node.js HTTP server.">
  <title>${title} | Hamster Gym</title>
  <script>document.documentElement.classList.add('js');</script>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
  <script src="/app.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="site">
    <header class="header">
      <a class="brand" href="/" aria-label="Hamster Gym home">
        <img src="/favicon.svg" width="30" height="30" alt="">
        <span>hamster gym.</span>
      </a>
      <button class="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false" aria-label="Open menu" hidden>
        <span class="menu-toggle__lines" aria-hidden="true"><span></span></span>
      </button>
      <nav class="nav" id="primary-navigation" aria-label="Main navigation">
        ${nav}
      </nav>
      <a class="button header__join" href="/contact">Join the club ${arrow}</a>
    </header>
    <main class="main" id="main" tabindex="-1">
${content}
    </main>
    <footer class="footer">
      <span>Small paws. Big gains.</span>
      <span>© 2026 Andrii Dolzhenko. All Rights Reserved.</span>
    </footer>
  </div>
</body>
</html>`;
}

export function renderPage(page) {
  const content = {
    home: `      <div class="split">
        <div>
          <h1 class="eyebrow">Home</h1>
          <p class="intro">Welcome to the Home Page</p>
          <h2 class="headline">Small paws.<br><span>Big gains.</span></h2>
          <p class="copy">A little movement. A lot of heart. A friendly fitness club for hamsters who dream beyond the wheel.</p>
          <div class="actions">
            <a class="button button--pink" href="/contact">Join the club ${arrow}</a>
            <a class="text-link" href="/about">Meet the club</a>
          </div>
        </div>
        <div class="video-block">
          <video class="video" id="training-video" controls muted loop playsinline preload="metadata" poster="/media/hamster-poster.webp" width="720" height="960" aria-label="Two animated hamsters training with tiny weights">
            <source src="/media/hamster-gym.mp4" type="video/mp4">
            Your browser cannot play this video. <a href="/media/hamster-gym.mp4">Download the hamster workout</a>.
          </video>
          <div class="video-block__controls">
            <p class="video-block__caption">Tiny weights. Huge energy.</p>
            <button class="media-toggle media-toggle--video" type="button" data-video-toggle data-playing="false" aria-label="Play video" hidden>
              <span class="media-toggle__icon" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
      <ul class="principles" aria-label="Club principles">
        <li><span class="principles__number" aria-hidden="true">01</span><h3>Move at your own pace</h3><p>No rush. Find a rhythm that feels good.</p></li>
        <li><span class="principles__number" aria-hidden="true">02</span><h3>Every hamster welcome</h3><p>A little crew with room for everyone.</p></li>
        <li><span class="principles__number" aria-hidden="true">03</span><h3>Small steps count</h3><p>Every tiny effort deserves a little cheer.</p></li>
      </ul>`,
    about: `      <div class="split">
        <div>
          <h1 class="eyebrow">About</h1>
          <h2 class="headline">A little club.<br><span>A big heart.</span></h2>
          <p class="copy">Learn more about us</p>
          <p class="copy">We believe fitness should feel like play. Our imaginary club brings tiny athletes together for movement, encouragement and a well-earned sunflower seed.</p>
          <a class="button button--pink" href="/contact">Find your little crew ${arrow}</a>
        </div>
        <section class="panel" aria-labelledby="club-values">
          <h2 id="club-values">Beyond the wheel.</h2>
          <p class="copy">There is no perfect pace. Just a little more confidence with every tiny step.</p>
          <ol class="values">
            <li>Move because it feels good.</li>
            <li>Cheer for the little wins.</li>
            <li>Make room for every hamster.</li>
          </ol>
        </section>
      </div>`,
    contact: `      <div class="split">
        <div>
          <h1 class="eyebrow">Contact</h1>
          <h2 class="headline">Your first<br><span>tiny step.</span></h2>
          <p class="copy">Get in touch</p>
          <p class="copy">Ready to join the little crew? Leave your name and email to try the club's sign-up form.</p>
          <p class="small">A fictional gym. A real love for tiny athletes.</p>
        </div>
        <section class="panel" aria-labelledby="join-title">
          <h2 id="join-title">Join the club.</h2>
          <p class="small">Big ambitions start small. Both fields are required.</p>
          <form class="form" action="/submit" method="post" accept-charset="UTF-8">
            <label for="name">Name <span class="required">(required)</span></label>
            <input id="name" name="name" type="text" placeholder="Your name" autocomplete="name" minlength="2" aria-describedby="name-hint" required>
            <p class="field-hint" id="name-hint">At least 2 characters.</p>
            <label for="email">Email <span class="required">(required)</span></label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
            <button class="button button--pink" type="submit">Count me in ${arrow}</button>
            <p class="small">This is a learning project. Details appear on the confirmation page and are not saved or emailed.</p>
          </form>
        </section>
      </div>`
  };

  const title = { home: 'Home', about: 'About', contact: 'Contact' }[page];
  return layout(title, content[page], page);
}

export function renderSubmission({ name, email }) {
  return layout('Form Submitted', `      <div class="center">
        <div class="success-mark" aria-hidden="true">✓</div>
        <p class="eyebrow">You're on the team</p>
        <h1 class="headline headline--result">Form Submitted</h1>
        <p class="copy">One small step. A whole new crew.<br>Here is what you shared with the club.</p>
        <div class="details">
          <p>Name: <strong>${escapeHtml(name)}</strong></p>
          <p>Email: <strong>${escapeHtml(email)}</strong></p>
        </div>
        <a class="button button--pink" href="/">Back to Home ${arrow}</a>
      </div>`);
}

export function renderError(status) {
  const errors = {
    400: ['Invalid form data', 'Please enter a name with at least 2 characters and a non-empty email.', '/contact', 'Back to the form'],
    404: ['Page Not Found', "Our hamster is going in circles. Let's get you back on track.", '/', 'Back to Home'],
    413: ['Payload Too Large', 'That is a little too much for tiny paws. Please send a request no larger than 1 MB.', '/contact', 'Back to the form'],
    500: ['Server Error', 'Our wheel needs a short break. Please try again in a moment.', '/', 'Back to Home']
  };
  const [title, message, href, action] = errors[status];
  const illustration = status === 404
    ? `        <div class="wheel-block">
          <img class="wheel" src="/media/hamster-wheel-still.webp" data-animation="/media/hamster-wheel.webp" data-still="/media/hamster-wheel-still.webp" width="720" height="540" alt="404 with a hamster running inside the zero">
          <button class="media-toggle media-toggle--wheel" type="button" data-animation-toggle hidden>Play animation</button>
        </div>`
    : `        <p class="error-code" aria-hidden="true">${status}</p>`;

  return layout(title, `      <div class="center error-page">
        <p class="eyebrow">A little detour</p>
${illustration}
        <h1 class="error-heading">${status === 404 ? '' : `${status} · `}${title}</h1>
        <p class="copy">${message}</p>
        <a class="button button--pink" href="${href}">${action} ${arrow}</a>
      </div>`);
}
