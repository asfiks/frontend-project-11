import axios from 'axios';

const parser = new DOMParser();

export default (url) => axios.get(url).then((response) => {
  let answer = true;
  const dom = parser.parseFromString(response.data.contents, 'application/xml');
  if (dom.getElementsByTagName('parsererror').length > 0) {
    answer = false;
  } else {
    answer = true;
  }
  return answer;
});
