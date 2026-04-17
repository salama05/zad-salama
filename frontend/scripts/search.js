import axios from 'axios';
axios.get('https://api.github.com/search/code?q="الجزائر"+مدينة+json+extension:json', { headers: { 'User-Agent': 'node' }})
  .then(res => {
     res.data.items.slice(0,3).forEach(i => console.log(i.html_url));
  }).catch(e => console.error(e.message));
