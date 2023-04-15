const parser = new DOMParser();

const getDataFromItem = (item, state) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  state.idPost += 1;
  const id = state.idPost;
  const idFeed = state.idFeed;
  return {
    id, idFeed, title, description, link,
  };
};

export default (content, state) => {
  try {
    const dom = parser.parseFromString(content, 'application/xml');
    if (dom.getElementsByTagName('parsererror').length > 0) {
      return 'noRSS';
    }
    const titleForFeed = dom.querySelector('channel > title').textContent;
    const descriptionForFeed = dom.querySelector('channel > description').textContent;
    const linkForFeed = dom.querySelector('channel > link').textContent;
    state.idFeed += 1;
    const feed = [
      {
        id: state.idFeed,
        title: titleForFeed,
        description: descriptionForFeed,
        link: linkForFeed,
      },
    ];
    const items = dom.querySelectorAll('item');
    const itemData = Array.from(items)
      .map((item) => getDataFromItem(item, state));
    state.idPost = 0;
    return [{ feed }, { posts: itemData }];
  } catch {
    throw new Error('ParserError');
  }
};
