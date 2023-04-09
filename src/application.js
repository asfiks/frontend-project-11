import * as yup from 'yup';
import viewer from './view';

const isValid = (data, state) => {
  const schema = yup.object().shape({
    website: yup.string().url(),
  });
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
    elementFeedback.textContent = 'Ссылка должна быть валидным URL';
    elementInput.classList.add('is-invalid');
  }
  if (state.valid === true) {
    elementFeedback.textContent = '';
    elementInput.classList.remove('is-invalid');
    elementInput.focus();
  }
};

export default () => {
  const state = {
    valid: null,
    value: '',
  };
  const watchedState = viewer(state, render);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputData = new FormData(e.target).get('url');
    isValid(inputData, watchedState);
  });
};
