import onChange from 'on-change';

export default (state, cb) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'valid') {
      cb(state);
    }
  });
  return watchedState;
};
