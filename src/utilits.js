import axios from 'axios';
/* const parser = new DOMParser();

export const hasRSS = (url) => {
    const dom = parser.parseFromString(url, 'application/xml');
    if (dom.getElementsByTagName('parsererror').length > 0) {
        return false;
    } else {
        return true;
    }
}; */

export const hasRSS = (url) => axios.head(url)
  .then((response) => {
    const contentType = response.headers['content-type'];
    if (contentType.includes('application/rss+xml') || contentType.includes('application/xml')) {
      return true;
    }
    return false;
  })
  .catch((error) => {
    console.error(error);
  });
