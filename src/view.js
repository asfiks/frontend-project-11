import onChange from 'on-change';

export default (state, renderForFeedback, render, getDataAfterParsing) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'validUrl' && value !== '') {
      console.log('вотчстэйт валидация')
      renderForFeedback(watchedState);
    }
    if (path === 'stateApp' && value === 'processing') {
      console.log('запуск парсинга')
      getDataAfterParsing(watchedState);
    }
    if (path === 'posts' && value.length !== 0) {
      console.log('changePosts')
      render(watchedState);
    }
  });
  return watchedState;
};
