import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fa'; // More robust way to import

function Home() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('zadUserName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const cards = [
    { title: 'القرآن الكريم', path: '/quran', icon: <Icons.FaBookOpen size={28} />,  colSpanClass: 'col-span-2' },
    { title: 'المصحف الشريف', path: '/mushaf-index', icon: <Icons.FaBook size={28} />, colSpanClass: 'col-span-2', highlight: true, badge: '📖' },
    { title: 'الأذكار والأدعية', path: '/adhkar', icon: <Icons.FaHandsHelping size={28} />, colSpanClass: 'col-span-1' },
    { title: 'مواقيت الصلاة', path: '/prayer-times', icon: <Icons.FaMosque size={28} />, colSpanClass: 'col-span-1' },
    { title: 'تلاوات مختارة', path: '/recitations', icon: <Icons.FaMicrophone size={28} />, colSpanClass: 'col-span-1' },
    { title: 'مرئيات', path: '/videos', icon: <Icons.FaPlayCircle size={28} />, colSpanClass: 'col-span-1' },
  ];

  return (
    <div className="flex flex-col items-center page-enter-active pt-8">

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            to={card.path}
            className={`${card.colSpanClass || 'col-span-1'} ${card.colSpanClass === 'col-span-2' ? 'py-4 px-6 min-h-[100px]' : 'aspect-square sm:aspect-auto sm:h-32 p-4'} flex flex-col items-center justify-center border-2 ${card.highlight ? 'border-[#D4AF37] bg-gradient-to-br from-[#FBF8F1] to-[#F0EAD6]' : 'border-zad-border/50'} rounded-xl hover:border-zad-border hover:bg-zad-border hover:text-white transition-all transform hover:-translate-y-1 shadow-sm ${card.highlight ? '' : 'bg-white bg-opacity-40'} group cursor-pointer text-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 islamic-bg opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            {card.badge && (
              <span className="absolute top-2 left-2 text-xl">{card.badge}</span>
            )}
            <div className="text-zad-border group-hover:text-white transition-colors mb-4 z-10">
              {card.icon}
            </div>
            <h3 className="font-cairo font-bold text-xl z-10">{card.title}</h3>
            {card.title === 'القرآن الكريم' && (
              <p className="text-sm font-cairo mt-2 text-zad-border group-hover:text-white transition-colors z-10">
                زادك الله نوراً.. يرجى العلم أن هذا القسم يتطلب اتصالاً بالشبكة
              </p>
            )}
            {card.title === 'المصحف الشريف' && (
              <p className="text-sm font-cairo mt-2 text-zad-border group-hover:text-white transition-colors z-10">
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
