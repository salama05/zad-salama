import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adhkarCategories } from '../data/adhkar';
import * as Icons from 'react-icons/fa';
import { useBackNavigation } from '../hooks/useBackNavigation';
import WeeklyAchievementCircles from '../components/WeeklyAchievementCircles';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const CORE_ADHKAR_CATEGORY_IDS = ['morning', 'evening', 'wake_up', 'sleep'];

function Adhkar() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [counts, setCounts] = useState({});
  const [history, setHistory] = useState({});
  const [partialHistory, setPartialHistory] = useState([]);
  const navigate = useNavigate();

  // Handle hardware back button
  useBackNavigation(() => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate('/home');
    }
  });

  useEffect(() => {
    // Load tracking history from local storage
    const storedHistory = localStorage.getItem('zadAdhkarHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    const storedPartial = localStorage.getItem('zadAdhkarPartialHistory');
    if (storedPartial) {
      setPartialHistory(JSON.parse(storedPartial));
    }
  }, []);

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('zadAdhkarHistory', JSON.stringify(newHistory));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    // Load counts for today if previously saved, else reset
    const today = formatDate(new Date());
    const storedCounts = localStorage.getItem(`zadAdhkarCounts_${category.id}_${today}`);
    
    let initialCounts;
    if (storedCounts) {
      initialCounts = JSON.parse(storedCounts);
    } else {
      initialCounts = category.adhkar.reduce((acc, dhikr) => {
        acc[dhikr.id] = 0;
        return acc;
      }, {});
    }
    setCounts(initialCounts);
  };

  const increment = (id, target) => {
    if (counts[id] < target) {
      const newCounts = { ...counts, [id]: counts[id] + 1 };
      setCounts(newCounts);
      
      const today = formatDate(new Date());
      localStorage.setItem(`zadAdhkarCounts_${selectedCategory.id}_${today}`, JSON.stringify(newCounts));

      // Mark this day as partially read
      setPartialHistory(prev => {
        if (!prev.includes(today)) {
          const updated = [...prev, today];
          localStorage.setItem('zadAdhkarPartialHistory', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });

      // Check if all adhkar in this category are completed
      const allCompleted = selectedCategory.adhkar.every(
        (dhikr) => (newCounts[dhikr.id] || 0) >= dhikr.target
      );

      if (allCompleted) {
        setHistory(prev => {
          const currentDayHistory = prev[today] || [];
          if (!currentDayHistory.includes(selectedCategory.id)) {
            const updatedHistory = {
              ...prev,
              [today]: [...currentDayHistory, selectedCategory.id]
            };
            localStorage.setItem('zadAdhkarHistory', JSON.stringify(updatedHistory));
            return updatedHistory;
          }
          return prev;
        });
      }
    }
  };

  const reset = (id) => {
    const newCounts = { ...counts, [id]: 0 };
    setCounts(newCounts);
    
    const today = formatDate(new Date());
    localStorage.setItem(`zadAdhkarCounts_${selectedCategory.id}_${today}`, JSON.stringify(newCounts));
    
    // If we reset, we might want to remove this category from today's history if it was completed
    // (Optional logic, skipping for now to keep it simple, or implement if needed:
    // if it was fully completed, and now it's not, we remove it from history)
    const wasCompleted = selectedCategory.adhkar.every(
      (dhikr) => (counts[dhikr.id] || 0) >= dhikr.target
    );
    
    if (wasCompleted) {
      setHistory(prev => {
        const currentDayHistory = prev[today] || [];
        const updatedHistory = {
          ...prev,
          [today]: currentDayHistory.filter(catId => catId !== selectedCategory.id)
        };
        localStorage.setItem('zadAdhkarHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }
  };

  // Generate weekly progress for the last 7 days from core adhkar categories only
  const weeklyProgressData = useMemo(() => {
    const data = [];
    const today = new Date();
    const totalCoreCategories = CORE_ADHKAR_CATEGORY_IDS.length;
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);

      const dayHistory = Array.isArray(history[dateStr]) ? history[dateStr] : [];
      const completedCoreCategoriesCount = CORE_ADHKAR_CATEGORY_IDS.filter((id) => dayHistory.includes(id)).length;
      const percentage = Math.round((completedCoreCategoriesCount / totalCoreCategories) * 100);

      const dayName = d.toLocaleDateString('ar-SA', { weekday: 'short' }).replace('،', '').trim();
      data.push({
        id: dateStr,
        date: dateStr,
        name: dayName,
        percentage,
        completedCategoriesCount: completedCoreCategoriesCount,
      });
    }

    return data;
  }, [history]);

  // View Category List
  if (!selectedCategory) {
    return (
      <div className="page-enter-active">
        <div className="w-full flex items-center mb-12 relative max-w-2xl mx-auto px-4">
          <Link to="/home" className="absolute right-4 text-zad-border hover:text-[#C5A028] transition-colors p-2 z-10 cursor-pointer">
             <Icons.FaArrowRight size={24} />
          </Link>
          <h2 className="text-3xl font-amiri font-bold text-center w-full text-zad-border drop-shadow-sm">الأذكار والأدعية</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto px-4 mb-12">
          {adhkarCategories.map((cat) => {
            const IconComponent = Icons[cat.icon] || Icons.FaBookOpen;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className="flex flex-col items-center justify-center p-8 border-2 border-zad-border/50 rounded-2xl hover:border-zad-border hover:bg-zad-border hover:text-white transition-all transform hover:-translate-y-1 shadow-sm bg-white bg-opacity-60 group cursor-pointer text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 islamic-bg opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <IconComponent size={48} className="text-zad-border group-hover:text-white transition-colors mb-4 z-10" />
                <h3 className="font-amiri font-bold text-2xl z-10">{cat.title}</h3>
              </button>
            );
          })}
        </div>

        {/* Progress Chart Section */}
        <div className="w-full max-w-2xl mx-auto px-4 mb-20">
          <WeeklyAchievementCircles daysProgress={weeklyProgressData} totalCategories={CORE_ADHKAR_CATEGORY_IDS.length} />
        </div>
      </div>
    );
  }

  // View Specific Adhkar Category
  return (
    <div className="page-enter-active pb-10">
      <div className="flex items-center mb-8 relative max-w-2xl mx-auto px-4">
        <button 
          onClick={() => setSelectedCategory(null)} 
          className="absolute right-4 text-zad-border hover:text-[#C5A028] transition-colors p-2 z-10"
        >
           <Icons.FaArrowRight size={24} />
        </button>
        <h2 className="text-3xl font-amiri font-bold text-center w-full text-zad-border drop-shadow-sm">
          {selectedCategory.title}
        </h2>
      </div>

      <div className="flex flex-col space-y-6 max-w-2xl mx-auto px-4">
        {selectedCategory.adhkar.map((dhikr) => (
          <div key={dhikr.id} className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-sm border border-zad-border/30 relative overflow-hidden">
            <h3 className="font-amiri font-bold text-2xl md:text-3xl text-center mb-8 leading-relaxed !leading-[1.8] text-zad-text">
              {dhikr.text}
            </h3>

            <div className="flex justify-between items-center px-2">
              <span className="text-lg font-cairo font-bold opacity-70">
                الهدف: {dhikr.target}
              </span>

              <div className="flex items-center space-x-4 space-x-reverse">     
                <button
                  onClick={() => increment(dhikr.id, dhikr.target)}
                  disabled={counts[dhikr.id] === dhikr.target}
                  className={`w-16 h-16 rounded-full text-2xl flex justify-center items-center shadow-md active:scale-95 transition-all ${
                    counts[dhikr.id] === dhikr.target 
                      ? 'bg-green-500 text-white cursor-default' 
                      : 'bg-zad-border hover:bg-[#C5A028] text-white cursor-pointer'
                  }`}
                >
                  {counts[dhikr.id] === dhikr.target ? <Icons.FaCheck size={20} /> : counts[dhikr.id]}
                </button>
                <button 
                  onClick={() => reset(dhikr.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 text-sm font-bold"
                >
                  إعادة
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-200 absolute bottom-0 left-0 right-0">
              <div
                className={`h-full transition-all duration-300 ${counts[dhikr.id] === dhikr.target ? 'bg-green-500' : 'bg-zad-border'}`}    
                style={{ width: `${(counts[dhikr.id] / dhikr.target) * 100}%` }} 
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Adhkar;
