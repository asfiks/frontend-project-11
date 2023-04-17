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
    const titleForFeed = dom.querySelector('channel > title').textContent;
    const descriptionForFeed = dom.querySelector('channel > description').textContent;
    const linkForFeed = dom.querySelector('channel > link').textContent;
     const feed = [
      {
        title: titleForFeed,
        description: descriptionForFeed,
        link: linkForFeed,
      },
    ];
    const items = dom.querySelectorAll('item');
    const itemData = Array.from(items)
      .map((item) => getDataFromItem(item));
    return [{ feed }, { posts: itemData }];
  } catch {
    throw new Error('ParserError');
  }
};
