import * as yup from 'yup';

export default () => {
    let inputUrl = ''
    const form = document.querySelector('.rss-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputData = new FormData(e.target)
        inputUrl = inputData.get('url')
        const schema = yup.object().shape({
            website: yup.string().url(),
          });
        return schema.validate({ website: inputUrl })
          .then(() => {
            console.log('Адрес сайта валидный');
          })
          .catch(() => {
            console.log('Адрес сайта не валидный');
          });
    })
}