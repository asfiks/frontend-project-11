import { uniqueId } from 'lodash';

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
