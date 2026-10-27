const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
const mobileLayout = window.matchMedia('(max-width: 700px)');

function setMenu(open) {
  header.classList.toggle('header--open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

if (header && menuToggle && navigation) {
  menuToggle.hidden = false;

  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  header.addEventListener('focusout', (event) => {
    if (!header.contains(event.relatedTarget)) setMenu(false);
  });

  mobileLayout.addEventListener('change', () => {
    const navigationHadFocus = navigation.contains(document.activeElement);
    setMenu(false);
    if (mobileLayout.matches && navigationHadFocus) menuToggle.focus();
  });
}

const form = document.querySelector('.form');
const nameInput = document.querySelector('#name');

if (form && nameInput) {
  function validateName() {
    const tooShort = nameInput.value !== '' && Array.from(nameInput.value.trim()).length < 2;
    nameInput.setCustomValidity(tooShort ? 'Please enter at least 2 characters.' : '');
  }

  nameInput.addEventListener('input', validateName);
  nameInput.addEventListener('change', validateName);
  form.addEventListener('submit', (event) => {
    validateName();
    if (!nameInput.checkValidity()) {
      event.preventDefault();
      nameInput.reportValidity();
    }
  });
  validateName();
}

const video = document.querySelector('#training-video');
const videoToggle = document.querySelector('[data-video-toggle]');

if (video && videoToggle) {
  video.controls = false;
  videoToggle.hidden = false;

  function updateVideoButton() {
    videoToggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    videoToggle.dataset.playing = String(!video.paused);
  }

  function playVideo() {
    video.play().catch(() => {
      updateVideoButton();
      video.controls = true;
    });
  }

  videoToggle.addEventListener('click', () => {
    if (video.paused) playVideo();
    else video.pause();
  });

  video.addEventListener('play', updateVideoButton);
  video.addEventListener('pause', updateVideoButton);

  if (!motionPreference.matches) playVideo();
}

const animation = document.querySelector('[data-animation]');
const animationToggle = document.querySelector('[data-animation-toggle]');
let animationPlaying = false;

function setAnimation(playing) {
  animationPlaying = playing;
  animation.src = playing ? animation.dataset.animation : animation.dataset.still;
  animationToggle.textContent = playing ? 'Pause animation' : 'Play animation';
}

if (animation && animationToggle) {
  animationToggle.hidden = false;
  setAnimation(!motionPreference.matches);
  animationToggle.addEventListener('click', () => setAnimation(!animationPlaying));
}

motionPreference.addEventListener('change', (event) => {
  if (!event.matches) return;
  if (video) video.pause();
  if (animation && animationToggle) setAnimation(false);
});
