import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import viewer from './view.js';
import texts from './locales/texts.js';
import parser from './parser.js';
import { hasRSS, getNormalizePosts } from './utilits.js';

i18next.init({
  lng: 'ru',
  resources: {
    ru: { translation: texts },
  },
});

const makeProxyLink = (url) => {
  const proxy = new URL('/get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('url', url);
  proxy.searchParams.set('disableCache', true);
  return proxy;
};

const getDataFromURL = (url, state) => {
  const proxyUrl = makeProxyLink(url);
  return axios.get(proxyUrl)
    .then((response) => parser(response.data.contents, state))
    .catch(() => 'error');
};

const isValid = (url, state, schema) => schema.validate({ website: url })
  .then(() => {
    if (state.urls.includes(url)) {
      return 'thereIsRssInState';
    }
    const proxyUrl = makeProxyLink(url);
    return hasRSS(proxyUrl).then((result) => {
      if (result.message === 'Network Error') {
        return 'errorNetwork';
      }
      if (result) {
        return 'hasRSS';
      }
      if (!result) {
        return 'noRSS';
      }
      return null;
    });
  })
  .catch(() => 'noValid');

export const getDataAfterParsing = (state) => {
  if (state.stateApp === 'processing') {
    return getDataFromURL(state.currentUrl, state)
      .then((data) => {
        if (data === 'error') {
          state.validUrl = 'errorNetwork';
          state.stateApp = 'filling';
        } else {
          state.urls.push(state.currentUrl);
          const [currentFeed, currentPosts] = data;
          state.feeds.unshift(currentFeed);
          state.posts = currentPosts;
        }
      });
  } if (state.stateApp === 'processed') {
    const { urls } = state;
    const result = urls.map((url) => getDataFromURL(url, state)
      .then((data) => {
        if (data === 'error') {
          state.validUrl = 'errorNetwork';
        }
        return data;
      }));
    Promise.all(result).then((values) => {
      const data = values.flat();
      if (data.includes('error')) {
        state.validUrl = 'errorNetwork';
        return null;
      }
      state.posts = getNormalizePosts(state.openedLinks, data);
      return null;
    })
      .catch((e) => {
        console.log(e);
      });
  }
  return null;
};

export default () => {
  const state = {
    stateApp: 'filling',
    feeds: [],
    posts: [],
    validUrl: '',
    currentUrl: '',
    urls: [],
    idFeed: 0,
    idPost: 0,
    openedLinks: [],
  };
  const schema = yup.object().shape({
    website: yup.string().url(),
  });
  const watchedState = viewer(state);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = new FormData(e.target).get('url');
    isValid(url, watchedState, schema).then((result) => {
      switch (result) {
        case 'thereIsRssInState':
          watchedState.validUrl = 'thereIsRssInState';
          break;
        case 'hasRSS':
          watchedState.currentUrl = url;
          state.stateApp = 'processing';
          state.validUrl = '';
          getDataAfterParsing(watchedState);
          break;
        case 'noRSS':
          watchedState.validUrl = 'noRSS';
          break;
        case 'noValid':
          watchedState.validUrl = 'noValid';
          break;
        default:
          break;
      }
    });
  });
  const updateData = function updateDataFunction() {
    if (watchedState.stateApp === 'processed') {
      console.log('update');
      getDataAfterParsing(watchedState);
    }
    setTimeout(updateData, 5000);
  };
  updateData();
};
