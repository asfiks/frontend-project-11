import axios from 'axios';

const parser = new DOMParser();

export default (url) => axios.get(url).then((response) => {
  const dom = parser.parseFromString(response.data.contents, 'application/xml');
  if (dom.getElementsByTagName('parsererror').length > 0) {
    return false;
  }
  return true;
})
  .catch(() => 'errorNetwork');
