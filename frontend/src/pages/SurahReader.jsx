import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import { useBackNavigation } from '../hooks/useBackNavigation';

function SurahReader() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMushaf, setSelectedMushaf] = useState(null);
  const navigate = useNavigate();

  // Handle hardware back button
  useBackNavigation(() => {
    if (selectedMushaf) {
      setSelectedMushaf(null);
    } else {
      navigate('/home');
    }
  });

  const mushafs = [
    { id: 'hafs', name: 'حفص عن عاصم' },
    { id: 'warsh', name: 'ورش عن نافع' },
    { id: 'qalun', name: 'قالون عن نافع' },
    { id: 'doori', name: 'الدوري عن أبي عمرو' },
  ];

  useEffect(() => {
    if (selectedMushaf) {
      setLoading(true);
      // Fetch surah list offline from local JSON
      axios.get('/quran-hafs.json')
        .then(res => {
          // Map to match the previous API format
          const mappedSurahs = res.data.data.surahs.map(s => ({
            number: s.number,
            name: s.name,
            englishName: s.englishName,
            revelationType: s.revelationType,
            numberOfAyahs: s.ayahs ? s.ayahs.length : 0
          }));
          setSurahs(mappedSurahs);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching surahs", err);
          setLoading(false);
        });
    }
  }, [selectedMushaf]);

  if (!selectedMushaf) {
    return (
      <div className="page-enter-active pb-20 flex flex-col items-center">
        <div className="w-full flex items-center mb-12 relative">
          <Link to="/home" className="absolute right-0 text-zad-border hover:text-[#C5A028] transition-colors p-2 z-10 cursor-pointer">
             <Icons.FaArrowRight size={24} />
          </Link>
          <h2 className="text-3xl font-amiri font-bold text-center w-full text-zad-border drop-shadow-sm">اختر الرواية</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
          {mushafs.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                // Save choice in localStorage to pass it to SurahDetail if needed
                localStorage.setItem('selectedMushaf', m.id);
                localStorage.setItem('selectedMushafName', m.name);
                setSelectedMushaf(m.id);
              }}
              className="flex flex-col items-center justify-center p-8 border-2 border-zad-border/50 rounded-2xl hover:border-zad-border hover:bg-zad-border hover:text-white transition-all transform hover:-translate-y-1 shadow-sm bg-white bg-opacity-60 group cursor-pointer text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 islamic-bg opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <Icons.FaQuran size={56} className="text-zad-border group-hover:text-white transition-colors mb-4 z-10" />
              <h3 className="font-amiri font-bold text-2xl z-10">{m.name}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zad-border"></div>
      </div>
    );
  }

  return (
    <div className="page-enter-active pb-20">
      <div className="flex items-center mb-8 relative">
        <button onClick={() => setSelectedMushaf(null)} className="absolute right-0 text-zad-border hover:text-[#C5A028] transition-colors p-2 z-10 cursor-pointer">
           <Icons.FaArrowRight size={24} />
        </button>
        <h2 className="text-3xl font-amiri font-bold text-center w-full text-[#D4B595] drop-shadow-sm">سور القرآن الكريم</h2>
        <div className="absolute left-0 text-sm font-cairo bg-zad-border/20 text-zad-border px-3 py-1 rounded-full z-10">
          {mushafs.find(m => m.id === selectedMushaf)?.name}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surahs.map((surah) => (
          <Link to={`/quran/${surah.number}`} key={surah.number} className="bg-white bg-opacity-60 border border-zad-border/40 rounded-lg p-4 flex justify-between items-center hover:bg-zad-border hover:text-white transition-colors cursor-pointer group shadow-sm">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative flex justify-center items-center w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 24 24" className="absolute inset-0 w-12 h-12 text-zad-border group-hover:text-white fill-current opacity-20">
                  <path d="M12 2L14.8 8.6L22 9.3L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.3L9.2 8.6L12 2Z"></path>
                </svg>
                <span className="font-cairo font-bold text-sm z-10">{surah.number}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-start gap-2 mb-1">
                  <h3 className="font-amiri font-bold text-xl">{surah.name}</h3>
                  <span className="text-[10px] font-cairo px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#8B7355] rounded border border-[#D4AF37]/20 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </span>
                </div>
                <p className="text-xs font-cairo opacity-70 group-hover:text-white">{surah.englishName}</p>
              </div>
            </div>
            <div className="text-left font-cairo text-sm opacity-80 whitespace-nowrap">
              {surah.numberOfAyahs} آيات
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SurahReader;
