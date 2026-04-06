const fs = require('fs');
let file = fs.readFileSync('src/pages/SurahDetail.jsx', 'utf8');

const headSnippet = '      {isUnsupportedVisual ? (';
const tailSnippet = '      {/* Audio Element Hidden */}';

let startIdx = file.indexOf(headSnippet);
let endIdx = file.indexOf(tailSnippet);

if (startIdx !== -1 && endIdx !== -1) {
  const newUI = \      {isUnsupportedVisual ? (
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
         <>
           <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-[#FDFBF7] rounded-xl shadow-md min-h-[50vh] border border-[#D4B595]/30">
             {surahId !== '1' && surahId !== '9' && (
               <div className="text-center mb-8">
                 <h3 className="font-amiri text-2xl font-bold text-zad-text opacity-90">?????? ??????? ???????????? ??????????</h3>
               </div>
             )}
             <div className="text-center text-2xl md:text-3xl lg:text-4xl font-amiri font-bold text-zad-text inline-block break-words" dir="rtl" style={{ lineHeight: '2.5' }}>
               {surahVerses.map(verse => {
                 let text = verse.text;
                 if (verse.numberInSurah === 1 && text.startsWith('?????? ??????? ???????????? ?????????? ') && surahId !== '1') {
                   text = text.replace('?????? ??????? ???????????? ?????????? ', '');
                 }
                 return (
                 <span key={verse.numberInSurah} className="inline ml-1 leading-loose">
                   {text}
                   <span className="inline-flex items-center justify-center w-[30px] h-[30px] md:w-[40px] md:h-[40px] mx-2 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/4e/Aya_symbol.svg')] bg-contain bg-no-repeat bg-center text-xs md:text-sm font-cairo pt-1 font-normal text-zad-border whitespace-nowrap">
                      {verse.numberInSurah}
                   </span>
                 </span>
                 );
               })}
             </div>
           </div>

           <div className="flex justify-between items-center max-w-2xl mx-auto mt-6 mb-4 px-4 font-cairo" dir="rtl">
             {parseInt(surahId) > 1 ? (
                <button
                  onClick={() => { navigate(\\\/quran/\\\\\\); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors shadow-sm bg-zad-border text-white hover:bg-[#C5A028] text-sm"  
                >
                  <Icons.FaArrowRight size={12} />
                  <span>?????? ???????</span>
                </button>
              ) : <div className="w-32"></div>}
              
             {parseInt(surahId) < 114 ? (
                <button
                  onClick={() => { navigate(\\\/quran/\\\\\\); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors shadow-sm bg-zad-border text-white hover:bg-[#C5A028] text-sm"  
                >
                  <span>?????? ???????</span>
                  <Icons.FaArrowLeft size={12} />
                </button>
              ) : <div className="w-32"></div>}
           </div>
         </>
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
      )}

      {/* Navigation Between Pages for Image Mushaf */}
      {pages.length > 0 && !isUnsupportedVisual && !isTextMushaf && (
          <div className="flex justify-between items-center max-w-2xl mx-auto mt-6 mb-4 px-4 font-cairo" dir="rtl">

            {/* Prev Page / Prev Surah */}
            {currentPageIndex > 0 ? (
              <button
                onClick={() => {
                  setCurrentPageIndex(prev => prev - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors shadow-sm bg-zad-border text-white hover:bg-[#C5A028]"
              >
                <Icons.FaArrowRight size={14} />
                <span>?????? ???????</span>
              </button>
            ) : (
              parseInt(surahId) > 1 ? (
                <button
                  onClick={() => navigate(\\\/quran/\\\\\\)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors shadow-sm bg-zad-border/80 text-white hover:bg-zad-border text-sm"  
                >
                  <Icons.FaArrowRight size={12} />
                  <span>?????? ???????</span>
                </button>
              ) : <div className="w-32"></div>
            )}

            {/* Page Indicator */}
            <div className="text-sm font-bold text-zad-text bg-zad-bg border border-zad-border/30 px-3 py-1 rounded-full shadow-inner text-center min-w-[70px]">
              {currentPageIndex + 1} / {pages.length}
            </div>

            {/* Next Page / Next Surah */}
            {currentPageIndex < pages.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentPageIndex(prev => prev + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors shadow-sm bg-zad-border text-white hover:bg-[#C5A028]"
              >
                <span>?????? ???????</span>
                <Icons.FaArrowLeft size={14} />
              </button>
            ) : (
              parseInt(surahId) < 114 ? (
                <button
                  onClick={() => navigate(\\\/quran/\\\\\\)}   
                  className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors shadow-sm bg-zad-border/80 text-white hover:bg-zad-border text-sm"  
                >
                  <span>?????? ???????</span>
                  <Icons.FaArrowLeft size={12} />
                </button>
              ) : <div className="w-32"></div>
            )}

          </div>
      )}

\n\;
  let replaced = file.substring(0, startIdx) + newUI + file.substring(endIdx);
  fs.writeFileSync('src/pages/SurahDetail.jsx', replaced, 'utf8');
  console.log('Success Slice!');
} else {
  console.log('Not found idx!', startIdx, endIdx);
}
