import axios from 'axios';
const parser = new DOMParser();

export const hasRSS = (url) => {
    return axios.get(url).then((response) => {
      let answer = true;
      const dom = parser.parseFromString(response.data.contents, 'application/xml');
      if (dom.getElementsByTagName('parsererror').length > 0) {

        answer = false;          
      } else {
        
        answer = true;
      }
      
      return answer;
    })
};

const answer = () => {

}
/* 
export const hasRSS = (url) => {
  let answer = true;
  return axios.head(url)
  .then((response) => {
    const contentType = response.headers['content-type'];
    console.log(contentType)
    if (contentType.includes('application/rss+xml') || contentType.includes('application/xml')) {
      answer = true;
      console.log('ok')
    } else {
      answer = false;
    }
    console.log(answer)
    return answer;
  })
  .catch((error) => {
    console.error(error);
  });
} */