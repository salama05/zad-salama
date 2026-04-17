const fs = require('fs');
let file = fs.readFileSync('src/pages/SurahDetail.jsx', 'utf8');

const newEffect = `  useEffect(() => {
    setLoading(true);

    const setupAudio = () => {
       // Full Surah flow
       // Pad the surah ID to 3 digits (e.g. 1 -> 001.mp3)
       const formattedSurahId = String(surahId).padStart(3, '0');
       let serverUrl = '';
       let reciterName = '';
       
       if (savedMushaf === 'qalun') {
           const reciterInfo = qalunReciters.find(r => r.id.toString() === selectedQalunReciter);
           if (reciterInfo) {
               serverUrl = reciterInfo.server;
               reciterName = \\\`\${reciterInfo.name} (قالون)\\\`;
           }
       } else if (savedMushaf === 'doori') {
           const reciterInfo = dooriReciters.find(r => r.id.toString() === selectedDooriReciter);
           if (reciterInfo) {
               serverUrl = reciterInfo.server;
               reciterName = \\\`\${reciterInfo.name} (الدوري)\\\`;
           }
       } else if (savedMushaf === 'warsh') {
           const reciterInfo = warshReciters.find(r => r.id.toString() === selectedWarshReciter);
           if (reciterInfo) {
               serverUrl = reciterInfo.server;
               reciterName = \\\`\${reciterInfo.name} (ورش عن نافع)\\\`;
           }
       } else if (savedMushaf === 'hafs') {
           const reciterInfo = hafsReciters.find(r => r.id.toString() === selectedHafsReciter);
           if (reciterInfo) {
               serverUrl = reciterInfo.server;
               reciterName = \\\`\${reciterInfo.name} (حفص عن عاصم)\\\`;
           }
       }
       
       setFullSurahAudioUrl(\\\`\${serverUrl}\${formattedSurahId}.mp3\\\`);
       setFullSurahReciterName(reciterName);
    };

    if (savedMushaf === 'hafs') {
       axios.get('/quran-hafs.json')
         .then(res => {
           const surahs = res.data.data.surahs;
           const currentSurah = surahs[parseInt(surahId) - 1];
           if (currentSurah) {
              setSurahName(currentSurah.name.replace('سُورَةُ ', ''));
              setSurahVerses(currentSurah.ayahs);
           }
         })
         .catch(err => console.error("Error offline Quran", err))
         .finally(() => {
           setupAudio();
           setLoading(false);
         });
    } else {
        // 1. Fetch Surah info (for name and pages)
        const surahInfoReq = axios.get('https://mp3quran.net/api/v3/suwar');
        
        surahInfoReq.then(infoRes => {
           const surahs = infoRes.data.suwar;
           const currentSurah = surahs.find(s => s.id === parseInt(surahId));
            
           if (currentSurah) {
              setSurahName(currentSurah.name);
              const pageArray = [];
              for (let p = currentSurah.start_page; p <= currentSurah.end_page; p++) {
                pageArray.push(p);
              }
              setPages(pageArray);
           }
           
           setupAudio();
           setLoading(false);
        }).catch(err => {
           console.error("Error fetching suwar", err);
           setLoading(false);
        });
    }
  }, [surahId, savedMushaf, selectedWarshReciter, selectedHafsReciter, selectedQalunReciter, selectedDooriReciter]);`.replace(/\\\\/g, '');

let fileNoCR = file.replace(/\r/g, '');

let idx = fileNoCR.indexOf('  useEffect(() => {\n    setLoading(true);\n\n    // 1. Fetch Surah info');
if (idx !== -1) {
  let endIdx = fileNoCR.indexOf('}, [surahId, savedMushaf, selectedWarshReciter, selectedHafsReciter, selectedQalunReciter, selectedDooriReciter]);', idx);
  if (endIdx !== -1) {
    let replaced = fileNoCR.substring(0, idx) + newEffect + '\n' + fileNoCR.substring(endIdx + 117);
    fs.writeFileSync('src/pages/SurahDetail.jsx', replaced, 'utf8');
    console.log('Success!');
  } else console.log('endIdx not found', fileNoCR.indexOf('}, [surahId'));
} else console.log('idx not found');
