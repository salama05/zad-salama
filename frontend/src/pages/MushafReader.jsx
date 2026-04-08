import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaListUl, FaExpand, FaCompress, FaArrowRight, FaArrowLeft, FaMoon, FaSun, FaWifi, FaCheck, FaBookOpen, FaAngleDoubleDown } from 'react-icons/fa';
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
          // فقط إذا كانت أول آية في السورة لتجنب ظهور الفاصل في كل صفحة
          if (ayah.numberInSurah === 1) {
            verses.push({
              type: 'surah-header',
              surahNumber: surah.number,
              surahName: surah.name,
              revelationType: surah.revelationType
            });
          }
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
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mushaf-dark-mode') === 'true';
  });
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('mushaf-font-size') || '12');
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

      // العودة لأعلى الصفحة عند التبديل
      const scrollContainer = document.getElementById('quran-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
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

  // منطق التمرير التلقائي الاحترافي (Auto Scrolling with RAF)
  useEffect(() => {
    let animationFrameId;
    let lastTime;
    let accumulator = 0;

    const scrollLoop = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // حساب عدد البيكسلات في الثانية استناداً لطلبك الحرفي:
      // 1 (سريع): 40 بكسل بالثانية (سطر في ثانية)
      // 2 (متوسط): 20 بكسل بالثانية (سطر كل ثانيتين)
      // 3 (بطيء): 10 بكسل بالثانية (سطر كل 3 أو 4 ثواني)
      const pixelsPerSecond = autoScrollSpeed === 1 ? 40 : autoScrollSpeed === 2 ? 20 : 10;

      accumulator += (pixelsPerSecond * deltaTime) / 1000;

      if (accumulator >= 1) {
        const scrollContainer = document.getElementById('quran-scroll-container');
        if (scrollContainer) {
          const pixelsToScroll = Math.floor(accumulator);
          // نزول تدريجي بدون تدخل CSS
          scrollContainer.scrollTop += pixelsToScroll;
          accumulator -= pixelsToScroll;

          // الانتقال التلقائي للصفحة الموالية عند الوصول للأسفل
          if (Math.ceil(scrollContainer.scrollTop + scrollContainer.clientHeight) >= scrollContainer.scrollHeight) {
            nextPage();
          }
        }
      }
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    if (isAutoScrolling) {
      animationFrameId = requestAnimationFrame(scrollLoop);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoScrolling, autoScrollSpeed, nextPage]);

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
        // سحب لليسار
        prevPage();
      } else {
        // سحب لليمين
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

  const currentSurah = getCurrentSurah();
  const currentJuz = getCurrentJuz();

  // دالة لحساب رقم الحزب
  const getCurrentHizb = (page) => {
    if (page <= 1) return 1;
    return Math.ceil((page - 1) / 10);
  };
  const currentHizb = getCurrentHizb(currentPage);

  // مصفوفة لأسماء الأجزاء بالعربي
  const juzNames = [
    "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر",
    "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون",
    "واحد والعشرون", "الثاني والعشرون", "الثالث والعشرون", "الرابع والعشرون", "الخامس والعشرون", "السادس والعشرون", "السابع والعشرون", "الثامن والعشرون", "التاسع والعشرون", "الثلاثون"
  ];

  // ألوان الوضع الليلي والعادي
  const bgColor = isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#FBF8F1]';
  const textColor = isDarkMode ? 'text-[#E5D9C7]' : 'text-[#8B7355]';
  const ayahTextColor = isDarkMode ? 'text-[#F5EFE0]' : 'text-[#2D2A26]';
  const cardBg = isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white';
  const footerBg = isDarkMode ? 'from-[#1a1a1a]' : 'from-[#FBF8F1]';

  if (isLoading || bookmarkLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#FBF8F1]'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4 ${isDarkMode ? 'border-[#D4AF37]' : 'border-[#D4AF37]'}`}></div>
          <p className={`font-cairo ${isDarkMode ? 'text-[#E5D9C7]' : 'text-[#8B7355]'}`}>جارِ تحميل المصحف...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-screen w-screen flex flex-col select-none overflow-hidden ${bgColor}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={toggleControls}
    >
      {/* مؤشر العمل بدون إنترنت */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-4 py-2 rounded-full text-xs font-cairo flex items-center gap-2 shadow-lg">
          <FaWifi className="opacity-50" />
          يعمل بدون إنترنت
        </div>
      )}

      {/* شريط علوي زخرفي فاخر (محاكاة للصورة) */}
      <header
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto relative flex items-center justify-between px-12 py-1">
          {/* البرواز الزخرفي (Parchment Bar) */}
          <div className={`absolute inset-0 border border-[#D4AF37]/40 ${isDarkMode ? 'bg-[#2a2a2a]/95' : 'bg-[#FBF8F1]/95'} shadow-xl rounded-xl overflow-hidden`}>
            {/* النقوش الجانبية (Decorative End Caps) */}
            <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-[#D4AF37]/20 flex items-center justify-center bg-[#D4AF37]/5">
              <div className="w-4 h-4 rounded-full border border-[#D4AF37]/60 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/80" />
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-12 border-l border-[#D4AF37]/20 flex items-center justify-center bg-[#D4AF37]/5">
              <div className="w-4 h-4 rounded-full border border-[#D4AF37]/60 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/80" />
              </div>
            </div>
            {/* خطوط ذهبية رقيقة */}
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
            <div className="absolute bottom-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          </div>

          {/* اليمين: اسم السورة */}
          <div className={`relative z-10 font-amiri text-lg font-bold ${textColor} drop-shadow-sm flex items-center gap-2`}>
            <span className="opacity-50 text-[10px] hidden sm:block">سُورَةُ</span>
            {currentSurah.name.replace(/^سُورَةُ\s+/, '')}
          </div>

          {/* المنتصف: أزرار تحكم مخفية جزئياً للحفاظ على الجمالية */}
          <div className="relative z-10 flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
            <button onClick={() => setIsDarkMode(!isDarkMode)} title="الوضع الليلي" className="p-1.5">{isDarkMode ? <FaSun size={12} /> : <FaMoon size={12} />}</button>
            <button onClick={() => navigate('/home')} title="الرئيسية" className="p-1.5"><FaHome size={12} /></button>
            <button onClick={() => setShowSurahList(true)} title="قائمة السور" className="p-1.5"><FaListUl size={12} /></button>
            <button onClick={toggleFullscreen} title="ملء الشاشة" className="p-1.5">{isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}</button>
          </div>

          {/* اليسار: الجزء والحزب */}
          <div className={`relative z-10 font-amiri text-xs sm:text-base ${textColor} flex items-center gap-1`}>
            <span>الجُزْءُ {juzNames[currentJuz - 1] || currentJuz}</span>
            <span className="mx-1 opacity-40">|</span>
            <span>الحِزْبُ {currentHizb.toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* شريط التقدم للورد (خارج البرواز الزخرفي) */}
        {wirdSettings?.enabled && (
          <div className="max-w-md mx-auto mt-1 flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-[10px] transition-all">
            <FaBookOpen size={10} />
            <span>الورد اليومي: {wirdProgress.pagesRead.length}/{wirdSettings.targetPages}</span>
            {wirdProgress.pagesRead.length >= wirdSettings.targetPages && (
              <FaCheck size={10} className="text-green-500" />
            )}
          </div>
        )}
      </header>

      {/* منطقة عرض الصفحة - النصوص القرآنية */}
      <main id="quran-scroll-container" className="flex-1 pt-10 pb-24 px-3 md:px-6 overflow-y-auto flex flex-col justify-start relative">
        <div className="max-w-xl mx-auto w-full flex flex-col justify-center min-h-full">
          {/* رأس الصفحة - إزاحة بسيطة للمحتوى */}
          <div className="mb-4" />

          {/* محتوى الصفحة - بدون صندوق */}
          {pageVerses.length === 0 ? (
            <div className={`text-center py-12 ${textColor}`}>
              <p className="font-cairo">لا توجد آيات في هذه الصفحة</p>
            </div>
          ) : (
            <div className="text-justify w-full px-2 sm:px-4 md:px-8" style={{ fontSize: 'clamp(14px, 2.5vh, 26px)', lineHeight: '1.87', textAlignLast: 'center' }}>
              {(() => {
                const shownSurahs = new Set();
                return pageVerses.map((item, index) => {
                  if (item.type === 'surah-header') {
                    return (
                      <div key={`header-${item.surahNumber}`} className="my-6 relative px-1 w-full flex justify-center">
                        {/* برواز السورة الزخرفي الفاخر (يظهر على جميع الشاشات) */}
                        <div className="relative w-full max-w-[95%] sm:max-w-xl h-14 sm:h-20 flex items-center justify-center">
                          {/* إطارات البرواز الذهبية (تتمدد تلقائيا بدون تشوه السماكة) */}
                          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className={`absolute inset-0 w-full h-full drop-shadow-sm ${isDarkMode ? 'fill-[#2a2a2a] text-[#D4AF37]' : 'fill-[#FDF9F1] text-[#A68A5E]'}`}>
                            {/* الخلفية العميقة */}
                            <path d="M0,50 L20,5 H980 L1000,50 L980,95 L20,95 Z" fill="currentColor" />
                            {/* الإطار الخارجي */}
                            <path d="M0,50 L20,5 H980 L1000,50 L980,95 L20,95 Z" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            {/* الإطار الداخلي */}
                            <path d="M10,50 L27,12 H973 L990,50 L973,88 L27,88 Z" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            {/* خط الفصل الأيسر */}
                            <line x1="150" y1="12" x2="185" y2="50" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            <line x1="185" y1="50" x2="150" y2="88" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            {/* خط الفصل الأيمن */}
                            <line x1="850" y1="12" x2="815" y2="50" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            <line x1="815" y1="50" x2="850" y2="88" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                          </svg>

                          {/* الزخرفة النبايتة اليسرى (تحافظ على شكلها الدائري دائما) */}
                          <svg viewBox="0 0 140 100" preserveAspectRatio="xMinYMid meet" className={`absolute left-0 inset-y-0 h-full w-[25%] max-w-[120px] pointer-events-none ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#A68A5E]'}`}>
                            <g transform="translate(80, 50)">
                              <circle cx="0" cy="0" r="19" fill="none" stroke="currentColor" strokeWidth="1.2" />
                              <circle cx="0" cy="0" r="6" fill="currentColor" />
                              <path d="M0,-19 Q12,0 0,19 Q-12,0 0,-19 Z" fill="currentColor" className="opacity-40" />
                              <path d="M-19,0 Q0,12 19,0 Q0,-12 -19,0 Z" fill="currentColor" className="opacity-40" />
                            </g>
                          </svg>

                          {/* الزخرفة النباتية اليمنى */}
                          <svg viewBox="0 0 140 100" preserveAspectRatio="xMaxYMid meet" className={`absolute right-0 inset-y-0 h-full w-[25%] max-w-[120px] pointer-events-none ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#A68A5E]'}`}>
                            <g transform="translate(60, 50)">
                              <circle cx="0" cy="0" r="19" fill="none" stroke="currentColor" strokeWidth="1.2" />
                              <circle cx="0" cy="0" r="6" fill="currentColor" />
                              <path d="M0,-19 Q12,0 0,19 Q-12,0 0,-19 Z" fill="currentColor" className="opacity-40" />
                              <path d="M-19,0 Q0,12 19,0 Q0,-12 -19,0 Z" fill="currentColor" className="opacity-40" />
                            </g>
                          </svg>

                          {/* اسم السورة المنتصف */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <h2 className={`font-amiri font-bold pt-1.5 drop-shadow-sm tracking-wide ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#2D2A26]'}`} style={{ fontSize: 'clamp(18px, 3vh, 32px)' }}>
                              سُورَةُ {item.surahName.replace(/^سُورَةُ\s+/, '')}
                            </h2>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // الآيات
                  const isFirstAyah = item.numberInSurah === 1;
                  const isFatiha = item.surahNumber === 1;
                  const isTawbah = item.surahNumber === 9;

                  let displayBasmala = false;
                  let ayahText = item.text;

                  // البحث عن البسملة في بداية الآية الأولى (باستثناء التوبة)
                  if (isFirstAyah && !isTawbah) {
                    // إزالة حرف BOM إن وجد وتنظيف النص
                    const cleanText = ayahText.replace(/^\ufeff/, '').trim();
                    const basmalaPattern = /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ/;

                    if (basmalaPattern.test(cleanText)) {
                      displayBasmala = true;
                      // إزالة البسملة من النص الأصلي لترك بقية الآية (أو جعل النص فارغاً للفاتحة)
                      ayahText = cleanText.replace(basmalaPattern, '').trim();
                    }
                  }

                  return (
                    <React.Fragment key={`ayah-container-${item.surahNumber}-${item.numberInSurah}`}>
                      {displayBasmala && (
                        <div className={`block text-center font-amiri my-0.5 w-full ${ayahTextColor}`} style={{ fontSize: 'clamp(14px, 2.4vh, 22px)' }}>
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          {isFatiha && (
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[0.6em] font-bold mx-2 ${isDarkMode ? 'bg-[#D4AF37]/40 text-[#D4AF37]' : 'bg-[#D4AF37]/25 text-[#8B7355]'}`}>
                              {item.numberInSurah.toLocaleString('ar-EG')}
                            </span>
                          )}
                        </div>
                      )}
                      {/* عرض الآية فقط إذا كان هناك نص متبقي (لتجنب ظهور رقم 1 مكرر أو مساحة فارغة للفاتحة) */}
                      {ayahText.length > 0 && (
                        <span key={`ayah-${item.surahNumber}-${item.numberInSurah}`} className={`font-amiri ${ayahTextColor}`}>
                          {ayahText}
                          {(ayahText.trim() !== '' || !displayBasmala) && (
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[0.6em] font-bold mx-0.5 ${isDarkMode ? 'bg-[#D4AF37]/40 text-[#D4AF37]' : 'bg-[#D4AF37]/25 text-[#8B7355]'}`}>
                              {item.numberInSurah.toLocaleString('ar-EG')}
                            </span>
                          )}
                          {' '}
                        </span>
                      )}
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </main>

      {/* عناصر التحكم بالتمرير التلقائي */}
      <div className={`fixed bottom-20 right-6 md:right-10 z-[45] flex flex-col items-center gap-3 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}>
        {/* مؤشر السرعة (يظهر فقط أثناء التمرير التلقائي) */}
        <div className={`transition-all duration-300 transform ${isAutoScrolling ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-50 pointer-events-none'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); setAutoScrollSpeed(prev => prev === 3 ? 1 : prev + 1); }}
            className="w-10 h-10 rounded-full bg-[#D4AF37] text-white font-bold text-sm shadow-[0_2px_10px_rgba(212,175,55,0.4)] hover:bg-[#C5A028] transition-colors flex items-center justify-center font-cairo"
            title="تغيير سرعة القراءة"
          >
            {autoScrollSpeed}
          </button>
        </div>

        {/* زر التشغيل والإيقاف */}
        <button
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          title={isAutoScrolling ? "إيقاف التمرير التلقائي" : "تمرير تلقائي"}
          className={`p-3.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 ${isAutoScrolling
              ? 'bg-[#D4AF37] text-white shadow-[#D4AF37]/50'
              : `${isDarkMode ? 'bg-[#2a2a2a] text-[#A0917B]' : 'bg-[#FBF8F1] text-[#8B7355]'} border border-[#D4AF37]/50 hover:text-[#D4AF37] hover:scale-105`
            }`}
        >
          <FaAngleDoubleDown size={22} className={isAutoScrolling ? "animate-bounce" : ""} />
        </button>
      </div>

      {/* شريط سفلي للتنقل */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t ${footerBg} to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center p-4 max-w-lg mx-auto">
          {/* رقم الصفحة والجزء فقط */}
          <div className={`flex items-center justify-center gap-4 ${textColor}`}>
            <span className="font-cairo text-sm">الصفحة</span>
            <button
              onClick={() => setShowJumpModal(true)}
              className={`px-6 py-2 ${cardBg} rounded-full shadow-md ${textColor} font-cairo font-bold hover:opacity-80 transition border ${isDarkMode ? 'border-[#D4AF37]/30' : 'border-[#D4AF37]/20'}`}
            >
              {currentPage}
            </button>
            <span className="font-cairo text-sm">•</span>
            <span className="font-cairo text-sm">الجزء {currentJuz.toString().padStart(2, '0')}</span>
          </div>
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
                  className={`w-full flex items-center justify-between p-3 rounded-lg mb-1 transition ${currentSurah.number === surah.number
                    ? 'bg-[#D4AF37] text-white'
                    : isDarkMode ? 'hover:bg-[#3a3a3a] text-[#E5D9C7]' : 'hover:bg-[#FBF8F1] text-[#8B7355]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentSurah.number === surah.number
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
