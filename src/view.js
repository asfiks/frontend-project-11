import onChange from 'on-change';

export default (state, cb) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'validUrl') {
      cb(state);
    }
  });
  return watchedState;
};
