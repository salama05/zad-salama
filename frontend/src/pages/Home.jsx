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
    { title: 'القرآن الكريم', path: '/quran', icon: <Icons.FaBookOpen size={48} />,  colSpanClass: 'col-span-2' },
    { title: 'المصحف الشريف', path: '/mushaf-index', icon: <Icons.FaBook size={40} />, colSpanClass: 'col-span-2', highlight: true, badge: '📖' },
    { title: 'الأذكار والأدعية', path: '/adhkar', icon: <Icons.FaHandsHelping size={40} />, colSpanClass: 'col-span-1' },
    { title: 'مواقيت الصلاة', path: '/prayer-times', icon: <Icons.FaMosque size={40} />, colSpanClass: 'col-span-1' },
    { title: 'تلاوات مختارة', path: '/recitations', icon: <Icons.FaMicrophone size={40} />, colSpanClass: 'col-span-1' },
    { title: 'مرئيات', path: '/videos', icon: <Icons.FaPlayCircle size={40} />, colSpanClass: 'col-span-1' },
  ];

  return (
    <div className="flex flex-col items-center page-enter-active">
      {/* Top Decoration */}
      <div className="w-full max-w-2xl h-8 border-t-4 border-b border-zad-border mb-8 opacity-70"></div>
      
      <h2 className="text-3xl font-noto font-bold text-zad-border mb-2 drop-shadow-sm text-center px-4 leading-relaxed tracking-wide">
        {userName ? `السلام عليكم ${userName}، رزقك الله من فضله ورحمته وفتح عليك أبواب الخير والبركة` : 'السلام عليكم، رزقك الله من فضله ورحمته وفتح عليك أبواب الخير والبركة'}
      </h2>
      <p className="text-lg font-cairo mb-12 opacity-80">اختر من القائمة للبدء</p>
      
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            to={card.path}
            className={`${card.colSpanClass || 'col-span-1'} aspect-square sm:aspect-auto sm:h-40 flex flex-col items-center justify-center p-6 border-2 ${card.highlight ? 'border-[#D4AF37] bg-gradient-to-br from-[#FBF8F1] to-[#F0EAD6]' : 'border-zad-border/50'} rounded-xl hover:border-zad-border hover:bg-zad-border hover:text-white transition-all transform hover:-translate-y-1 shadow-sm ${card.highlight ? '' : 'bg-white bg-opacity-40'} group cursor-pointer text-center relative overflow-hidden`}
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
      
      {/* Bottom Decoration */}
      <div className="w-full max-w-2xl h-8 border-b-4 border-t border-zad-border mt-16 opacity-70"></div>
    </div>
  );
}

export default Home;
