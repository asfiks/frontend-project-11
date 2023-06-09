const parser = new DOMParser();

const getDataFromItem = (item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  return {
    title, description, link,
  };
};

export default (data) => {
  try {
    const dom = parser.parseFromString(data, 'application/xml');
    if (dom.getElementsByTagName('parsererror').length > 0) {
      return 'noRSS';
    }
    const titleTextForFeed = dom.querySelector('channel > title').textContent;
    const descriptionForFeed = dom.querySelector('channel > description').textContent;
    const linkForFeed = dom.querySelector('channel > link').textContent;
    const items = dom.querySelectorAll('item');
    const itemsArr = Array.from(items);
    const feed = {
      title: titleTextForFeed,
      description: descriptionForFeed,
      link: linkForFeed,
    };
    const itemData = itemsArr.map((item) => getDataFromItem(item));
    return [feed, itemData];
  } catch {
    return 'parserError';
  }
};
