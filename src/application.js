import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import viewer from './view.js';
import texts from './locales/texts.js';
import parser from './parser.js';
import { hasRSS, getFeedAndPostsNormalize } from './utilits.js';

i18next.init({
  lng: 'ru',
  resources: {
    ru: { translation: texts },
  },
});

export const makeProxyLink = (url) => {
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
  .then(() => true)
  .catch(() => false);

export const getDataAfterParsing = (state) => {
  if (state.stateApp === 'processing') {
    return getDataFromURL(state.currentUrl, state)
      .then((data) => {
        if (data === 'error') {
          state.error = 'errorNetwork';
          state.stateApp = 'filling';
        } else {
          state.urls.push(state.currentUrl);
          const [currentFeed, currentPosts] = getFeedAndPostsNormalize(state, data);
          state.feeds.unshift(currentFeed);
          state.posts = currentPosts;
          state.stateApp = 'processed';
        }
      });
  } if (state.stateApp === 'processed') {
    const { urls } = state;
    const result = urls.map((url) => {
      state.currentUrl = url;
      return getDataFromURL(url, state)
        .then((data) => {
          if (data === 'error') {
            state.error = 'errorNetwork';
          }
          const dataNormalazed = getFeedAndPostsNormalize(state, data);
          return dataNormalazed;
        });
    });

    return Promise.all(result).then((values) => {
      const data = values.flat();
      if (data.includes('error')) {
        state.validUrl = 'errorNetwork';
        return null;
      }
      state.posts = data;
      return null;
    })
      .catch((e) => {
        console.log(e);
      });
  }
  return console.log('error in getDataAfterParsing');
};

const listenerLinks = (state) => {
  const allLinkInPosts = document.querySelectorAll('a[target="_blank"][rel="noopener noreferrer"]');
  allLinkInPosts.forEach((element) => {
    element.addEventListener('click', (event) => {
      element.classList.replace('fw-bold', 'fw-normal');
      element.classList.add('link-secondary');
      const link = (event.target).getAttribute('href');
      state.usedLinks.push(link);
    });
  });
};

export default () => {
  const state = {
    stateApp: 'filling',
    error: '',
    stateUpdate: '',
    feeds: [],
    posts: [],
    validUrl: '',
    currentUrl: '',
    urls: [],
    idPosts: 0,
    usedLinks: [],
  };
  const schema = yup.object().shape({
    website: yup.string().url(),
  });
  const watchedState = viewer(state);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = new FormData(e.target).get('url');
    if (state.urls.includes(url)) {
      watchedState.validUrl = 'thereIsRssInState';
      return;
    }
    isValid(url, watchedState, schema).then((result) => {
      console.log(result, 'валидность');
      if (result) {
        const proxyUrl = makeProxyLink(url);
        axios.get(proxyUrl).then((res) => {
          const dataCheck = hasRSS(res.data.contents);
          console.log('hasRSS', dataCheck);
          switch (dataCheck) {
            case 'errorNetwork':
              watchedState.errorNetwork = 'errorNetwork';
              break;
            case true:
              watchedState.validUrl = 'hasRSS';
              state.stateApp = 'processing';
              watchedState.currentUrl = url;
              return getDataAfterParsing(watchedState).then(() => listenerLinks(state));
            case false:
              watchedState.validUrl = 'noRSS';
              break;
            default:
              watchedState.errorNetwork = 'errorNetwork';
              break;
          }
          return null;
        });
      } else {
        watchedState.validUrl = 'noValid';
        return null;
      }
      return null;
    });
  });
  const updateData = function updateDataFunction() {
    if (watchedState.stateApp === 'processed') {
      getDataAfterParsing(watchedState)
        .then(() => {
          console.log('update');
          listenerLinks(state);
        })
        .finally(() => {
          setTimeout(updateData, 5000);
        });
    } else {
      setTimeout(updateData, 5000);
    }
  };
  updateData();
};
