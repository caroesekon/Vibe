const sounds = {};

const loadSound = (name, path) => {
  try {
    const audio = new Audio(path);
    audio.volume = 0.5;
    sounds[name] = audio;
  } catch {}
};

export const initSounds = () => {
  loadSound('notification', '/sounds/notification.mp3');
  loadSound('message_sent', '/sounds/message_sent.mp3');
  loadSound('message_received', '/sounds/message_received.mp3');
};

export const playSound = (name) => {
  const sound = sounds[name];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
};