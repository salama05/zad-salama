const fs = require('fs');
let code = fs.readFileSync('src/pages/SurahDetail.jsx', 'utf8');

// Add states
code = code.replace(
  /const \[pages, setPages\] = useState\(\[\]\);/,
  "const [pages, setPages] = useState([]);\n  const [surahVerses, setSurahVerses] = useState([]);\n  const [pagesTextData, setPagesTextData] = useState({});"
);

// Add isTextMushaf
code = code.replace(
  /const isUnsupportedVisual = /g,
  "const isTextMushaf = savedMushaf === 'hafs';\n  const isUnsupportedVisual = "
);

// Modify useEffect to fetch quran-hafs.json if needed
const effectBlockStart =     const surahInfoReq = axios.get('https://mp3quran.net/api/v3/suwar');;
const newEffectBlock = 
    const surahInfoReq = axios.get('https://mp3quran.net/api/v3/suwar');
    
    if (savedMushaf === 'hafs') {
        axios.get('/quran-hafs.json').then(res => {
            const surahs = res.data.data.surahs;
            const currentHafsSurah = surahs.find(s => s.number === parseInt(surahId));
            if (currentHafsSurah) {
                setSurahVerses(currentHafsSurah.ayahs);
                // Group by page
                const grouped = {};
                currentHafsSurah.ayahs.forEach(ayah => {
                    if (!grouped[ayah.page]) grouped[ayah.page] = [];
                    grouped[ayah.page].push(ayah);
                });
                setPagesTextData(grouped);
                const pageArray = Object.keys(grouped).map(Number).sort((a,b)=>a-b);
                setPages(pageArray);
            }
        });
    }
;
code = code.replace(effectBlockStart, newEffectBlock);

// Prevent default pages logic if it's hafs
const fallbackPagesLogic =        if (currentSurah) {
          setSurahName(currentSurah.name);
          const pageArray = [];
          for (let p = currentSurah.start_page; p <= currentSurah.end_page; p++) {
            pageArray.push(p);
          }
          setPages(pageArray);
       };
const newFallbackPagesLogic =        if (currentSurah) {
          setSurahName(currentSurah.name);
          if (savedMushaf !== 'hafs') {
            const pageArray = [];
            for (let p = currentSurah.start_page; p <= currentSurah.end_page; p++) {
              pageArray.push(p);
            }
            setPages(pageArray);
          }
       };
code = code.replace(fallbackPagesLogic, newFallbackPagesLogic);

// Replace visual render block
const visualBlock =       {isUnsupportedVisual ? (
         <div className="flex flex-col items-center justify-center py-20 px-4">
           <Icons.FaBookOpen size={64} className="text-zad-border/40 mb-6" />
           <h3 className="font-amiri text-2xl font-bold text-zad-border mb-4 text-center">?????? ?????? ?????? ??? ?????</h3>
           <p className="font-cairo text-center opacity-80 max-w-md leading-relaxed">
             ?????? ??????? ??????? ????? ???????? ??????? ?? ({mushafName}) ??? ?????? ?? ????? ?????? ????? ????? ??? ???????.
             <br/><br/>
             (????? ???????? ??????? ??????? ??????? ?? ???? ?????? ???????).
           </p>
         </div>
      ) : (
         <div className="w-full max-w-2xl mx-auto px-2">
            {pages.length > 0 && (
              <Swiper
                dir="rtl"
                className="w-full shadow-lg border-2 border-zad-border/30 bg-white rounded-md overflow-hidden"
                onSlideChange={(swiper) => setCurrentPageIndex(swiper.activeIndex)}
                initialSlide={currentPageIndex}
              >
                {pages.map((pageNum, idx) => (
                  <SwiperSlide key={pageNum}>
                    <div className="relative">
                      <img 
                        src={getPageImageUrl(pageNum)} 
                        alt={\Page \\} 
                        className="w-full h-auto object-contain select-none pb-8"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 right-0 left-0 text-center opacity-60 font-cairo text-xs text-black bg-white/80 w-fit mx-auto px-4 py-1 rounded-full shadow-sm">
                        ???? {pageNum}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
        </div>
      )};

const replacementVisual =       {isUnsupportedVisual ? (
         <div className="flex flex-col items-center justify-center py-20 px-4">
           <Icons.FaBookOpen size={64} className="text-zad-border/40 mb-6" />
           <h3 className="font-amiri text-2xl font-bold text-zad-border mb-4 text-center">?????? ?????? ?????? ??? ?????</h3>
           <p className="font-cairo text-center opacity-80 max-w-md leading-relaxed">
             ?????? ??????? ??????? ????? ???????? ??????? ?? ({mushafName}) ??? ?????? ?? ????? ?????? ????? ????? ??? ???????.
             <br/><br/>
             (????? ???????? ??????? ??????? ??????? ?? ???? ?????? ???????).
           </p>
         </div>
      ) : isTextMushaf ? (
         <div className="w-full max-w-4xl mx-auto px-2">
            {pages.length > 0 && (
              <Swiper
                dir="rtl"
                className="w-full bg-transparent overflow-hidden"
                onSlideChange={(swiper) => setCurrentPageIndex(swiper.activeIndex)}
                initialSlide={currentPageIndex}
              >
                {pages.map((pageNum, idx) => (
                  <SwiperSlide key={pageNum}>
                    <div className="w-full mx-auto px-2 md:px-8 py-10 md:py-16 bg-[#FAF2E3] shadow-2xl min-h-[75vh] border-[14px] border-double border-[#D4B595]/60 mb-6 relative overflow-hidden flex flex-col justify-between" style={{fontFamily: "'Amiri Quran', serif"}}>
                      
                      {/* Top Header Box */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center px-4 py-1 border border-[#D4B595]/50 text-sm md:text-[17px] font-bold text-zad-border bg-[#F5EAD4]/70 shadow-sm z-10" style={{fontFamily: "Cairo, sans-serif"}}>
                         <span>??????? {surahName}</span>
                         <span>????? {pagesTextData[pageNum]?.[0]?.juz?.toString().replace(/\\d/g, d => '??????????'[d]) || ''}</span>
                      </div>

                      <div className="mt-8 mb-10 w-full relative z-10 flex-grow flex flex-col">
                          
                          {/* Surah Ribbon (only if page contains ayah 1) */}
                          {pagesTextData[pageNum]?.some(v => v.numberInSurah === 1) && (
                            <>
                                <div className="mx-auto my-6 w-11/12 md:w-4/5 px-4 py-5 border-y-[6px] border-double border-[#D4B595]/80 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-[#F2E5CC] shadow-inner rounded-sm">
                                    <h2 className="text-3xl md:text-5xl font-normal text-[#8B6533] tracking-wider drop-shadow-sm">
                                        ??????? {surahName}
                                    </h2>
                                </div>
                                
                                {/* Bismillah */}
                                {surahId !== '1' && surahId !== '9' && (
                                <div className="text-center mb-8 pb-2">
                                    <h3 className="text-[26px] md:text-[38px] font-normal text-zad-text opacity-90">
                                    ?????? ??????? ???????????? ??????????
                                    </h3>
                                </div>
                                )}
                            </>
                          )}

                          {/* Words Layout */}
                          <div className="mushaf-layout text-[28px] md:text-4xl lg:text-[42px] font-normal text-zad-text px-1 md:px-6" dir="rtl" style={{ lineHeight: '2.5', textAlignLast: 'center' }}>
                            {pagesTextData[pageNum]?.map(verse => {
                                let text = verse.text;
                                if (verse.numberInSurah === 1 && text.startsWith('?????? ??????? ???????????? ?????????? ') && surahId !== '1') {
                                    text = text.replace('?????? ??????? ???????????? ?????????? ', '');
                                }
                                const arabicNum = verse.numberInSurah.toString().replace(/\\d/g, d => '??????????'[d]);

                                return (
                                <span key={verse.numberInSurah} className="inline leading-[2.6] hover:bg-black/5 transition-colors cursor-text rounded">
                                    {text}
                                    <span className="inline-flex items-center justify-center w-[38px] h-[38px] md:w-[46px] md:h-[46px] mx-[6px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/4e/Aya_symbol.svg')] bg-contain bg-no-repeat bg-center text-[13px] md:text-[16px] pt-1 font-normal text-[#8B6533]" style={{fontFamily: "Cairo, sans-serif"}}>
                                        {arabicNum}
                                    </span>
                                </span>
                                );
                            })}
                          </div>

                      </div>

                      {/* Bottom Page Number Box */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center text-sm md:text-base font-bold text-zad-border z-10" style={{fontFamily: "Cairo, sans-serif"}}>
                         <span className="px-6 py-1 border border-[#D4B595]/50 bg-[#F5EAD4]/70 flex items-center shadow-sm">
                            {pageNum.toString().replace(/\\d/g, d => '??????????'[d])}
                         </span>
                      </div>

                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
         </div>
      ) : (
         <div className="w-full max-w-2xl mx-auto px-2">
            {pages.length > 0 && (
              <Swiper
                dir="rtl"
                className="w-full shadow-lg border-2 border-zad-border/30 bg-white rounded-md overflow-hidden"
                onSlideChange={(swiper) => setCurrentPageIndex(swiper.activeIndex)}
                initialSlide={currentPageIndex}
              >
                {pages.map((pageNum, idx) => (
                  <SwiperSlide key={pageNum}>
                    <div className="relative">
                      <img 
                        src={getPageImageUrl(pageNum)} 
                        alt={\Page \\} 
                        className="w-full h-auto object-contain select-none pb-8"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 right-0 left-0 text-center opacity-60 font-cairo text-xs text-black bg-white/80 w-fit mx-auto px-4 py-1 rounded-full shadow-sm">
                        ???? {pageNum}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
        </div>
      )};

code = code.replace(visualBlock, replacementVisual);

if(code.includes("if (savedMushaf === 'hafs') {") && code.includes("isTextMushaf ? (")) {
    fs.writeFileSync('src/pages/SurahDetail.jsx', code, 'utf8');
    console.log("SUCCESS!");
} else {
    console.log("FAILED REPLACEMENT");
}
