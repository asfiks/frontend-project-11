import onChange from 'on-change';

export default (state, renderForFeedback, render, getDataFromURL) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'validUrl') {
      renderForFeedback(state);
    }
  });
  return watchedState;
};
