import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import viewer from './view.js';
import texts from './locales/texts.js';
import parser from './parser.js';
import hasRSS from './utilits.js';

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

const creatLiForPost = () => {
  const elementLi = document.createElement('li');
  elementLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  return elementLi;
};

const createElementA = (post) => {
  const elementA = document.createElement('a');
  elementA.href = post.link;
  elementA.textContent = post.title;
  if (post.status === 'noShowed') {
    elementA.classList.add('fw-bold');
  } else {
    elementA.classList.add('fw-normal');
  }
  elementA.setAttribute('data-id', post.id);
  elementA.setAttribute('target', '_blank');
  elementA.setAttribute('rel', 'noopener noreferrer');
  return elementA;
};

const createButton = (post) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18next.t('button');
  button.setAttribute('data-id', post.id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  return button;
};

const createPost = (post) => {
  const liElement = creatLiForPost();
  liElement.append(createElementA(post));
  liElement.append(createButton(post));
  return liElement;
};
const createNameLists = (text) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const containerForText = document.createElement('div');
  containerForText.classList.add('card-body');
  const elementForText = document.createElement('h2');
  elementForText.classList.add('card-title', 'h4');
  elementForText.textContent = text;
  containerForText.append(elementForText);
  container.append(containerForText);
  return container;
};
const createListForContent = () => {
  const elementUl = document.createElement('ul');
  elementUl.classList.add('list-group', 'border-0', 'rounded-0');
  return elementUl;
};

const creatFeeds = (feed) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'border-0', 'border-end-0');
  const h3 = document.createElement('h3');
  h3.classList.add('h6', 'm-0');
  h3.innerText = feed.title;
  const p = document.createElement('p');
  p.classList.add('m-0', 'small', 'text-black-50');
  p.innerText = feed.description;
  li.append(h3);
  li.append(p);
  return li;
};

const getTextDanger = (elementFeedback, elementInput, text) => {
  try {
    elementFeedback.textContent = text;
    elementFeedback.classList.remove('text-success');
    elementFeedback.classList.add('text-danger');
    elementInput.classList.add('is-invalid');
  } catch (e) {
    throw new Error(e);
  }
};

const getDataFromURL = (url, state) => {
  const proxyUrl = makeProxyLink(url);
  return axios.get(proxyUrl)
    .then((response) => {
      return parser(response.data.contents, state)
    })
    .catch(() => {
      return 'error';
    });
};

const isValid = (url, state, schema) => schema.validate({ website: url })
  .then(() => {
    if (state.urls.includes(url)) {
      return 'thereIsRssInState';
    }
    const proxyUrl = makeProxyLink(url);
    return hasRSS(proxyUrl).then((result) => {
      if (result) {
        return 'hasRSS';
      }
      if (!result){
        return 'noRSS';
      }
      if (result.message === "Network Error") {
        return 'errorNetwork';
      }
    });
  })
  .catch(() => 'noValid')

const getDataAfterParsing = (state) => {
  if (state.stateApp === 'processing') {
    return getDataFromURL(state.currentUrl, state)
      .then((data) => {
        if (data === 'error') {
          state.validUrl = 'errorNetwork';
          return state.stateApp = 'filling';
        } else {
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
        } else {
          return data;
        }
      }));
    Promise.all(result).then((values) => {
      const data = values.flat();
      if (data.includes(undefined)) {
        return state.validUrl = 'errorNetwork'
      } else {
      state.posts = data;
      }
    })
    .catch((e) => {
      console.log(e);
    }) 
  }
};

const renderForFeedback = (state) => {
  const sectionForm = document.querySelector('.bg-dark');
  const elementInput = document.querySelector('#url-input');
  const elementFeedback = sectionForm.querySelector('.feedback');
  switch (state.validUrl) {
    case 'errorNetwork':
      getTextDanger(elementFeedback, elementInput, i18next.t('errorNetwork'));
      state.validUrl = '';
      break;
    case 'noRSS':
      getTextDanger(elementFeedback, elementInput, i18next.t('noRSS'));
      state.validUrl = '';
      break;
    case 'thereIsRssInState':
      getTextDanger(elementFeedback, elementInput, i18next.t('thereIsRss'));
      state.validUrl = '';
      break;
    case 'noValid':
      getTextDanger(elementFeedback, elementInput, i18next.t('noValid'));
      state.validUrl = '';
      break;
    case 'hasRSS':
      state.urls.push(state.currentUrl);
      state.stateApp = 'processing';
      state.validUrl = '';
      break;
    case 'rssIsLoad':
      elementFeedback.textContent = i18next.t('okRSS');
      elementFeedback.classList.remove('text-danger');
      elementFeedback.classList.add('text-success');
      elementInput.value = '';
      elementInput.focus();
      state.validUrl = '';
      break;
    default:
      break;
  }
};

const renderModal = (state, allButtonView, modalTitle, modalBodyWithText, linkInModal) => {
  allButtonView.forEach((button) => {
    button.addEventListener('click', (event) => {
      const elementWithEvent = event.target.parentNode;
      const openElementLink = elementWithEvent.querySelector('a');
      openElementLink.classList.replace('fw-bold', 'fw-normal');
      const link = openElementLink.getAttribute('href');
      state.openedLinks.push(link);
      const [dataForModal] = (state.posts).filter((post) => post.link === link);
      modalTitle.textContent = dataForModal.title;
      modalBodyWithText.textContent = dataForModal.description;
      linkInModal.setAttribute('href', link);
    });
  });
};

const renderFeed = (containerWithListInFeeds, feed) => {
  containerWithListInFeeds.prepend(creatFeeds(feed));
};

const renderPosts = (containerWithListInPosts, posts) => {
  posts.forEach((post) => {
    containerWithListInPosts.prepend(createPost(post));
  });
};

const listenerLinks = (state, allElementsLiInPosts) => {
  allElementsLiInPosts.forEach((element) => {
    element.addEventListener('click', (event) => {
      element.classList.replace('fw-bold', 'fw-normal');
      const link = (event.target).getAttribute('href');
      state.openedLinks.push(link);
    });
  });
};

const render = (state) => {
  const containerPosts = document.querySelector('.posts');
  const containerFeeds = document.querySelector('.feeds');
  const containerModal = document.querySelector('.modal');
  const modalTitle = containerModal.querySelector('.modal-title');
  const modalBodyWithText = containerModal.querySelector('.modal-body');
  const linkInModal = containerModal.querySelector('a');
  if ((state.urls).length === 1 && state.stateApp === 'processing') {
    containerPosts.append(createNameLists(i18next.t('posts')));
    containerFeeds.append(createNameLists(i18next.t('feeds')));
  }
  if (state.stateApp === 'processing') {
    const conteinerWithFeeds = containerFeeds.querySelector('.card');
    conteinerWithFeeds.append(createListForContent());
    const containerWithPosts = containerPosts.querySelector('.card');
    containerWithPosts.append(createListForContent());
    const feed = state.feeds[0];
    const { posts } = state;
    const containerWithListInFeeds = containerFeeds.querySelector('ul');
    renderFeed(containerWithListInFeeds, feed);
    const containerWithListInPosts = containerPosts.querySelector('ul');
    renderPosts(containerWithListInPosts, posts);
    state.validUrl = 'rssIsLoad';
    const allButtonView = containerWithListInPosts.querySelectorAll('button');
    renderModal(state, allButtonView, modalTitle, modalBodyWithText, linkInModal);
    renderForFeedback(state);
    state.stateApp = 'processed';
    return;
  }
  if (state.stateApp === 'processed') {
    const containerWithListInPosts = containerPosts.querySelector('ul');
    const { posts } = state;
    while (containerWithListInPosts.firstChild) {
      containerWithListInPosts.removeChild(containerWithListInPosts.firstChild);
    }
    renderPosts(containerWithListInPosts, posts);
    const allElementsLiInPosts = containerWithListInPosts.querySelectorAll('a');
    listenerLinks(state, allElementsLiInPosts);
    const allButtonView = containerWithListInPosts.querySelectorAll('button');
    renderModal(state, allButtonView, modalTitle, modalBodyWithText, linkInModal);
  }
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
    timerId: null,
  };
  const schema = yup.object().shape({
    website: yup.string().url(),
  });
  const watchedState = viewer(state, renderForFeedback, render, getDataAfterParsing);
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
          watchedState.validUrl = 'hasRSS';
          break;
        case 'noRSS':
          watchedState.validUrl = 'noRSS';
          break;
        case 'noValid':
          watchedState.validUrl = 'noValid';
          break;
        default:
          throw new Error();
          break;
      }
    });
  });
  const updateData = function () {
    if (watchedState.stateApp === 'processed') {
      getDataAfterParsing(watchedState);
    }
    setTimeout(updateData, 5000);
  };
  updateData();
};
