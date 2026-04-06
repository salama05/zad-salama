import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaList, FaExpand, FaCompress, FaArrowRight, FaArrowLeft, FaMoon, FaSun, FaWifi, FaCheck, FaBookOpen } from 'react-icons/fa';
import { useMushafBookmark } from '../hooks/useMushafBookmark';
import { useMushafWird } from '../hooks/useMushafWird';

// بيانات القرآن المحلية - سيتم تحميلها من الملف
let cachedQuranData = null;

// دالة لتحميل بيانات القرآن
const loadQuranData = async () => {
  if (cachedQuranData) return cachedQuranData;
  
  try {
    const response = await fetch('/quran-hafs.json');
    const data = await response.json();
    cachedQuranData = data;
    return data;
  } catch (error) {
    console.error('خطأ في تحميل بيانات القرآن:', error);
    return null;
  }
};

// دالة للحصول على آيات صفحة معينة
const getPageVerses = (quranData, pageNumber) => {
  if (!quranData?.data?.surahs) return [];
  
  const verses = [];
  let currentSurahNumber = null;
  
  for (const surah of quranData.data.surahs) {
    for (const ayah of surah.ayahs) {
      if (ayah.page === pageNumber) {
        // إذا بدأت سورة جديدة
        if (surah.number !== currentSurahNumber) {
          verses.push({
            type: 'surah-header',
            surahNumber: surah.number,
            surahName: surah.name,
            revelationType: surah.revelationType
          });
          currentSurahNumber = surah.number;
        }
        
        verses.push({
          type: 'ayah',
          text: ayah.text,
          numberInSurah: ayah.numberInSurah,
          surahNumber: surah.number,
          juz: ayah.juz
        });
      }
    }
  }
  
  return verses;
};

// بيانات السور مع أرقام الصفحات
const SURAH_PAGES = [
  { number: 1, name: 'الفاتحة', page: 1 },
  { number: 2, name: 'البقرة', page: 2 },
  { number: 3, name: 'آل عمران', page: 50 },
  { number: 4, name: 'النساء', page: 77 },
  { number: 5, name: 'المائدة', page: 106 },
  { number: 6, name: 'الأنعام', page: 128 },
  { number: 7, name: 'الأعراف', page: 151 },
  { number: 8, name: 'الأنفال', page: 177 },
  { number: 9, name: 'التوبة', page: 187 },
  { number: 10, name: 'يونس', page: 208 },
  { number: 11, name: 'هود', page: 221 },
  { number: 12, name: 'يوسف', page: 235 },
  { number: 13, name: 'الرعد', page: 249 },
  { number: 14, name: 'إبراهيم', page: 255 },
  { number: 15, name: 'الحجر', page: 262 },
  { number: 16, name: 'النحل', page: 267 },
  { number: 17, name: 'الإسراء', page: 282 },
  { number: 18, name: 'الكهف', page: 293 },
  { number: 19, name: 'مريم', page: 305 },
  { number: 20, name: 'طه', page: 312 },
  { number: 21, name: 'الأنبياء', page: 322 },
  { number: 22, name: 'الحج', page: 332 },
  { number: 23, name: 'المؤمنون', page: 342 },
  { number: 24, name: 'النور', page: 350 },
  { number: 25, name: 'الفرقان', page: 359 },
  { number: 26, name: 'الشعراء', page: 367 },
  { number: 27, name: 'النمل', page: 377 },
  { number: 28, name: 'القصص', page: 385 },
  { number: 29, name: 'العنكبوت', page: 396 },
  { number: 30, name: 'الروم', page: 404 },
  { number: 31, name: 'لقمان', page: 411 },
  { number: 32, name: 'السجدة', page: 415 },
  { number: 33, name: 'الأحزاب', page: 418 },
  { number: 34, name: 'سبأ', page: 428 },
  { number: 35, name: 'فاطر', page: 434 },
  { number: 36, name: 'يس', page: 440 },
  { number: 37, name: 'الصافات', page: 446 },
  { number: 38, name: 'ص', page: 453 },
  { number: 39, name: 'الزمر', page: 458 },
  { number: 40, name: 'غافر', page: 467 },
  { number: 41, name: 'فصلت', page: 477 },
  { number: 42, name: 'الشورى', page: 483 },
  { number: 43, name: 'الزخرف', page: 489 },
  { number: 44, name: 'الدخان', page: 496 },
  { number: 45, name: 'الجاثية', page: 499 },
  { number: 46, name: 'الأحقاف', page: 502 },
  { number: 47, name: 'محمد', page: 507 },
  { number: 48, name: 'الفتح', page: 511 },
  { number: 49, name: 'الحجرات', page: 515 },
  { number: 50, name: 'ق', page: 518 },
  { number: 51, name: 'الذاريات', page: 520 },
  { number: 52, name: 'الطور', page: 523 },
  { number: 53, name: 'النجم', page: 526 },
  { number: 54, name: 'القمر', page: 528 },
  { number: 55, name: 'الرحمن', page: 531 },
  { number: 56, name: 'الواقعة', page: 534 },
  { number: 57, name: 'الحديد', page: 537 },
  { number: 58, name: 'المجادلة', page: 542 },
  { number: 59, name: 'الحشر', page: 545 },
  { number: 60, name: 'الممتحنة', page: 549 },
  { number: 61, name: 'الصف', page: 551 },
  { number: 62, name: 'الجمعة', page: 553 },
  { number: 63, name: 'المنافقون', page: 554 },
  { number: 64, name: 'التغابن', page: 556 },
  { number: 65, name: 'الطلاق', page: 558 },
  { number: 66, name: 'التحريم', page: 560 },
  { number: 67, name: 'الملك', page: 562 },
  { number: 68, name: 'القلم', page: 564 },
  { number: 69, name: 'الحاقة', page: 566 },
  { number: 70, name: 'المعارج', page: 568 },
  { number: 71, name: 'نوح', page: 570 },
  { number: 72, name: 'الجن', page: 572 },
  { number: 73, name: 'المزمل', page: 574 },
  { number: 74, name: 'المدثر', page: 575 },
  { number: 75, name: 'القيامة', page: 577 },
  { number: 76, name: 'الإنسان', page: 578 },
  { number: 77, name: 'المرسلات', page: 580 },
  { number: 78, name: 'النبأ', page: 582 },
  { number: 79, name: 'النازعات', page: 583 },
  { number: 80, name: 'عبس', page: 585 },
  { number: 81, name: 'التكوير', page: 586 },
  { number: 82, name: 'الانفطار', page: 587 },
  { number: 83, name: 'المطففين', page: 587 },
  { number: 84, name: 'الانشقاق', page: 589 },
  { number: 85, name: 'البروج', page: 590 },
  { number: 86, name: 'الطارق', page: 591 },
  { number: 87, name: 'الأعلى', page: 591 },
  { number: 88, name: 'الغاشية', page: 592 },
  { number: 89, name: 'الفجر', page: 593 },
  { number: 90, name: 'البلد', page: 594 },
  { number: 91, name: 'الشمس', page: 595 },
  { number: 92, name: 'الليل', page: 595 },
  { number: 93, name: 'الضحى', page: 596 },
  { number: 94, name: 'الشرح', page: 596 },
  { number: 95, name: 'التين', page: 597 },
  { number: 96, name: 'العلق', page: 597 },
  { number: 97, name: 'القدر', page: 598 },
  { number: 98, name: 'البينة', page: 598 },
  { number: 99, name: 'الزلزلة', page: 599 },
  { number: 100, name: 'العاديات', page: 599 },
  { number: 101, name: 'القارعة', page: 600 },
  { number: 102, name: 'التكاثر', page: 600 },
  { number: 103, name: 'العصر', page: 601 },
  { number: 104, name: 'الهمزة', page: 601 },
  { number: 105, name: 'الفيل', page: 601 },
  { number: 106, name: 'قريش', page: 602 },
  { number: 107, name: 'الماعون', page: 602 },
  { number: 108, name: 'الكوثر', page: 602 },
  { number: 109, name: 'الكافرون', page: 603 },
  { number: 110, name: 'النصر', page: 603 },
  { number: 111, name: 'المسد', page: 603 },
  { number: 112, name: 'الإخلاص', page: 604 },
  { number: 113, name: 'الفلق', page: 604 },
  { number: 114, name: 'الناس', page: 604 },
];

// بيانات الأجزاء
const JUZ_PAGES = [
  { number: 1, page: 1 },
  { number: 2, page: 22 },
  { number: 3, page: 42 },
  { number: 4, page: 62 },
  { number: 5, page: 82 },
  { number: 6, page: 102 },
  { number: 7, page: 121 },
  { number: 8, page: 142 },
  { number: 9, page: 162 },
  { number: 10, page: 182 },
  { number: 11, page: 201 },
  { number: 12, page: 222 },
  { number: 13, page: 242 },
  { number: 14, page: 262 },
  { number: 15, page: 282 },
  { number: 16, page: 302 },
  { number: 17, page: 322 },
  { number: 18, page: 342 },
  { number: 19, page: 362 },
  { number: 20, page: 382 },
  { number: 21, page: 402 },
  { number: 22, page: 422 },
  { number: 23, page: 442 },
  { number: 24, page: 462 },
  { number: 25, page: 482 },
  { number: 26, page: 502 },
  { number: 27, page: 522 },
  { number: 28, page: 542 },
  { number: 29, page: 562 },
  { number: 30, page: 582 },
];

function MushafReader() {
  const navigate = useNavigate();
  const { currentPage, isLoading: bookmarkLoading, nextPage, prevPage, goToPage } = useMushafBookmark();
  const { trackPageRead, wirdSettings, wirdProgress } = useMushafWird();

  // حالات البيانات
  const [quranData, setQuranData] = useState(null);
  const [pageVerses, setPageVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // حالات واجهة المستخدم
  const [showControls, setShowControls] = useState(true);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [showSurahList, setShowSurahList] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mushaf-dark-mode') === 'true';
  });
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('mushaf-font-size') || '28');
  });
  
  // مرجع للحاوية للسحب
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // تحميل بيانات القرآن
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await loadQuranData();
      setQuranData(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // تحديث آيات الصفحة عند تغيير الصفحة
  useEffect(() => {
    if (quranData) {
      const verses = getPageVerses(quranData, currentPage);
      setPageVerses(verses);
      
      // تسجيل قراءة الصفحة للورد اليومي
      if (wirdSettings.enabled) {
        trackPageRead(currentPage);
      }
    }
  }, [quranData, currentPage, wirdSettings.enabled, trackPageRead]);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // حفظ إعدادات الوضع الليلي وحجم الخط
  useEffect(() => {
    localStorage.setItem('mushaf-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('mushaf-font-size', fontSize.toString());
  }, [fontSize]);

  // إخفاء/إظهار أدوات التحكم
  const toggleControls = () => setShowControls(!showControls);

  // التعامل مع السحب (Swipe)
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // الحد الأدنى للسحب

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // سحب لليسار = الصفحة التالية (في العربية، القراءة من اليمين لليسار)
        prevPage();
      } else {
        // سحب لليمين = الصفحة السابقة
        nextPage();
      }
    }
  };

  // التعامل مع لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showJumpModal || showSurahList) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevPage();
          break;
        case 'ArrowRight':
          nextPage();
          break;
        case 'Home':
          goToPage(1);
          break;
        case 'End':
          goToPage(604);
          break;
        case 'Escape':
          if (isFullscreen) toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, showJumpModal, showSurahList, isFullscreen]);

  // تبديل ملء الشاشة
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // الانتقال لصفحة معينة
  const handleJumpToPage = () => {
    const page = parseInt(jumpPageInput, 10);
    if (page >= 1 && page <= 604) {
      goToPage(page);
      setShowJumpModal(false);
      setJumpPageInput('');
    }
  };

  // الحصول على اسم السورة الحالية
  const getCurrentSurah = () => {
    for (let i = SURAH_PAGES.length - 1; i >= 0; i--) {
      if (currentPage >= SURAH_PAGES[i].page) {
        return SURAH_PAGES[i];
      }
    }
    return SURAH_PAGES[0];
  };

  // الحصول على رقم الجزء الحالي
  const getCurrentJuz = () => {
    for (let i = JUZ_PAGES.length - 1; i >= 0; i--) {
      if (currentPage >= JUZ_PAGES[i].page) {
        return JUZ_PAGES[i].number;
      }
    }
    return 1;
  };

  if (isLoading || bookmarkLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#FBF8F1]'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4 ${isDarkMode ? 'border-[#D4AF37]' : 'border-[#D4AF37]'}`}></div>
          <p className={`font-cairo ${isDarkMode ? 'text-[#E5D9C7]' : 'text-[#8B7355]'}`}>جارِ تحميل المصحف...</p>
          <p className={`font-cairo text-sm mt-2 ${isDarkMode ? 'text-[#A0917B]' : 'text-[#A0917B]'}`}>
            {isOffline ? '📴 يعمل بدون إنترنت' : '🌐 متصل'}
          </p>
        </div>
      </div>
    );
  }

  const currentSurah = getCurrentSurah();
  const currentJuz = getCurrentJuz();

  // ألوان الوضع الليلي والعادي
  const bgColor = isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#FBF8F1]';
  const textColor = isDarkMode ? 'text-[#E5D9C7]' : 'text-[#8B7355]';
  const ayahTextColor = isDarkMode ? 'text-[#F5EFE0]' : 'text-[#2D2A26]';
  const headerBg = isDarkMode ? 'from-[#1a1a1a]' : 'from-[#FBF8F1]';
  const footerBg = isDarkMode ? 'from-[#1a1a1a]' : 'from-[#FBF8F1]';
  const cardBg = isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white';

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen flex flex-col select-none ${bgColor}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={toggleControls}
    >
      {/* مؤشر العمل بدون إنترنت */}
      {isOffline && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-4 py-2 rounded-full text-sm font-cairo flex items-center gap-2 shadow-lg">
          <FaWifi className="opacity-50" />
          يعمل بدون إنترنت
        </div>
      )}

      {/* شريط علوي */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-b ${headerBg} to-transparent transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4">
          {/* زر العودة */}
          <button
            onClick={() => navigate('/home')}
            className={`p-3 ${cardBg}/80 rounded-full shadow-md ${textColor} hover:${cardBg} transition`}
          >
            <FaHome size={20} />
          </button>

          {/* معلومات الصفحة */}
          <div className="text-center">
            <h1 className={`font-amiri text-xl ${textColor}`}>سورة {currentSurah.name}</h1>
            <div className={`flex flex-col items-center justify-center font-cairo text-xs ${isDarkMode ? 'text-[#A0917B]' : 'text-[#A0917B]'}`}>
              <span>الصفحة {currentPage} • الجزء {currentJuz}</span>
              {wirdSettings?.enabled && (
                <div className="flex items-center gap-1 mt-1 text-[#D4AF37] font-bold">
                  <FaBookOpen size={10} />
                  <span>الورد: {wirdProgress.pagesRead.length}/{wirdSettings.targetPages}</span>
                  {wirdProgress.pagesRead.length >= wirdSettings.targetPages && (
                    <FaCheck size={10} className="text-green-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {/* زر الوضع الليلي */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 ${cardBg}/80 rounded-full shadow-md ${textColor} hover:${cardBg} transition`}
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            <button
              onClick={() => setShowSurahList(true)}
              className={`p-3 ${cardBg}/80 rounded-full shadow-md ${textColor} hover:${cardBg} transition`}
            >
              <FaList size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className={`p-3 ${cardBg}/80 rounded-full shadow-md ${textColor} hover:${cardBg} transition`}
            >
              {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* منطقة عرض الصفحة - النصوص القرآنية */}
      <main className="flex-1 pt-20 pb-24 px-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* رقم الصفحة في الأعلى */}
          <div className={`text-center mb-6 ${textColor}`}>
            <span className="font-cairo text-sm">۝ الصفحة {currentPage} ۝</span>
          </div>

          {/* محتوى الصفحة */}
          <div className={`${cardBg} rounded-2xl shadow-lg p-6 md:p-8 border ${isDarkMode ? 'border-[#3a3a3a]' : 'border-[#D4AF37]/20'}`}>
            {pageVerses.length === 0 ? (
              <div className={`text-center py-12 ${textColor}`}>
                <p className="font-cairo">لا توجد آيات في هذه الصفحة</p>
              </div>
            ) : (
              <div className="text-center leading-loose" style={{ fontSize: `${fontSize}px`, lineHeight: '2.2' }}>
                {pageVerses.map((item, index) => {
                  if (item.type === 'surah-header') {
                    return (
                      <div key={`header-${item.surahNumber}`} className="my-8 first:mt-0">
                        {/* البسملة - لجميع السور ما عدا التوبة */}
                        {item.surahNumber !== 9 && item.surahNumber !== 1 && (
                          <p className={`font-amiri text-2xl mb-4 ${ayahTextColor}`}>
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </p>
                        )}
                        {/* اسم السورة */}
                        <div className={`inline-block px-8 py-3 rounded-full ${isDarkMode ? 'bg-[#D4AF37]/20' : 'bg-[#D4AF37]/10'} mb-4`}>
                          <span className={`font-amiri text-xl ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#8B7355]'}`}>
                            {item.surahName}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  // الآيات
                  return (
                    <span key={`ayah-${item.surahNumber}-${item.numberInSurah}`} className={`font-amiri ${ayahTextColor}`}>
                      {item.text}
                      <span className={`mx-1 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#D4AF37]'}`}>
                        ﴿{item.numberInSurah.toLocaleString('ar-EG')}﴾
                      </span>
                      {' '}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* التحكم في حجم الخط */}
          <div className={`flex items-center justify-center gap-4 mt-6 ${textColor}`}>
            <button
              onClick={() => setFontSize(Math.max(18, fontSize - 2))}
              className={`w-10 h-10 rounded-full ${cardBg} shadow-md flex items-center justify-center text-xl font-bold`}
            >
              -
            </button>
            <span className="font-cairo text-sm">حجم الخط: {fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(48, fontSize + 2))}
              className={`w-10 h-10 rounded-full ${cardBg} shadow-md flex items-center justify-center text-xl font-bold`}
            >
              +
            </button>
          </div>
        </div>
      </main>

      {/* شريط سفلي للتنقل */}
      <footer 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t ${footerBg} to-transparent transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          {/* الصفحة التالية (يمين لأن العربية من اليمين لليسار) */}
          <button
            onClick={nextPage}
            disabled={currentPage >= 604}
            className="p-4 bg-[#D4AF37] text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#C5A028] transition active:scale-95"
          >
            <FaArrowRight size={24} />
          </button>

          {/* الانتقال لصفحة */}
          <button
            onClick={() => setShowJumpModal(true)}
            className={`px-6 py-3 ${cardBg} rounded-full shadow-md ${textColor} font-cairo font-bold hover:opacity-90 transition`}
          >
            صفحة {currentPage} / 604
          </button>

          {/* الصفحة السابقة */}
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-4 bg-[#D4AF37] text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#C5A028] transition active:scale-95"
          >
            <FaArrowLeft size={24} />
          </button>
        </div>
      </footer>

      {/* مودال الانتقال لصفحة */}
      {showJumpModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowJumpModal(false)}
        >
          <div 
            className={`${cardBg} rounded-2xl p-6 w-full max-w-sm shadow-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`font-amiri text-2xl ${textColor} text-center mb-6`}>الانتقال إلى صفحة</h2>
            
            <input
              type="number"
              min="1"
              max="604"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder="أدخل رقم الصفحة (1-604)"
              className={`w-full px-4 py-3 border-2 border-[#D4AF37]/30 rounded-lg text-center font-cairo text-lg focus:border-[#D4AF37] outline-none mb-4 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'}`}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowJumpModal(false)}
                className={`flex-1 py-3 rounded-lg border-2 border-[#D4AF37]/30 ${textColor} font-cairo font-bold hover:opacity-80 transition`}
              >
                إلغاء
              </button>
              <button
                onClick={handleJumpToPage}
                className="flex-1 py-3 rounded-lg bg-[#D4AF37] text-white font-cairo font-bold hover:bg-[#C5A028] transition"
              >
                انتقال
              </button>
            </div>

            {/* اختصارات سريعة */}
            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-[#3a3a3a]' : 'border-[#D4AF37]/20'}`}>
              <p className={`font-cairo text-sm ${isDarkMode ? 'text-[#A0917B]' : 'text-[#A0917B]'} mb-3 text-center`}>اختصارات سريعة:</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 302, 604].map((page) => (
                  <button
                    key={page}
                    onClick={() => { goToPage(page); setShowJumpModal(false); }}
                    className={`py-2 rounded-lg ${isDarkMode ? 'bg-[#1a1a1a] text-[#E5D9C7]' : 'bg-[#FBF8F1] text-[#8B7355]'} font-cairo text-sm hover:opacity-80 transition`}
                  >
                    {page === 1 ? 'البداية' : page === 302 ? 'النصف' : 'النهاية'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال قائمة السور */}
      {showSurahList && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowSurahList(false)}
        >
          <div 
            className={`${cardBg} rounded-2xl w-full max-w-md max-h-[80vh] shadow-xl overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 border-b ${isDarkMode ? 'border-[#3a3a3a] bg-[#2a2a2a]' : 'border-[#D4AF37]/20 bg-[#FBF8F1]'}`}>
              <h2 className={`font-amiri text-2xl ${textColor} text-center`}>فهرس السور</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              {SURAH_PAGES.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => { goToPage(surah.page); setShowSurahList(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg mb-1 transition ${
                    currentSurah.number === surah.number 
                      ? 'bg-[#D4AF37] text-white' 
                      : isDarkMode ? 'hover:bg-[#3a3a3a] text-[#E5D9C7]' : 'hover:bg-[#FBF8F1] text-[#8B7355]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentSurah.number === surah.number 
                        ? 'bg-white/20' 
                        : 'bg-[#D4AF37]/10'
                    }`}>
                      {surah.number}
                    </span>
                    <span className="font-amiri text-lg">{surah.name}</span>
                  </div>
                  <span className="font-cairo text-sm opacity-70">ص {surah.page}</span>
                </button>
              ))}
            </div>

            <div className={`p-4 border-t ${isDarkMode ? 'border-[#3a3a3a] bg-[#2a2a2a]' : 'border-[#D4AF37]/20 bg-[#FBF8F1]'}`}>
              <button
                onClick={() => setShowSurahList(false)}
                className={`w-full py-3 rounded-lg border-2 border-[#D4AF37]/30 ${textColor} font-cairo font-bold hover:opacity-80 transition`}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MushafReader;
