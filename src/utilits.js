const parser = new DOMParser();

export const hasRSS = (url) => {
    try {
        const dom = parser.parseFromString(url, 'application/xml');
        if (dom.getElementsByTagName('parsererror').length > 0) {
            return false;
        } else {
            return true;
        }
    } catch {
        throw new Error('ParserError');
    }
};