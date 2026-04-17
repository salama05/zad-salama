import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fa'; // More robust way to import
import { useTheme } from '../context/ThemeContext';

function Home() {
  const [userName, setUserName] = useState('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedName = localStorage.getItem('zadUserName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'Dark' ? 'Classic' : 'Dark');
  };

  const cards = [
    { title: 'القرآن الكريم', path: '/quran', icon: <Icons.FaBookOpen size={30} />, colSpanClass: 'col-span-2', bg: 'bg-[#F4EFE6]', border: 'border-[#D5C6A0]' },
    { title: 'المصحف الشريف', path: '/mushaf-index', icon: <Icons.FaBook size={30} />, colSpanClass: 'col-span-2', bg: 'bg-[#F3E7D3]', border: 'border-[#C8A97E]' },
    { title: 'مواقيت الصلاة', path: '/prayer-times', icon: <Icons.FaMosque size={30} />, colSpanClass: 'col-span-1', bg: 'bg-[#E8F3E8]', border: 'border-[#8FBF8F]' },
    { title: 'الأذكار والأدعية', path: '/adhkar', icon: <Icons.FaHandsHelping size={30} />, colSpanClass: 'col-span-1', bg: 'bg-[#E8F0F8]', border: 'border-[#8FAED6]' },
    { title: 'تلاوات مختارة', path: '/recitations', icon: <Icons.FaMicrophone size={30} />, colSpanClass: 'col-span-1', bg: 'bg-[#F0E8F8]', border: 'border-[#B39AD6]' },
    { title: 'مرئيات', path: '/videos', icon: <Icons.FaPlayCircle size={30} />, colSpanClass: 'col-span-1', bg: 'bg-[#F8EFE8]', border: 'border-[#D6A98F]' },
  ];

  return (
    <div className="flex flex-col items-center page-enter-active pt-8 relative">
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-0 right-4 sm:right-8 p-3 rounded-full bg-white/80 dark:bg-zad-darkBg/80 shadow-md border border-zad-border/20 text-[#5A4526] dark:text-[#D4AF37] hover:scale-110 transition-transform cursor-pointer z-50"
        title="تبديل الواجهة (ليلي/نهاري)"
      >
        {theme === 'Dark' ? <Icons.FaSun size={20} /> : <Icons.FaMoon size={20} />}
      </button>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-10 px-2 mt-6">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            to={card.path}
            className={`
              ${card.colSpanClass || 'col-span-1'} 
              ${card.colSpanClass === 'col-span-2' ? 'py-5 px-6 min-h-[100px]' : 'aspect-square sm:aspect-auto sm:h-36 p-4'} 
              flex flex-col items-center justify-center 
              border-[1.5px] ${card.border} ${card.bg} 
              rounded-2xl shadow-sm hover:shadow-md 
              transition-all duration-300 transform hover:scale-[1.02] hover:brightness-95 
              group cursor-pointer text-center relative overflow-hidden
            `}
          >
            <div className="absolute inset-0 islamic-bg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            {card.badge && (
              <span className="absolute top-3 left-3 text-2xl drop-shadow-sm">{card.badge}</span>
            )}
            <div className="text-[#5A4526] mb-3 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              {card.icon}
            </div>
            <h3 className="font-cairo font-bold text-lg sm:text-xl text-[#4A3B2A] z-10">{card.title}</h3>
            {card.title === 'القرآن الكريم' && (
              <p className="text-xs sm:text-sm font-cairo mt-1 text-[#6D5A42] z-10 opacity-90">
                يتطلب اتصالاً بالإنترنت
              </p>
            )}
            {card.title === 'المصحف الشريف' && (
              <p className="text-xs sm:text-sm font-cairo mt-1 text-[#6D5A42] z-10 opacity-90">
                يعمل بدون إنترنت
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
