import onChange from 'on-change';
import { renderForFeedback, render, getDataAfterParsing } from './application.js';
/* import render from './application.js';
import getDataAfterParsing from './application.js' */

export default (state) => {
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
