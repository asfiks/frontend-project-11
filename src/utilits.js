import { uniqueId } from 'lodash';
const parser = new DOMParser();

export const hasRSS = (data) => {
  try {
    const dom = parser.parseFromString(data, 'application/xml');
    if (dom.getElementsByTagName('parsererror').length > 0) {
      return false;
    }
    return true;
  } catch {
    return 'errorNetwork';
  }
};
// const makeResponse = (url) => axios.get(url)

export const getFeedAndPostsNormalize = (state, data) => {
  const url = state.uiState.currentUrl;
  const [feed, posts] = data;

  if (state.form.stateApp === 'processing') {
    feed.id = url;
    const normalazedPosts = posts.map((post) => {
      const postId = uniqueId();
      post.id = postId;
      post.idFeed = url;
      post.status = 'noShowed';
      return post;
    });
    return [feed, normalazedPosts];
  }

  if (state.form.stateApp === 'processed') {
    const links = state.uiState.usedLinks;
    const normalazedPosts = posts.map((post) => {
      const postId = uniqueId();
      post.id = postId;
      post.idFeed = url;
      post.status = links.includes(post.link) ? 'showed' : 'noShowed';
      return post;
    });
    return normalazedPosts;
  }

  return null;
};
