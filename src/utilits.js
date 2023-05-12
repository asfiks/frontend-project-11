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

export const getFeedAndPostsNormalize = (state, data) => {
  const url = state.currentUrl;
  const [feed, posts] = data;
  if (state.stateApp === 'processing') {
    feed.id = url;
    const normalazedPosts = posts.map((post) => {
      state.idPosts += 1;
      post.id = state.idPosts;
      post.idFeed = url;
      return post;
    });
    return [feed, normalazedPosts];
  }
  if (state.stateApp === 'processed') {
    const links = state.usedLinks;
    const normalazedPosts = posts.map((post) => {
      state.idPosts += 1;
      post.id = state.idPosts;
      post.idFeed = url;
      if (links.includes(post.link)) {
        post.status = 'showed';
      }
      return post;
    });
    return normalazedPosts;
  }
  return null;
};
