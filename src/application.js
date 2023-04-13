import * as yup from 'yup';
import viewer from './view.js';
import i18next from 'i18next';
import texts from './locales/texts.js'
import axios from 'axios';
import parser from './parser.js'


i18next.init({
  lng: 'ru',
  resources: {
    ru: { translation: texts }
  }
});

const makeProxyLink = (url) => {
  const proxy = new URL('/get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('url', url);
  proxy.searchParams.set('disableCache', true);
  return proxy;
};

const getRSS = (url) => {
  const proxyUrl = makeProxyLink(url)
  return axios.get(proxyUrl)
   .then(response => {
      return parser(response.data.contents);  
  })
    .catch (error => {
      console.log(error)
    })     
}

const isValid = (data, state, schema) => {
  return schema.validate({ website: data })
    .then(() => {
      state.value = data;
      state.valid = true;
  })
    .catch(() => {
      state.valid = false;
    });
};

const render = (state) => {
  
  const section = document.querySelector('.bg-dark');
  const elementInput = document.querySelector('#url-input');
  const elementFeedback = section.querySelector('.text-danger');
  if (state.valid === false) {
    elementFeedback.textContent = i18next.t('noValid');
    elementInput.classList.add('is-invalid');
  }
  if (state.valid === true) {
    elementFeedback.textContent = '';
    elementInput.classList.remove('is-invalid');
    elementInput.focus();
    state.valid = null;
    getRSS(state.value).then(data => console.log(data));
    
  }
};

export default () => {
  const state = {
    validUrl: {
      valid: null,
    },
    value: '',
    countFeed: 0,
  };
  const schema = yup.object().shape({
    website: yup.string().url(),
  });
  const watchedState = viewer(state.validUrl, render);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputData = new FormData(e.target).get('url');
    isValid(inputData, watchedState, schema);
  });
};

