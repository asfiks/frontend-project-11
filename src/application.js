import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import viewer from './view.js';
import texts from './locales/texts.js';
import parser from './parser.js';
import { hasRSS, getFeedAndPostsNormalize } from './utilits.js';

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

const getDataAfterParsing = (state, url) => getDataFromURL(url, state)
  .then((data) => {
    if (data === 'error') {
      state.form.processError = 'errorNetwork';
      state.form.stateApp = 'filling';
    } else {
      const [currentFeed, currentPosts] = getFeedAndPostsNormalize(state, data);
      state.feeds.unshift(currentFeed);
      state.posts = currentPosts;
      state.form.stateApp = 'processed';
    }
    return null;
  });

const getNewPosts = (state) => {
  const { usedUrls } = state.uiState;
  const result = usedUrls.map((url) => {
    state.uiState.currentUrl = url;
    return getDataFromURL(url, state)
      .then((data) => {
        if (data === 'error') {
          state.form.processError = 'errorNetwork';
        }
        const dataNormalazed = getFeedAndPostsNormalize(state, data);
        return dataNormalazed;
      })
      .catch (() => {
        state.form.processError = 'errorNetwork';
      });
  });

  return Promise.all(result).then((values) => {
    const data = values.flat();
    if (data.includes('error')) {
      state.form.processError = 'errorNetwork';
      return null;
    }
    state.posts = data;
    console.log(data)
    return null;
  })
    .catch((e) => {
      state.form.errors.push(e);
    });
};

const listenerLinks = (state) => {
  const allLinkInPosts = document.querySelectorAll('a[target="_blank"][rel="noopener noreferrer"]');
  allLinkInPosts.forEach((element) => {
    element.addEventListener('click', (event) => {
      element.classList.replace('fw-bold', 'fw-normal');
      element.classList.add('link-secondary');
      const link = (event.target).getAttribute('href');
      state.uiState.usedLinks.push(link);
    });
  });
};

export default () => {
  i18next.init({
    lng: 'ru',
    resources: {
      ru: { translation: texts },
    },
  }).then(() => {
    const state = {
      form: {
        valid: '',
        stateApp: 'filling',
        processError: null,
        errors: []
      },
      feeds: [],
      posts: [],
      uiState: {
        currentUrl: '',
        usedUrls: [],
        idPosts: 0,
        usedLinks: [],
      },
    };
    const schema = yup.object().shape({
      website: yup.string().url(),
    });
    const watchedState = viewer(state);
    const form = document.querySelector('.rss-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = new FormData(e.target).get('url');
      if (state.uiState.usedUrls.includes(url)) {
        watchedState.form.valid = 'thereIsRssInState';
        return;
      }
      schema.validate({ website: url })
        .then(() => {
          const proxyUrl = makeProxyLink(url);
          axios.get(proxyUrl).then((res) => {
            const data = res.data.contents;
            const dataCheck = hasRSS(data);
            switch (dataCheck) {
              case 'errorNetwork':
                watchedState.form.processError = 'errorNetwork';
                break;
              case true:
                watchedState.form.valid = 'hasRSS';
                state.form.stateApp = 'processing';
                watchedState.uiState.currentUrl = url;
                watchedState.uiState.usedUrls.push(url);
                const feedAndPosts = parser(data, watchedState);
                const [currentFeed, currentPosts] = getFeedAndPostsNormalize(watchedState, feedAndPosts);
                console.log(currentFeed, currentPosts)
                watchedState.feeds.unshift(currentFeed);
                watchedState.posts = currentPosts;
                watchedState.form.stateApp = 'processed';
                listenerLinks(watchedState);
                return ;
              case false:
                watchedState.form.valid = 'noRSS';
                break;
              default:
                watchedState.form.processError = 'errorNetwork';
                break;
            }
            return null;
          })
          .catch(() => watchedState.form.processError = 'errorNetwork' )
        })
        .catch(() => {
          watchedState.form.valid = 'noValid';
          return null;
        });
    });
    const updateData = function updateDataFunction() {
      if (watchedState.form.stateApp === 'processed') {
        getNewPosts(watchedState)
          .then(() => {
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
  });
};
