import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import viewer from './view.js';
import texts from './locales/texts.js';
import parser from './parser.js';
import { hasRSS } from './utilits.js';

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

const getRSS = (url, state) => {
  const proxyUrl = makeProxyLink(url);
  return axios.get(proxyUrl)
    .then((response) =>  {
      (state.urls).push(url);
      return response.data.contents;
  })
    .catch((error) => {
      throw new Error(error);
    });
};

const isValid = (url, state, schema) => schema.validate({ website: url })
  .then(() => {
    
    if (state.urls.includes(url)) {
      state.validUrl = 'thereIs';
    } else {
      const proxyUrl = makeProxyLink(url);
      axios.get(proxyUrl).then((response) =>  {
          if (hasRSS(response.data.contents)) {
            (state.urls).push(url);
            state.nowUrl = url;
            console.log('valid')
            return state.validUrl = 'valid';
            
            
         } else {
          console.log('NOrss')
            return state.validUrl = 'noRSS';
            
          }
       })
     }
    
  })   
  .catch(() => {
    state.validUrl = 'noValid';
  });

const creatLiForPost = () => {
  const elementLi = document.createElement('li');
  elementLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  return elementLi;
};

const createElementA = (post) => {
  const elementA = document.createElement('a');
  elementA.href = post.link;
  elementA.textContent = post.title;
  elementA.classList.add('fw-bold');
  elementA.setAttribute('data-id', post.id);
  elementA.setAttribute('target', '_blank');
  elementA.setAttribute('rel', 'noopener noreferrer');
  return elementA;
}
const createButton = (post) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18next.t('button');
  button.setAttribute('data-id', post.id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  return button;
}

const createPost = (post) => {
  const liElement = creatLiForPost();
  liElement.append(createElementA(post));
  liElement.append(createButton(post));
  return liElement;
}
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
}
const createListForContent = () => {
  const elementUl = document.createElement('ul');
  elementUl.classList.add('list-group', 'border-0', 'rounded-0');
  return elementUl;
}

const creatFeeds = (feed) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'border-0', 'border-end-0');
  const h3 = document.createElement('h3');
  h3.classList.add('h6', 'm-0');
  h3.innerText = feed.title;
  const p = document.createElement('p');
  p.classList.add('m-0', 'small', 'text-black-50');
  p.innerText = feed.description;
  li.append(h3)
  li.append(p)
  return li;
}

const getTextDanger = (elementFeedback, elementInput, text) => {
  elementFeedback.textContent = text;
  elementFeedback.classList.remove('text-success');
  elementFeedback.classList.add('text-danger')
  elementInput.classList.add('is-invalid');
}
const render = (state) => {
  const sectionForm = document.querySelector('.bg-dark');
  const elementInput = document.querySelector('#url-input');
  const elementFeedback = sectionForm.querySelector('.feedback');
  if (state.validUrl === 'noRSS') {
    getTextDanger(elementFeedback, elementInput, i18next.t('noRSS'))
  }
  if (state.validUrl === 'thereIs') {
    getTextDanger(elementFeedback, elementInput, i18next.t('thereIsRss'));
  }
  if (state.validUrl === 'noValid') {
    getTextDanger(elementFeedback, elementInput, i18next.t('noValid'));
  }
  if (state.validUrl === 'valid') {
    elementFeedback.textContent = '';
    elementInput.classList.remove('is-invalid');
    elementInput.focus();
    //state.validUrl = '';
    getRSS(state.nowUrl, state).then((data) => {
             
        const dataAfterParsing = parser(data);
        const dataForState = {}
        dataForState[state.nowUrl] = dataAfterParsing;
        state.dataRSS.push(dataForState);
        if ((state.dataRSS).length === 1) {
          const containerPosts = document.querySelector('.posts');
          containerPosts.append(createNameLists(i18next.t('posts')))
          const containerFeeds = document.querySelector('.feeds');
          containerFeeds.append(createNameLists(i18next.t('feeds')));
          const containerWithPosts = containerPosts.querySelector('.card')
          containerWithPosts.append(createListForContent());
          const conteinerWithFeeds = containerFeeds.querySelector('.card');
          conteinerWithFeeds.append(createListForContent());
        }
        const containerPosts = document.querySelector('.posts');
        const containerWithListInPosts = containerPosts.querySelector('ul');
        const containerFeeds = document.querySelector('.feeds');
        const containerWithListInFeeds = containerFeeds.querySelector('ul')
        
        
/*         for (const d of state.dataRSS[0]) {
          console.log(d)
          if (d.posts) {
            for (const post of d.posts) {
              
              containerWithListInPosts.prepend(createPost(post));
            }
          }
          if (d.feed) {
            for (const feed of d.feed) {
              containerWithListInFeeds.prepend(creatFeeds(feed))
            }
          }
        } 
        elementFeedback.textContent = i18next.t('okRSS');
        elementFeedback.classList.remove('text-danger');
        elementFeedback.classList.add('text-success');
        elementInput.value = '';
        elementInput.focus(); */

      
      


    });
    
  }
};

export default () => {
  const state = {
    stateApp: '',
    validUrl: '',
    nowUrl: '',
    urls: [],
    idFeed: 0,
    idPost: 0,
    dataRSS: [],

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
