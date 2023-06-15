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
  const url = state.currentUrl;
  const [feed, posts] = data;
  if (state.stateApp === 'processing') {
    feed.id = url;
    const normalazedPosts = posts.map((post) => {
      state.idPosts += 1;
      post.id = state.idPosts;
      post.idFeed = url;
      post.status = 'noShowed';
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
      } else {
        post.status = 'noShowed';
      }
      return post;
    });
    return normalazedPosts;
  }
  return null;
};
