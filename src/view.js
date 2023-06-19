import onChange from 'on-change';
import i18next from 'i18next';

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

const renderForFeedback = (text) => {
  const sectionForm = document.querySelector('.bg-dark');
  const elementInput = document.querySelector('#url-input');
  const elementFeedback = sectionForm.querySelector('.feedback');
  getTextDanger(elementFeedback, elementInput, i18next.t(text));
  if (text === 'okRSS') {
    elementFeedback.textContent = i18next.t(text);
    elementFeedback.classList.remove('text-danger');
    elementFeedback.classList.add('text-success');
    elementInput.value = '';
    elementInput.focus();
  }
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
    elementA.classList.add('link-secondary');
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

const renderFeed = (containerWithListInFeeds, feed) => {
  containerWithListInFeeds.prepend(creatFeeds(feed));
};

const renderPosts = (containerWithListInPosts, posts) => {
  posts.forEach((post) => {
    containerWithListInPosts.prepend(createPost(post));
  });
};

const renderModal = (state, allButtonView, modalTitle, modalBodyWithText, linkInModal) => {
  allButtonView.forEach((button) => {
    button.addEventListener('click', (event) => {
      const elementWithEvent = event.target.parentNode;
      const openElementLink = elementWithEvent.querySelector('a');
      openElementLink.classList.replace('fw-bold', 'fw-normal');
      openElementLink.classList.add('link-secondary');
      const link = openElementLink.getAttribute('href');
      state.uiState.usedLinks.push(link);
      const [dataForModal] = (state.posts).filter((post) => post.link === link);
      modalTitle.textContent = dataForModal.title;
      modalBodyWithText.textContent = dataForModal.description;
      linkInModal.setAttribute('href', link);
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
  if ((state.uiState.usedUrls).length === 1 && state.form.stateApp === 'processing') {
    containerPosts.append(createNameLists(i18next.t('posts')));
    containerFeeds.append(createNameLists(i18next.t('feeds')));
  }
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
  const allButtonView = containerWithListInPosts.querySelectorAll('button');
  renderModal(state, allButtonView, modalTitle, modalBodyWithText, linkInModal);
  renderForFeedback('okRSS');
};

const renderForUpdate = (state) => {
  const containerPosts = document.querySelector('.posts');
  const containerModal = document.querySelector('.modal');
  const modalTitle = containerModal.querySelector('.modal-title');
  const modalBodyWithText = containerModal.querySelector('.modal-body');
  const linkInModal = containerModal.querySelector('a');
  const containerWithListInPosts = containerPosts.querySelector('ul');
  const { posts } = state;
  while (containerWithListInPosts.firstChild) {
    containerWithListInPosts.removeChild(containerWithListInPosts.firstChild);
  }
  renderPosts(containerWithListInPosts, posts);
  const allButtonView = containerWithListInPosts.querySelectorAll('button');
  renderModal(state, allButtonView, modalTitle, modalBodyWithText, linkInModal);
};

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.valid' && value !== '') {
      switch (value) {
        case 'thereIsRssInState':
          renderForFeedback('thereIsRss');
          break;
        case 'noRSS':
          renderForFeedback('noRSS');
          break;
        case 'noValid':
          renderForFeedback('noValid');
          break;
        default:
          break;
      }
    }
    if (path === 'form.processError' && value === 'errorNetwork') {
      renderForFeedback('errorNetwork');
    }
    if (path === 'posts') {
      switch (state.form.stateApp) {
        case 'processing':
          render(watchedState);
          break;
        case 'processed':
          renderForUpdate(watchedState);
          break;
        default:
          break;
      }
    }
  });
  return watchedState;
};
