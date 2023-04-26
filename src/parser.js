const parser = new DOMParser();

const getDataFromItem = (item, state) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  state.idPost += 1;
  const id = state.idPost;
  const { idFeed } = state;
  return {
    id, idFeed, title, description, link,
  };
};

export default (data, state) => {
  const dom = parser.parseFromString(data, 'application/xml');
  if (dom.parseError) {
    return { error: 'Unable to parse XML' };
  }
  const titleTextForFeed = dom.querySelector('channel > title').textContent;
  const descriptionForFeed = dom.querySelector('channel > description').textContent;
  const linkForFeed = dom.querySelector('channel > link').textContent;
  if (state.stateApp === 'filling') {
    state.idFeed += 1;
  }
  const feed = {
      id: state.idFeed,
      title: titleTextForFeed,
      description: descriptionForFeed,
      link: linkForFeed,
  };

  const items = dom.querySelectorAll('item');
  const itemData = Array.from(items)
    .map((item) => getDataFromItem(item, state));
  if (state.stateApp === 'changePosts') {
    return itemData;
  }
  return [ feed , itemData ];
};
