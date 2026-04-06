import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function Onboarding() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { sessionId } = useAppContext();

  const handleContinue = (e) => {
    e.preventDefault();
    if (name.trim()) localStorage.setItem('zadUserName', name.trim());
    navigate('/home');
  };

  const handleSkip = () => {
    // Save empty or placeholder
    localStorage.setItem('zadUserName', '');
    navigate('/home');
  };

  // If already onboarded, maybe redirect automatically in a real app,
  // but for now let's just show it.

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] page-enter-active">
      <div className="bg-zad-bg text-zad-text border-2 border-zad-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 islamic-bg opacity-30 pointer-events-none"></div>

        <h1 className="text-4xl font-amiri font-bold mb-4 text-[#D4B595] drop-shadow-sm">زاد السلامة</h1>
        <p className="mb-8 text-lg font-cairo">تطبيق إسلامي شامل بروح المصحف الشريف</p>
        
        <form onSubmit={handleContinue} className="relative z-10 flex flex-col space-y-4">
          <input 
            type="text" 
            placeholder="اسمك الكريم (اختياري)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-zad-border bg-white bg-opacity-50 text-center font-cairo text-lg focus:outline-none focus:ring-2 focus:ring-zad-border transition"
          />
          <button 
            type="submit" 
            className="w-full bg-[#D4B595] hover:bg-[#C5A028] text-white font-bold py-3 px-6 rounded-lg transition-colors font-cairo text-xl shadow-md"
          >
            متابعة
          </button>
          
          <button 
            type="button" 
            onClick={handleSkip}
            className="text-sm font-cairo underline decoration-zad-border/50 hover:text-zad-border transition-colors mt-2"
          >
            تخطي
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
