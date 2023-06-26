import { uniqueId } from 'lodash';

/* const parser = new DOMParser();

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
}; */

export const getNormalizeNewData = (url, data) => {
  const [feed, posts] = data;
  feed.id = url;
  const normalazedPosts = posts.map((post) => {
    const postId = uniqueId();
    post.id = postId;
    post.idFeed = url;
    post.status = 'noShowed';
    return post;
  });
  return [feed, normalazedPosts];
};

export const getNormalizeUpdateData = (state, url, data) => {
  const [, posts] = data;
  const links = state.uiState.openedLinks;
  const normalazedPosts = posts.map((post) => {
    const postId = uniqueId();
    post.id = postId;
    post.idFeed = url;
    post.status = links.includes(post.link) ? 'showed' : 'noShowed';
    return post;
  });
  return normalazedPosts;
};
