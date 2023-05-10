import axios from 'axios';

const parser = new DOMParser();

export const hasRSS = (url) => axios.get(url).then((response) => {
  const dom = parser.parseFromString(response.data.contents, 'application/xml');
  if (dom.getElementsByTagName('parsererror').length > 0) {
    return false;
  }
  return true;
})
  .catch(() => 'errorNetwork');

export const getNormalizePosts = (links, posts) => posts.map((post) => {
  if (links.includes(post.link)) {
    post.status = 'showed';
  }
  return post;
});
