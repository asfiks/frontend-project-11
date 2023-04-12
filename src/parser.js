export default (content) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(content, 'application/xml');
     
    return dom;
}