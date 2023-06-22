import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import viewer from './view.js';
import texts from './locales/texts.js';
import parser from './parser.js';
import { hasRSS, getNormalizeNewData, getNormalizeUpdateData } from './utilits.js';

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

const getDataForRender = (data, state, url) => {
  const feedAndPosts = parser(data);
  const [currentFeed, currentPosts] = getNormalizeNewData(url, feedAndPosts);
  state.feeds.unshift(currentFeed);
  state.posts = currentPosts;
  return null;
};

const getNewPosts = (state) => {
  const { usedUrls } = state.uiState;
  const result = usedUrls.map((url) => getDataFromURL(url, state)
    .then((data) => {
      if (data === 'error') {
        return 'error';
      }
      const dataNormalazed = getNormalizeUpdateData(state, url, data);
      return dataNormalazed;
    })
    .catch((e) => {
      throw new Error(e);
    }));

  return Promise.all(result).then((values) => {
    const data = values.flat();
    console.log(data);
    if (data.includes('error')) {
      return false;
    }
    state.posts = data;
    return true;
  })
    .catch((e) => {
      state.form.errors.push(e);
    });
};

const listenerLinks = (state) => {
  const allLinkInPosts = document.querySelectorAll('a[target="_blank"][rel="noopener noreferrer"]');
  allLinkInPosts.forEach((element) => {
    element.addEventListener('click', (event) => {
      const link = (event.target).getAttribute('href');
      state.uiState.openedLinks.push(link);
      state.uiState.curentVisitLink = element;
    });
  });
};

const listenerButtonsModal = (state) => {
  const containerPosts = document.querySelector('.posts');
  const containerWithListInPosts = containerPosts.querySelector('ul');
  const allButtonView = containerWithListInPosts.querySelectorAll('button');
  allButtonView.forEach((button) => {
    button.addEventListener('click', (event) => {
      const elementWithEvent = event.target.parentNode;
      const openElementLink = elementWithEvent.querySelector('a');
      const link = openElementLink.getAttribute('href');
      state.uiState.openedLinks.push(link);
      const [dataForModal] = (state.posts).filter((post) => post.link === link);
      //modalRender(openElementLink, dataForModal, link)
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
        validateStatus: '',
        stateApp: 'filling',
        processError: null,
        errors: [],
      },
      feeds: [],
      posts: [],
      uiState: {
        usedUrls: [],
        openedLinks: [],
        curentVisitLink: null,
      },
    };
    const schema = yup.object().shape({
      website: yup.string().url(),
    });
    const watchedState = viewer(state);
    const form = document.querySelector('.rss-form');
    form.addEventListener('submit', (e) => {
      watchedState.form.validateStatus = 'newUrl';
      e.preventDefault();
      const url = new FormData(e.target).get('url');
      if (state.uiState.usedUrls.includes(url)) {
        watchedState.form.validateStatus = 'thereIsRssInState';
        return;
      }
      schema.validate({ website: url })
        .then(() => {
          watchedState.form.processError = null;
          const proxyUrl = makeProxyLink(url);
          axios.get(proxyUrl).then((res) => {
            const data = res.data.contents;
            const dataCheck = hasRSS(data);
            switch (dataCheck) {
              case 'errorNetwork':
                watchedState.form.processError = 'errorNetwork';
                break;
              case true:
                watchedState.form.validateStatus = 'hasRSS';
                state.form.stateApp = 'processing';
                (watchedState.uiState.usedUrls).push(url);
                getDataForRender(data, watchedState, url);
                watchedState.form.stateApp = 'processed';
                listenerLinks(watchedState);
                listenerButtonsModal(watchedState)
                break;
              case false:
                watchedState.form.validateStatus = 'noRSS';
                break;
              default:
                throw new Error(`Unknown dataCheck value: ${dataCheck}`);
            }
            return null;
          })
            .catch((error) => {
              watchedState.form.processError = 'errorNetwork';
              console.error(error);

            });
        })
        .catch(() => {
          watchedState.form.validateStatus = 'noValid';
          return null;
        });
    });
    const updateData = function updateDataFunction() {
      getNewPosts(watchedState)
        .then((result) => {
          if (result) {
            listenerLinks(watchedState);
          }
        })
        .finally(() => {
          setTimeout(updateData, 5000);
        });
    };
    //updateData();
  });
};
