const fs = require('fs');
let file = fs.readFileSync('src/pages/SurahDetail.jsx', 'utf8');

const oldSnip = \      ) : isTextMushaf ? (
         <>
           <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-[#FDFBF7] rounded-xl shadow-md min-h-[50vh] border border-[#D4B595]/30 mb-8">
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
                 <span key={verse.numberInSurah} className="inline leading-loose">
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
             {parseInt(surahId) < 114 ? (
                <button
                  onClick={() => { navigate(\\\/quran/\\\\\\); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-6 py-2 rounded-md transition-colors shadow-sm bg-zad-border text-white hover:bg-[#C5A028] text-sm md:text-base"  
                >
                  <Icons.FaArrowRight size={12} />
                  <span>?????? ???????</span>
                </button>
              ) : <div className="w-32"></div>}
              
             {parseInt(surahId) > 1 ? (
                <button
                  onClick={() => { navigate(\\\/quran/\\\\\\); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-6 py-2 rounded-md transition-colors shadow-sm bg-zad-border text-white hover:bg-[#C5A028] text-sm md:text-base"  
                >
                  <span>?????? ???????</span>
                  <Icons.FaArrowLeft size={12} />
                </button>
              ) : <div className="w-32"></div>}
           </div>
         </>
      ) : (\;

const newSnip = \      ) : isTextMushaf ? (
         <>
           <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16 bg-[#FAF2E3] rounded-sm shadow-2xl min-h-[70vh] border-[12px] border-double border-[#D4B595]/50 mb-12 font-amiri relative overflow-hidden">
             
             {/* Header Frame - Page layout look */}
             <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-4 py-1 border border-[#D4B595]/40 text-sm md:text-base font-bold text-zad-border bg-[#F5EAD4]/50">
                <span>??????? {surahName}</span>
                <span>{surahVerses[0] ? \\\???????? \\\\\\ : ''}</span>
             </div>

             {surahVerses.length > 0 && (
               <div className="mt-8 relative z-10 w-full">
                 
                 {/* Surah Title Decorative Box */}
                 <div className="mx-auto my-8 mt-12 w-11/12 md:w-3/4 px-4 py-4 md:py-6 border-y-[6px] border-double border-[#D4B595]/70 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-[#F2E5CC]">
                     <h2 className="text-3xl md:text-5xl font-amiri font-bold text-[#8B6533] drop-shadow-sm tracking-wide">
                         ??????? {surahName}
                     </h2>
                 </div>

                 {/* Bismillah */}
                 {surahId !== '1' && surahId !== '9' && (
                   <div className="text-center mb-10 pb-4">
                     <h3 className="text-2xl md:text-4xl font-amiri font-bold text-zad-text opacity-90 drop-shadow-sm">?????? ??????? ???????????? ??????????</h3>
                   </div>
                 )}

                 {/* Ayahs Container - Justified text for authentic look */}
                 <div className="text-justify text-[28px] md:text-4xl lg:text-[42px] font-amiri font-bold text-zad-text px-2 md:px-8" dir="rtl" style={{ lineHeight: '2.5', textAlignLast: 'center' }}>
                   {surahVerses.map(verse => {
                     let text = verse.text;
                     // Remove extra Bismillah from first ayah if present
                     if (verse.numberInSurah === 1 && text.startsWith('?????? ??????? ???????????? ?????????? ') && surahId !== '1') {
                       text = text.replace('?????? ??????? ???????????? ?????????? ', '');
                     }
                     // Arabic numerals for ayah marker
                     const arabicNum = verse.numberInSurah.toString().replace(/\\\\d/g, d => '??????????'[d]);

                     return (
                     <span key={verse.numberInSurah} className="inline leading-[2.5]">
                       {text}
                       <span className="inline-flex items-center justify-center w-[40px] h-[40px] md:w-[50px] md:h-[50px] mx-2 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/4e/Aya_symbol.svg')] bg-contain bg-no-repeat bg-center text-[13px] md:text-lg font-cairo pt-1 font-normal text-[#8B6533] whitespace-nowrap drop-shadow-sm">
                          {arabicNum}
                       </span>
                     </span>
                     );
                   })}
                 </div>

                 {/* Bottom Frame / Page Number Indicator */}
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center text-sm md:text-base font-bold text-zad-border">
                    <span className="px-6 py-1 border border-[#D4B595]/50 bg-[#F5EAD4]/50 flex items-center gap-2">
                       {surahVerses[0]?.page.toString().replace(/\\\\d/g, d => '??????????'[d])}
                    </span>
                 </div>
               </div>
             )}
           </div>

           {/* Navigation Controls */}
           <div className="flex justify-between items-center max-w-2xl mx-auto mt-6 mb-8 px-4 font-cairo" dir="rtl">
             {parseInt(surahId) < 114 ? (
                <button
                  onClick={() => { navigate(\\\/quran/\\\\\\); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-md transition-all shadow-md bg-zad-border text-white hover:bg-[#C5A028] hover:shadow-lg text-sm md:text-base font-bold"  
                >
                  <Icons.FaArrowRight size={14} />
                  <span>?????? ???????</span>
                </button>
              ) : <div className="w-40"></div>}
              
             {parseInt(surahId) > 1 ? (
                <button
                  onClick={() => { navigate(\\\/quran/\\\\\\); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-md transition-all shadow-md bg-zad-border text-white hover:bg-[#C5A028] hover:shadow-lg text-sm md:text-base font-bold"  
                >
                  <span>?????? ???????</span>
                  <Icons.FaArrowLeft size={14} />
                </button>
              ) : <div className="w-40"></div>}
           </div>
         </>
      ) : (\;

let fileNoCR = file.replace(/\\r/g, '');
let oldNoCR = oldSnip.replace(/\\r/g, '');

let idx = fileNoCR.indexOf(oldNoCR.substring(0, 100)); // find start
if (idx !== -1) {
  let replaced = fileNoCR.replace(oldNoCR, newSnip);
  if (replaced !== fileNoCR) {
      fs.writeFileSync('src/pages/SurahDetail.jsx', replaced, 'utf8');
      console.log('Success Mushaf UI!');
  } else {
      console.log('Replace did not change file');
  }
} else {
  console.log('Could not find chunk!', oldNoCR.substring(0, 100));
}
