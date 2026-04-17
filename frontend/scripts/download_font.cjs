const fs = require('fs');
const https = require('https');
const url = 'https://raw.githubusercontent.com/alquran/common/main/fonts/uthmanic_hafs.ttf';
https.get(url, (res) => {
    if(res.statusCode === 200) {
        res.pipe(fs.createWriteStream('public/uthmanic_hafs.ttf'));
        console.log('Font downloaded');
    } else {
        console.log('Failed:', res.statusCode);
    }
});
