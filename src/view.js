import onChange from 'on-change';

export default (state, renderForFeedback, render, getDataAfterParsing) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'validUrl' && value !== '') {
      renderForFeedback(watchedState);
    }
    if (path === 'stateApp' && value === 'processing') {
      getDataAfterParsing(watchedState);
    }
    if (path === 'posts' && value.length !== 0) {
      render(watchedState);
    }
  });
  return watchedState;
};
