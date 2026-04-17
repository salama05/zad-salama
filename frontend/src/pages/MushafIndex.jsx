import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBook, FaLayerGroup, FaArrowRight, FaBell, FaCog, FaCheck, FaTimes } from 'react-icons/fa';
import { useMushafBookmark } from '../hooks/useMushafBookmark';
import { useMushafWird } from '../hooks/useMushafWird';

// بيانات السور الكاملة
const SURAH_DATA = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', verses: 7, page: 1, type: 'مكية' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqara', verses: 286, page: 2, type: 'مدنية' },
  { number: 3, name: 'آل عمران', englishName: 'Aal-Imran', verses: 200, page: 50, type: 'مدنية' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', verses: 176, page: 77, type: 'مدنية' },
  { number: 5, name: 'المائدة', englishName: 'Al-Maida', verses: 120, page: 106, type: 'مدنية' },
  { number: 6, name: 'الأنعام', englishName: 'Al-Anam', verses: 165, page: 128, type: 'مكية' },
  { number: 7, name: 'الأعراف', englishName: 'Al-Araf', verses: 206, page: 151, type: 'مكية' },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', verses: 75, page: 177, type: 'مدنية' },
  { number: 9, name: 'التوبة', englishName: 'At-Tawba', verses: 129, page: 187, type: 'مدنية' },
  { number: 10, name: 'يونس', englishName: 'Yunus', verses: 109, page: 208, type: 'مكية' },
  { number: 11, name: 'هود', englishName: 'Hud', verses: 123, page: 221, type: 'مكية' },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', verses: 111, page: 235, type: 'مكية' },
  { number: 13, name: 'الرعد', englishName: 'Ar-Rad', verses: 43, page: 249, type: 'مدنية' },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', verses: 52, page: 255, type: 'مكية' },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', verses: 99, page: 262, type: 'مكية' },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', verses: 128, page: 267, type: 'مكية' },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', verses: 111, page: 282, type: 'مكية' },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', verses: 110, page: 293, type: 'مكية' },
  { number: 19, name: 'مريم', englishName: 'Maryam', verses: 98, page: 305, type: 'مكية' },
  { number: 20, name: 'طه', englishName: 'Ta-Ha', verses: 135, page: 312, type: 'مكية' },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', verses: 112, page: 322, type: 'مكية' },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', verses: 78, page: 332, type: 'مدنية' },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Muminun', verses: 118, page: 342, type: 'مكية' },
  { number: 24, name: 'النور', englishName: 'An-Nur', verses: 64, page: 350, type: 'مدنية' },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', verses: 77, page: 359, type: 'مكية' },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shuara', verses: 227, page: 367, type: 'مكية' },
  { number: 27, name: 'النمل', englishName: 'An-Naml', verses: 93, page: 377, type: 'مكية' },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', verses: 88, page: 385, type: 'مكية' },
  { number: 29, name: 'العنكبوت', englishName: 'Al-Ankabut', verses: 69, page: 396, type: 'مكية' },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', verses: 60, page: 404, type: 'مكية' },
  { number: 31, name: 'لقمان', englishName: 'Luqman', verses: 34, page: 411, type: 'مكية' },
  { number: 32, name: 'السجدة', englishName: 'As-Sajda', verses: 30, page: 415, type: 'مكية' },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', verses: 73, page: 418, type: 'مدنية' },
  { number: 34, name: 'سبأ', englishName: 'Saba', verses: 54, page: 428, type: 'مكية' },
  { number: 35, name: 'فاطر', englishName: 'Fatir', verses: 45, page: 434, type: 'مكية' },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', verses: 83, page: 440, type: 'مكية' },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', verses: 182, page: 446, type: 'مكية' },
  { number: 38, name: 'ص', englishName: 'Sad', verses: 88, page: 453, type: 'مكية' },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', verses: 75, page: 458, type: 'مكية' },
  { number: 40, name: 'غافر', englishName: 'Ghafir', verses: 85, page: 467, type: 'مكية' },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', verses: 54, page: 477, type: 'مكية' },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', verses: 53, page: 483, type: 'مكية' },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', verses: 89, page: 489, type: 'مكية' },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', verses: 59, page: 496, type: 'مكية' },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiya', verses: 37, page: 499, type: 'مكية' },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', verses: 35, page: 502, type: 'مكية' },
  { number: 47, name: 'محمد', englishName: 'Muhammad', verses: 38, page: 507, type: 'مدنية' },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', verses: 29, page: 511, type: 'مدنية' },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', verses: 18, page: 515, type: 'مدنية' },
  { number: 50, name: 'ق', englishName: 'Qaf', verses: 45, page: 518, type: 'مكية' },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', verses: 60, page: 520, type: 'مكية' },
  { number: 52, name: 'الطور', englishName: 'At-Tur', verses: 49, page: 523, type: 'مكية' },
  { number: 53, name: 'النجم', englishName: 'An-Najm', verses: 62, page: 526, type: 'مكية' },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', verses: 55, page: 528, type: 'مكية' },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', verses: 78, page: 531, type: 'مدنية' },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqia', verses: 96, page: 534, type: 'مكية' },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', verses: 29, page: 537, type: 'مدنية' },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', verses: 22, page: 542, type: 'مدنية' },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', verses: 24, page: 545, type: 'مدنية' },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahina', verses: 13, page: 549, type: 'مدنية' },
  { number: 61, name: 'الصف', englishName: 'As-Saff', verses: 14, page: 551, type: 'مدنية' },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumua', verses: 11, page: 553, type: 'مدنية' },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', verses: 11, page: 554, type: 'مدنية' },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', verses: 18, page: 556, type: 'مدنية' },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', verses: 12, page: 558, type: 'مدنية' },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', verses: 12, page: 560, type: 'مدنية' },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', verses: 30, page: 562, type: 'مكية' },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', verses: 52, page: 564, type: 'مكية' },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haaqqa', verses: 52, page: 566, type: 'مكية' },
  { number: 70, name: 'المعارج', englishName: 'Al-Maarij', verses: 44, page: 568, type: 'مكية' },
  { number: 71, name: 'نوح', englishName: 'Nuh', verses: 28, page: 570, type: 'مكية' },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', verses: 28, page: 572, type: 'مكية' },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', verses: 20, page: 574, type: 'مكية' },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddathir', verses: 56, page: 575, type: 'مكية' },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyama', verses: 40, page: 577, type: 'مكية' },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan', verses: 31, page: 578, type: 'مدنية' },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', verses: 50, page: 580, type: 'مكية' },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', verses: 40, page: 582, type: 'مكية' },
  { number: 79, name: 'النازعات', englishName: 'An-Naziat', verses: 46, page: 583, type: 'مكية' },
  { number: 80, name: 'عبس', englishName: 'Abasa', verses: 42, page: 585, type: 'مكية' },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', verses: 29, page: 586, type: 'مكية' },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', verses: 19, page: 587, type: 'مكية' },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', verses: 36, page: 587, type: 'مكية' },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', verses: 25, page: 589, type: 'مكية' },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', verses: 22, page: 590, type: 'مكية' },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', verses: 17, page: 591, type: 'مكية' },
  { number: 87, name: 'الأعلى', englishName: 'Al-Ala', verses: 19, page: 591, type: 'مكية' },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiya', verses: 26, page: 592, type: 'مكية' },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', verses: 30, page: 593, type: 'مكية' },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', verses: 20, page: 594, type: 'مكية' },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', verses: 15, page: 595, type: 'مكية' },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', verses: 21, page: 595, type: 'مكية' },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duha', verses: 11, page: 596, type: 'مكية' },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', verses: 8, page: 596, type: 'مكية' },
  { number: 95, name: 'التين', englishName: 'At-Tin', verses: 8, page: 597, type: 'مكية' },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', verses: 19, page: 597, type: 'مكية' },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', verses: 5, page: 598, type: 'مكية' },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyina', verses: 8, page: 598, type: 'مدنية' },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzala', verses: 8, page: 599, type: 'مدنية' },
  { number: 100, name: 'العاديات', englishName: 'Al-Adiyat', verses: 11, page: 599, type: 'مكية' },
  { number: 101, name: 'القارعة', englishName: 'Al-Qaria', verses: 11, page: 600, type: 'مكية' },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', verses: 8, page: 600, type: 'مكية' },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', verses: 3, page: 601, type: 'مكية' },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humaza', verses: 9, page: 601, type: 'مكية' },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', verses: 5, page: 601, type: 'مكية' },
  { number: 106, name: 'قريش', englishName: 'Quraysh', verses: 4, page: 602, type: 'مكية' },
  { number: 107, name: 'الماعون', englishName: 'Al-Maun', verses: 7, page: 602, type: 'مكية' },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', verses: 3, page: 602, type: 'مكية' },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', verses: 6, page: 603, type: 'مكية' },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', verses: 3, page: 603, type: 'مدنية' },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', verses: 5, page: 603, type: 'مكية' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', verses: 4, page: 604, type: 'مكية' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', verses: 5, page: 604, type: 'مكية' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', verses: 6, page: 604, type: 'مكية' },
];

// بيانات الأجزاء
const JUZ_DATA = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  page: [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582][i]
}));

function MushafIndex() {
  const navigate = useNavigate();
  const { currentPage, goToPage } = useMushafBookmark();
  const { wirdSettings, wirdProgress, updateSettings } = useMushafWird();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('surahs'); // 'surahs' or 'juz'
  const [showWirdSettings, setShowWirdSettings] = useState(false);
  const [tempWirdSettings, setTempWirdSettings] = useState({ ...wirdSettings });

  // Open settings
  const openWirdSettings = () => {
    setTempWirdSettings({ ...wirdSettings });
    setShowWirdSettings(true);
  };

  // Save settings
  const saveWirdSettings = () => {
    updateSettings(tempWirdSettings);
    setShowWirdSettings(false);
  };

  // تصفية السور بناءً على البحث
  const filteredSurahs = SURAH_DATA.filter(surah => 
    surah.name.includes(searchQuery) ||
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.number.toString() === searchQuery
  );

  // فتح المصحف على صفحة معينة
  const openMushaf = (page) => {
    goToPage(page);
    navigate('/mushaf-reader');
  };

  return (
    <div className="min-h-screen bg-[#FBF8F1]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FBF8F1] border-b border-[#D4AF37]/20 shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 text-[#8B7355] hover:bg-[#D4AF37]/10 rounded-full transition"
            >
              <FaArrowRight size={20} />
            </button>
            <h1 className="font-amiri text-2xl text-[#8B7355]">فهرس المصحف الشريف</h1>
            <div className="w-10"></div>
          </div>

          {/* شريط البحث */}
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0917B]" />
            <input
              type="text"
              placeholder="ابحث عن سورة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 rounded-lg border-2 border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none font-cairo text-right bg-white"
              dir="rtl"
            />
          </div>

          {/* إعدادات الورد */}
          <div className="mt-2 bg-white px-3 py-2 rounded-lg border border-[#D4AF37]/30 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <h3 className="text-sm font-cairo font-bold text-[#8B7355] flex items-center">
                <FaBook className="ml-1.5 text-[#D4AF37]" size={12} />
                وردك اليومي
              </h3>
              
              {!wirdSettings.enabled ? (
                <button 
                  onClick={openWirdSettings}
                  className="text-[10px] sm:text-xs font-cairo bg-[#D4AF37] text-white px-2 py-1 rounded hover:bg-[#8B7355] transition flex items-center"
                >
                  <FaBell className="ml-1" size={10} /> تفعيل
                </button>
              ) : (
                <button 
                  onClick={openWirdSettings} 
                  className="p-1 text-[#A0917B] hover:text-[#D4AF37] transition bg-[#FBF8F1] rounded-full"
                >
                  <FaCog size={12} />
                </button>
              )}
            </div>
            
            {wirdSettings.enabled && (
              <div className="z-10 relative mt-1.5">
                <div className="flex justify-between text-[10px] sm:text-xs font-cairo text-[#8B7355] mb-1">
                  <span>المنجز: {wirdProgress.pagesRead.length}</span>
                  <span>الهدف: {wirdSettings.targetPages}</span>
                </div>
                <div className="w-full bg-[#FBF8F1] rounded-full h-1.5">
                  <div 
                    className="bg-[#D4AF37] h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((wirdProgress.pagesRead.length / wirdSettings.targetPages) * 100, 100)}%` }}
                  ></div>
                </div>
                {wirdProgress.pagesRead.length >= wirdSettings.targetPages && (
                  <p className="text-green-600 text-[10px] mt-1 font-bold flex items-center justify-center">
                    <FaCheck className="ml-1" size={8} /> أتممت وردك اليوم!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* تبويبات */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('surahs')}
              className={`flex-1 py-2 rounded-lg font-cairo font-bold transition ${
                activeTab === 'surahs'
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-white text-[#8B7355] border border-[#D4AF37]/30'
              }`}
            >
              <FaBook className="inline ml-2" />
              السور
            </button>
            <button
              onClick={() => setActiveTab('juz')}
              className={`flex-1 py-2 rounded-lg font-cairo font-bold transition ${
                activeTab === 'juz'
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-white text-[#8B7355] border border-[#D4AF37]/30'
              }`}
            >
              <FaLayerGroup className="inline ml-2" />
              الأجزاء
            </button>
          </div>
        </div>
      </header>

      {/* بطاقة العلامة المرجعية */}
      {currentPage > 1 && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <button
            onClick={() => navigate('/mushaf-reader')}
            className="w-full px-3 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-white rounded-lg shadow-sm flex items-center justify-between"
          >
            <div className="text-right">
              <p className="font-cairo font-bold text-sm">متابعة القراءة</p>
              <p className="font-cairo text-xs opacity-90">الصفحة {currentPage}</p>
            </div>
            <FaArrowRight className="rotate-180" size={16} />
          </button>
        </div>
      )}

      {/* المحتوى */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-20">
        {activeTab === 'surahs' ? (
          // قائمة السور
          <div className="space-y-2">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => openMushaf(surah.page)}
                className="w-full bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition border border-[#D4AF37]/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                    <span className="font-cairo font-bold text-[#D4AF37]">{surah.number}</span>
                  </div>
                  <div className="text-right" dir="rtl">
                    <div className="flex items-center justify-start gap-2 mb-1">
                      <h3 className="font-amiri text-xl text-[#8B7355]">{surah.name}</h3>
                      <span className="text-[10px] font-cairo px-2 py-0.5 bg-[#D4AF37]/10 text-[#8B7355] rounded border border-[#D4AF37]/20">
                        {surah.type}
                      </span>
                    </div>
                    <p className="font-cairo text-xs text-[#A0917B]">
                      {surah.englishName} • {surah.verses} آية
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="font-cairo text-sm text-[#D4AF37] font-bold">ص {surah.page}</span>
                </div>
              </button>
            ))}

            {filteredSurahs.length === 0 && (
              <div className="text-center py-12">
                <FaSearch className="text-5xl text-[#A0917B] mx-auto mb-4 opacity-50" />
                <p className="font-cairo text-[#8B7355]">لم يتم العثور على نتائج</p>
              </div>
            )}
          </div>
        ) : (
          // قائمة الأجزاء
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {JUZ_DATA.map((juz) => (
              <button
                key={juz.number}
                onClick={() => openMushaf(juz.page)}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition border border-[#D4AF37]/10"
              >
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-cairo font-bold text-xl text-[#D4AF37]">{juz.number}</span>
                </div>
                <p className="font-amiri text-lg text-[#8B7355]">الجزء {juz.number}</p>
                <p className="font-cairo text-xs text-[#A0917B]">ص {juz.page}</p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* نافذة إعدادات الورد */}
      {showWirdSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" dir="rtl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-amiri font-bold text-[#8B7355]">إعدادات الورد اليومي</h2>
              <button 
                onClick={() => setShowWirdSettings(false)}
                className="text-[#A0917B] hover:text-red-500 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="font-cairo font-bold text-[#8B7355]">تفعيل التنبيه والورد</label>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="toggle" 
                      checked={tempWirdSettings.enabled}
                      onChange={(e) => setTempWirdSettings({...tempWirdSettings, enabled: e.target.checked})}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200"
                      style={{ right: tempWirdSettings.enabled ? '0' : 'auto', left: tempWirdSettings.enabled ? 'auto' : '0', borderColor: tempWirdSettings.enabled ? '#D4AF37' : '#e5e7eb' }}
                    />
                    <label 
                      htmlFor="toggle" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${tempWirdSettings.enabled ? 'bg-[#D4AF37]' : ''}`}
                    ></label>
                </div>
              </div>

              {tempWirdSettings.enabled && (
                <>
                  <div>
                    <label className="block font-cairo font-bold text-[#8B7355] mb-2">عدد الصفحات باليوم</label>
                    <input 
                      type="number" 
                      min="1" max="604"
                      value={tempWirdSettings.targetPages}
                      onChange={(e) => setTempWirdSettings({...tempWirdSettings, targetPages: parseInt(e.target.value) || 1})}
                      className="w-full border-2 border-[#D4AF37]/30 rounded-lg px-4 py-2 font-cairo text-center focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-cairo font-bold text-[#8B7355] mb-2">وقت التنبيه</label>
                    <input 
                      type="time" 
                      value={tempWirdSettings.reminderTime}
                      onChange={(e) => setTempWirdSettings({...tempWirdSettings, reminderTime: e.target.value})}
                      className="w-full border-2 border-[#D4AF37]/30 rounded-lg px-4 py-2 font-cairo text-center focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={saveWirdSettings}
              className="w-full mt-8 bg-[#D4AF37] hover:bg-[#8B7355] text-white font-cairo font-bold py-3 rounded-xl transition shadow-md"
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MushafIndex;
