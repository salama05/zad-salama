import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Icons from 'react-icons/fa';
import CachedQuranPage from '../components/CachedQuranPage';
import { getCacheStats } from '../hooks/useQuranImageCache';
import { useBackNavigation } from '../hooks/useBackNavigation';

function SurahDetail() {
  const { surahId } = useParams();
  const navigate = useNavigate();
  
  // Handle HW back button to return to the list
  useBackNavigation('/quran');

  const [surahName, setSurahName] = useState('');
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [fullSurahAudioUrl, setFullSurahAudioUrl] = useState(null);
  const [fullSurahReciterName, setFullSurahReciterName] = useState('');

  const [loading, setLoading] = useState(true);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // السحب باللمس (Swipe)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (parseInt(surahId) < 114) {
      navigate(`/quran/${parseInt(surahId) + 1}`);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (parseInt(surahId) > 1) {
      navigate(`/quran/${parseInt(surahId) - 1}`);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; 

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
          goToPrevPage();
        } else {
          goToNextPage();
        }
    }
  };

  const savedMushaf = localStorage.getItem('selectedMushaf') || 'hafs';
  const mushafName = localStorage.getItem('selectedMushafName') || 'الرواية';
  const isUnsupportedVisual = savedMushaf === 'qalun' || savedMushaf === 'doori';

  // Selected states
  const [selectedHafsReciter, setSelectedHafsReciter] = useState(() => {
    const saved = localStorage.getItem('hafsReciterId');
    const validIds = ["30", "31", "12", "20", "112", "102", "5", "4", "74", "92"];
    if (saved && validIds.includes(saved)) return saved;
    return "30";
  });
  const [selectedQalunReciter, setSelectedQalunReciter] = useState(() => {
    return localStorage.getItem('qalunReciterId') || "74";
  });
  const [selectedDooriReciter, setSelectedDooriReciter] = useState(() => {
    return localStorage.getItem('dooriReciterId') || "118";
  });
  const [selectedWarshReciter, setSelectedWarshReciter] = useState(() => {
    return localStorage.getItem('warshReciterId') || "14";
  });

  // Reciter Lists
  const hafsReciters = [
    { id: "30", name: "سعد الغامدي", server: "https://server7.mp3quran.net/s_gmd/" },
    { id: "31", name: "سعود الشريم", server: "https://server7.mp3quran.net/shur/" },
    { id: "12", name: "إدريس أبكر", server: "https://server6.mp3quran.net/abkr/" },
    { id: "20", name: "خالد الجليل", server: "https://server10.mp3quran.net/jleel/" },
    { id: "112", name: "محمد صديق المنشاوي", server: "https://server10.mp3quran.net/minsh/" },
    { id: "102", name: "ماهر المعيقلي", server: "https://server12.mp3quran.net/maher/" },
    { id: "5", name: "أحمد بن علي العجمي", server: "https://server10.mp3quran.net/ajm/" },
    { id: "4", name: "أبو بكر الشاطري", server: "https://server11.mp3quran.net/shatri/" },
    { id: "74", name: "علي بن عبدالرحمن الحذيفي", server: "https://server9.mp3quran.net/hthfi/" },
    { id: "92", name: "ياسر الدوسري", server: "https://server11.mp3quran.net/yasser/" }
  ];

  const qalunReciters = [
    { id: 74, name: "علي بن عبدالرحمن الحذيفي", server: "https://server9.mp3quran.net/huthifi_qalon/" },
    { id: 118, name: "محمود خليل الحصري", server: "https://server13.mp3quran.net/husr/Rewayat-Qalon-A-n-Nafi/" },
    { id: 208, name: "الدوكالي محمد العالم", server: "https://server7.mp3quran.net/dokali/" },
    { id: 201, name: "أحمد الطرابلسي", server: "https://server10.mp3quran.net/trablsi/" },
    { id: 212, name: "طارق عبدالغني دعوب", server: "https://server10.mp3quran.net/tareq/" },
    { id: 275, name: "محمد الأمين قنيوة", server: "https://server16.mp3quran.net/qeniwa/Rewayat-Qalon-A-n-Nafi/" },
    { id: 44, name: "صلاح الهاشم", server: "https://server12.mp3quran.net/salah_hashim_m/Rewayat-Qalon-A-n-Nafi/" }
  ];

  const dooriReciters = [
    { id: 118, name: "محمود خليل الحصري", server: "https://server13.mp3quran.net/husr/Rewayat-Aldori-A-n-Abi-Amr/" },
    { id: 138, name: "نورين محمد صديق", server: "https://server16.mp3quran.net/nourin_siddig/Rewayat-Aldori-A-n-Abi-Amr/" },
    { id: 211, name: "الفاتح محمد الزبير", server: "https://server6.mp3quran.net/fateh/" },
    { id: 116, name: "محمد عبدالحكيم سعيد العبدالله", server: "https://server9.mp3quran.net/abdullah/Rewayat-AlDorai-A-n-Al-Kisa-ai/" }
  ];

  const warshReciters = [
    { id: 14, name: "القارئ ياسين الجزائري", server: "https://server11.mp3quran.net/qari/" },
    { id: 305, name: "هشام الهراز", server: "https://server16.mp3quran.net/H-Lharraz/Rewayat-Warsh-A-n-Nafi/" },
    { id: 118, name: "محمود خليل الحصري", server: "https://server13.mp3quran.net/husr/Rewayat-Warsh-A-n-Nafi/" },
    { id: 51, name: "عبدالباسط عبدالصمد", server: "https://server7.mp3quran.net/basit/Rewayat-Warsh-A-n-Nafi/" },
    { id: 16, name: "العيون الكوشي", server: "https://server11.mp3quran.net/koshi/" },
    { id: 80, name: "عمر القزابري", server: "https://server9.mp3quran.net/omar_warsh/" },
    { id: 104, name: "محمد الأيراوي", server: "https://server6.mp3quran.net/earawi/" },
    { id: 115, name: "محمد عبدالكريم (من طريق الأصبهاني)", server: "https://server12.mp3quran.net/m_krm/Rewayat-Warsh-A-n-Nafi-Men-Tariq-Abi-Baker-Alasbahani/" },
    { id: 134, name: "محمد سايد", server: "https://server16.mp3quran.net/m_sayed/Rewayat-Warsh-A-n-Nafi/" },
    { id: 178, name: "إبراهيم الدوسري", server: "https://server10.mp3quran.net/ibrahim_dosri/Rewayat-Warsh-A-n-Nafi/" },
    { id: 26, name: "رشيد إفراد", server: "https://server12.mp3quran.net/ifrad/" },
    { id: 264, name: "يونس اسويلص", server: "https://server16.mp3quran.net/souilass/Rewayat-Warsh-A-n-Nafi/" },
    { id: 265, name: "أحمد ديبان", server: "https://server16.mp3quran.net/deban/Rewayat-Warsh-A-n-Nafi-Men-Tariq-Alazraq/" },
    { id: 27, name: "رشيد بلعالية", server: "https://server6.mp3quran.net/bl3/Rewayat-Warsh-A-n-Nafi/" },
    { id: 307, name: "عبدالعزيز سحيم", server: "https://server16.mp3quran.net/a_sheim/Rewayat-Warsh-A-n-Nafi/" }
  ];

  useEffect(() => {
    setLoading(true);

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

      // Full Surah flow
      // Pad the surah ID to 3 digits (e.g. 1 -> 001.mp3)
      const formattedSurahId = String(surahId).padStart(3, '0');
      let serverUrl = '';
      let reciterName = '';

      if (savedMushaf === 'qalun') {
        const reciterInfo = qalunReciters.find(r => r.id.toString() === selectedQalunReciter);
        if (reciterInfo) {
          serverUrl = reciterInfo.server;
          reciterName = `${reciterInfo.name} (قالون)`;
        }
      } else if (savedMushaf === 'doori') {
        const reciterInfo = dooriReciters.find(r => r.id.toString() === selectedDooriReciter);
        if (reciterInfo) {
          serverUrl = reciterInfo.server;
          reciterName = `${reciterInfo.name} (الدوري)`;
        }
      } else if (savedMushaf === 'warsh') {
        const reciterInfo = warshReciters.find(r => r.id.toString() === selectedWarshReciter);
        if (reciterInfo) {
          serverUrl = reciterInfo.server;
          reciterName = `${reciterInfo.name} (ورش عن نافع)`;
        }
      } else if (savedMushaf === 'hafs') {
        const reciterInfo = hafsReciters.find(r => r.id.toString() === selectedHafsReciter);
        if (reciterInfo) {
          serverUrl = reciterInfo.server;
          reciterName = `${reciterInfo.name} (حفص عن عاصم)`;
        }
      }

      setFullSurahAudioUrl(`${serverUrl}${formattedSurahId}.mp3`);
      setFullSurahReciterName(reciterName);
      setLoading(false);
    });

  }, [surahId, savedMushaf, selectedWarshReciter, selectedHafsReciter, selectedQalunReciter, selectedDooriReciter]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsPlaying(false);
    setCurrentPageIndex(0);
  }, [surahId]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // تحديد الرواية للصور (hafs أو warsh)
  const getImageRiwayah = () => {
    if (savedMushaf === 'warsh') return 'warsh';
    return 'hafs';
  };

  // Helper function to render active dropdown
  const renderReciterDropdown = () => {
    let currentList = [];
    let currentValue = '';
    let onChangeHandler = null;

    if (savedMushaf === 'hafs') {
      currentList = hafsReciters;
      currentValue = selectedHafsReciter;
      onChangeHandler = (e) => {
        const newId = e.target.value;
        setSelectedHafsReciter(newId);
        localStorage.setItem('hafsReciterId', newId);
        setIsPlaying(false);
      };
    } else if (savedMushaf === 'warsh') {
      currentList = warshReciters;
      currentValue = selectedWarshReciter;
      onChangeHandler = (e) => {
        const newId = e.target.value;
        setSelectedWarshReciter(newId);
        localStorage.setItem('warshReciterId', newId);
        setIsPlaying(false);
      };
    } else if (savedMushaf === 'qalun') {
      currentList = qalunReciters;
      currentValue = selectedQalunReciter;
      onChangeHandler = (e) => {
        const newId = e.target.value;
        setSelectedQalunReciter(newId);
        localStorage.setItem('qalunReciterId', newId);
        setIsPlaying(false);
      };
    } else if (savedMushaf === 'doori') {
      currentList = dooriReciters;
      currentValue = selectedDooriReciter;
      onChangeHandler = (e) => {
        const newId = e.target.value;
        setSelectedDooriReciter(newId);
        localStorage.setItem('dooriReciterId', newId);
        setIsPlaying(false);
      };
    }

    if (currentList.length === 0) return null;

    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-cairo text-zad-text font-bold">القارئ:</label>
        <select
          value={currentValue}
          onChange={onChangeHandler}
          className="bg-transparent border border-zad-border/50 rounded-md text-sm font-cairo text-zad-text px-2 py-1 outline-none focus:border-zad-border bg-white"
        >
          {currentList.map(rec => (
            <option key={rec.id} value={rec.id}>{rec.name}</option>
          ))}
        </select>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zad-border"></div>
      </div>
    );
  }

  return (
    <div className="page-enter-active pb-32 overflow-x-hidden w-screen">
      {/* Sticky Audio Player Top */}
      <div className="sticky top-0 left-0 right-0 bg-zad-bg border-b border-zad-border p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-50 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button onClick={togglePlay} className="w-14 h-14 bg-zad-border rounded-full flex justify-center items-center text-white hover:bg-[#C5A028] transition-transform active:scale-95 shadow-md shrink-0">
              {isPlaying ? <Icons.FaPause size={20} /> : <Icons.FaPlay size={20} className="ml-1" />}
            </button>
            <div>
              {renderReciterDropdown()}
              <p className="text-xs opacity-70 font-cairo text-zad-text mt-1">
                سورة {surahName} - تلاوة السورة كاملة
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-zad-border border-opacity-30">
        <div>
          <h2 className="text-2xl md:text-3xl font-amiri font-bold text-[#D4B595] drop-shadow-sm">سورة {surahName}</h2>
          <p className="text-xs md:text-sm font-cairo opacity-70 mt-1">المصحف المصور - {mushafName}</p>
        </div>
        <div className="flex space-x-4 space-x-reverse">
          <Link to="/quran" className="p-2 rounded-full hover:bg-zad-border/20 transition-colors text-zad-border">
            <Icons.FaListUl size={20} />
          </Link>
          <Link to="/home" className="p-2 rounded-full hover:bg-zad-border/20 transition-colors text-zad-border">
            <Icons.FaHome size={20} />
          </Link>
        </div>
      </div>

      {isUnsupportedVisual ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Icons.FaBookOpen size={64} className="text-zad-border/40 mb-6" />
          <h3 className="font-amiri text-2xl font-bold text-zad-border mb-4 text-center">عذراً، المصحف المصور غير متوفر</h3>
          <p className="font-cairo text-center opacity-80 max-w-md leading-relaxed">
            النسخة المصورة المخصصة للرسم العثماني المطابق لـ ({mushafName}) غير متوفرة في الوقت الحالي ويجري العمل على توفيرها.
            <br /><br />
            (يمكنك الاستماع للتلاوة الصوتية للرواية من خلال المشغل بالأسفل).
          </p>
        </div>
      ) : (
        <div 
          className="flex flex-col items-center gap-0 w-full max-w-2xl mx-auto touch-pan-y overflow-x-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {pages.length > 0 && (
            <div className="relative w-full shadow-lg overflow-hidden border-2 border-zad-border/30 bg-white rounded-md group">
              <CachedQuranPage
                key={`page-${pages[currentPageIndex]}-${getImageRiwayah()}`}
                pageNumber={pages[currentPageIndex]}
                riwayah={getImageRiwayah()}
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation Between Pages and Surahs */}
      {/* تم إخفاء الأزرار للاعتماد على اللمس وتوفير مساحة كاملة للمصحف */}
      {pages.length > 0 && !isUnsupportedVisual && (
        <div className="flex justify-center items-center max-w-2xl mx-auto mt-0 mb-2 px-4 font-cairo" dir="rtl">
          {/* Page Indicator Only */}
          <div className="text-sm font-bold text-zad-text bg-zad-bg border border-zad-border/30 px-3 py-1 rounded-full shadow-md text-center min-w-[70px] opacity-80">
            {currentPageIndex + 1} / {pages.length}
          </div>
        </div>
      )}

      {/* Audio Element Hidden */}
      {fullSurahAudioUrl && (
        <audio
          ref={audioRef}
          src={fullSurahAudioUrl}
          onEnded={handleAudioEnded}
        />
      )}
    </div>
  );
}

export default SurahDetail;
