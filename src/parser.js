const parser = new DOMParser();

const getDataFromItem = (item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  const status = 'noShowed';
  const id = null;
  const idFeed = null;
  return {
    id, idFeed, title, description, link, status,
  };
};

export default (data, state) => {
  try {
    const dom = parser.parseFromString(data, 'application/xml');
    const titleTextForFeed = dom.querySelector('channel > title').textContent;
    const descriptionForFeed = dom.querySelector('channel > description').textContent;
    const linkForFeed = dom.querySelector('channel > link').textContent;
    const items = dom.querySelectorAll('item');
    const itemsArr = Array.from(items);
    if (state.stateApp === 'processing') {
      const feed = {
        id: null,
        title: titleTextForFeed,
        description: descriptionForFeed,
        link: linkForFeed,
      };
      const itemData = itemsArr.map((item) => getDataFromItem(item, state));
      return [feed, itemData];
    }
    if (state.stateApp === 'processed') {
      const itemData = itemsArr.map((item) => getDataFromItem(item, state));
      return itemData;
    }
  } catch (e) {
    console.log(e);
    return 'error';
  }
  return null;
};
