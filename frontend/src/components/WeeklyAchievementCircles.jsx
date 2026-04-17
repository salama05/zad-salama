import React from 'react';
import * as Icons from 'react-icons/fa';

const CircleProgress = ({ percentage, size = 50, strokeWidth = 4, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className='relative flex items-center justify-center' style={{ width: size, height: size }}>
      <svg width={size} height={size} className='transform -rotate-90'>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke='currentColor' strokeWidth={strokeWidth} fill='transparent' className='text-gray-200 dark:text-gray-700' />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke='currentColor' strokeWidth={strokeWidth} fill='transparent' strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap='round' className='text-[#D4AF37] dark:text-[#C8A97E] transition-all duration-1000 ease-out' />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>{children}</div>
    </div>
  );
};

const clampPercentage = (value) => {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const WeeklyAchievementCircles = ({ daysProgress = [], totalCategories = 0 }) => {
  const safeDaysProgress = Array.isArray(daysProgress) ? daysProgress : [];
  const overallProgress = safeDaysProgress.length
    ? Math.round(safeDaysProgress.reduce((sum, day) => sum + clampPercentage(day.percentage || 0), 0) / safeDaysProgress.length)
    : 0;

  const activeDays = safeDaysProgress.filter((day) => clampPercentage(day.percentage || 0) > 0).length;

  return (
    <div className='w-full bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 shadow-sm border border-[#D5C6A0] dark:border-gray-800'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-xl font-bold text-[#5A4526] dark:text-[#D4AF37] flex items-center gap-2'><Icons.FaBullseye className='text-[#8FBF8F] dark:text-[#D4AF37]' /> إنجازي الأسبوعي</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>متابعة إنجاز الأذكار خلال آخر 7 أيام</p>
        </div>
        <div className='flex flex-col items-center'>
          <CircleProgress percentage={overallProgress} size={60} strokeWidth={5}><span className='text-sm font-bold text-[#5A4526] dark:text-[#D4AF37]'>{overallProgress}%</span></CircleProgress>
          <span className='text-xs text-gray-500 dark:text-gray-400 mt-1'>الإجمالي</span>
        </div>
      </div>
      <div className='text-xs text-gray-500 dark:text-gray-400 mb-2'>أيام النشاط: {activeDays}/7{totalCategories > 0 ? ` • إجمالي الفئات: ${totalCategories}` : ''}</div>
      <div className='flex justify-between items-end mt-4 overflow-x-auto pb-2 gap-2 scrollbar-hide'>
        {safeDaysProgress.map((day) => {
          const percentage = clampPercentage(day.percentage || 0);
          return (
          <div key={day.id || day.date || day.name} className='flex flex-col items-center flex-1 min-w-[45px]' title={day.date || ''}>
            <CircleProgress percentage={percentage} size={45} strokeWidth={4}>
              {percentage === 100 ? <Icons.FaCheck className='text-[#8FBF8F] dark:text-[#8FBF8F] text-sm' /> : <span className='text-[10px] text-gray-600 dark:text-gray-300'>{percentage}%</span>}
            </CircleProgress>
            <span className='text-[10px] md:text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium whitespace-nowrap'>{day.name}</span>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default WeeklyAchievementCircles;
