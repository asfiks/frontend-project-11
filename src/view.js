import onChange from 'on-change';

export default (state, renderForFeedback, render, getDataFromURL) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'validUrl') {
      renderForFeedback(state);
    }
    /* if (path === 'feeds') {
      render(state);
    } */
    else if (path === 'urls') {
      getDataFromURL(state)
    }
  }, { path: [ 'validUrl', 'urls'] });
  return watchedState;
};
