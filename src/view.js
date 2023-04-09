import onChange from 'on-change';

export default (state, cb) => {
  const watchedState = onChange(state, (path, value) => {
    cb(state);
  });
  return watchedState;
};
