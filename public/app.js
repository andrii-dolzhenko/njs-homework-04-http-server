const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const video = document.querySelector('#training-video');
const videoToggle = document.querySelector('[data-video-toggle]');

if (video && videoToggle) {
  video.controls = false;
  videoToggle.hidden = false;

  function updateVideoButton() {
    videoToggle.textContent = video.paused ? 'Play video' : 'Pause video';
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
