const fs = require('fs');
let content = fs.readFileSync('src/pages/SurahDetail.jsx', 'utf8');

content = content.replace(/\\\\\\\\$\\{reciterInfo\\.name\\}/g, '\\\');
content = content.replace(/\\\\\\$\\{serverUrl\\}\\\$\\{formattedSurahId\\}\\.mp3\\\/g, '\\\\\.mp3\');
content = content.replace(/\\\\\/g, '\');

fs.writeFileSync('src/pages/SurahDetail.jsx', content, 'utf8');
