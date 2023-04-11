import * as yup from 'yup';
import viewer from './view.js';
import i18next from 'i18next';
import texts from './locales/texts.js'
import axios from 'axios';


i18next.init({
  lng: 'ru',
  resources: {
    ru: { translation: texts }
  }
});

const getRSS = (url) => {
  return axios.get(url)
    .then(response => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(response.data, 'application/xml');
      console.log(xml)
      return xml;
      })
    .catch(error => {
      console.log(error);
    });
      
}
const isValid = (data, state, schema) => {
  return schema.validate({ website: data })
    .then(() => {
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
    getRSS('https://ru.hexlet.io/lessons.rss')
  }
};

export default () => {
  const state = {
    valid: null,
    value: '',
  };
  const schema = yup.object().shape({
    website: yup.string().url(),
  });
  const watchedState = viewer(state, render);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputData = new FormData(e.target).get('url');
    isValid(inputData, watchedState, schema);
  });
};

